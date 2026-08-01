// Button Bounce Timeline Visualizer
// An interactive p5.js MicroSim for the Robot Faces intelligent textbook.
// Chapter 14: Building an Expression Menu & Live Controls
// Bloom level: Analyze (L4) - differentiate, examine
//
// CANVAS_HEIGHT: 488
//
// One simulated press draws two traces on a shared millisecond timeline: the
// raw pin reading with its contact bounce, and the debounced output your code
// actually reacts to. The traces are static so they can be examined closely.

// ---------------------------------------------------------------------
// Canvas layout
// ---------------------------------------------------------------------
let canvasWidth = 700;          // initial width, replaced by the container width
let drawHeight = 368;           // two timeline panels plus the event log
let controlHeight = 120;        // three rows of controls
let canvasHeight = drawHeight + controlHeight;
let margin = 25;
let defaultTextSize = 16;
let sliderLeftMargin = 250;

// ---------------------------------------------------------------------
// Timeline constants
// ---------------------------------------------------------------------
const T_START = -12;            // a little idle time before the press, in ms
const T_END = 130;              // right edge of both timelines, in ms

// ---------------------------------------------------------------------
// Simulation state
// ---------------------------------------------------------------------
let bounceSeverity = 4;         // number of rapid spikes, 1 to 8
let debounceMs = 30;            // the debounce time constant, 5 to 100 ms
let bounceDuration = 0;         // how long the contacts keep chattering, in ms

let hasPress = false;           // false right after Reset
let rawEdges = [];              // times where the raw pin reading flips
let acceptedPresses = [];       // presses the debounce code counted
let logLines = [];              // the event log, oldest first

// Controls
let pressButton, resetButton, severitySlider, debounceSlider;

// ---------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------
function setup() {
  updateCanvasSize();
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent(document.querySelector('main'));

  const parentMain = document.querySelector('main');

  pressButton = createButton('Press the Button');
  pressButton.parent(parentMain);
  pressButton.mousePressed(simulatePress);

  resetButton = createButton('Reset');
  resetButton.parent(parentMain);
  resetButton.mousePressed(resetSimulation);

  severitySlider = createSlider(1, 8, bounceSeverity, 1);
  severitySlider.parent(parentMain);
  severitySlider.input(function () {
    bounceSeverity = severitySlider.value();
    if (hasPress) { simulatePress(); }
  });

  debounceSlider = createSlider(5, 100, debounceMs, 5);
  debounceSlider.parent(parentMain);
  debounceSlider.input(function () {
    debounceMs = debounceSlider.value();
    // The raw trace does not change, only how the debounce code reads it.
    if (hasPress) { applyDebounce(); }
  });

  layoutControls();
  // Button widths are only known after the browser lays them out, so run the
  // layout once more on the next tick in case the first read came in early.
  window.setTimeout(layoutControls, 80);

  // Start with one press already on screen so the concept is visible on load.
  simulatePress();

  describe('Two stacked timelines share one millisecond axis. The top ' +
    'timeline shows the raw pin reading, which chatters between HIGH and LOW ' +
    'for a few milliseconds after the contacts touch. The bottom timeline ' +
    'shows the debounced output. A shaded band marks the debounce window. ' +
    'Shrinking the window below the bounce duration makes a second false ' +
    'press appear on the debounced timeline and in the event log.');
}

// ---------------------------------------------------------------------
// Responsive sizing
// ---------------------------------------------------------------------
function updateCanvasSize() {
  const container = document.querySelector('main');
  if (container && container.offsetWidth > 0) {
    canvasWidth = container.offsetWidth;
  }
}

function windowResized() {
  updateCanvasSize();
  resizeCanvas(canvasWidth, canvasHeight);
  layoutControls();
}

function layoutControls() {
  pressButton.position(10, drawHeight + 8);
  const nextX = 10 + pressButton.elt.offsetWidth + 10;
  resetButton.position(nextX, drawHeight + 8);

  const sliderW = max(60, canvasWidth - sliderLeftMargin - margin);
  severitySlider.position(sliderLeftMargin, drawHeight + 46);
  severitySlider.size(sliderW);
  debounceSlider.position(sliderLeftMargin, drawHeight + 82);
  debounceSlider.size(sliderW);
}

// ---------------------------------------------------------------------
// Generating one bouncing press
// ---------------------------------------------------------------------

// Real switch contacts do not close cleanly. They chatter between touching
// and not touching for a few milliseconds. The severity slider sets how many
// of those spikes appear and how long the chattering lasts.
function simulatePress() {
  hasPress = true;
  bounceDuration = 4 + bounceSeverity * 1.6;

  // A fixed seed per severity keeps the trace the same every time, so two
  // students comparing screens see the same picture.
  randomSeed(1234 + bounceSeverity);

  // The first edge is at t = 0. After it come 2 edges per spike, so the trace
  // always ends on a LOW: the contacts finally settle closed.
  const extraEdges = 2 * bounceSeverity;
  const times = [];
  for (let i = 0; i < extraEdges; i++) {
    times.push(random(0.6, bounceDuration));
  }
  times.sort(function (a, b) { return a - b; });

  // Push edges apart so none of them land on top of each other on screen.
  let prev = 0;
  for (let i = 0; i < times.length; i++) {
    times[i] = max(times[i], prev + 0.7);
    prev = times[i];
  }
  // Rescale so the last edge lands exactly at the end of the bounce.
  if (prev > 0) {
    for (let i = 0; i < times.length; i++) {
      times[i] = times[i] * bounceDuration / prev;
    }
  }

  rawEdges = [0].concat(times);
  applyDebounce();
}

function resetSimulation() {
  hasPress = false;
  rawEdges = [];
  acceptedPresses = [];
  logLines = [];
}

// The raw pin reading is HIGH before the first edge, then flips at each edge.
// Even-numbered edges take it LOW, odd-numbered edges take it back HIGH.
function levelAfterEdge(index) {
  return (index % 2 === 0) ? 0 : 1;
}

// ---------------------------------------------------------------------
// The debounce rule
// ---------------------------------------------------------------------
// This is the same rule the chapter's MicroPython code uses: a LOW reading
// counts as a new press only if it arrives more than DEBOUNCE_MS after the
// last press that was already counted.
function applyDebounce() {
  acceptedPresses = [];
  let lastAccept = -1e9;

  for (let i = 0; i < rawEdges.length; i++) {
    if (levelAfterEdge(i) !== 0) { continue; }   // only falling edges count
    const t = rawEdges[i];
    if (t - lastAccept > debounceMs) {
      acceptedPresses.push({
        t: t,
        // The rising edge just before this one is when the code saw a release.
        prevRise: (i > 0) ? rawEdges[i - 1] : null
      });
      lastAccept = t;
    }
  }
  buildLog();
}

// ---------------------------------------------------------------------
// The event log
// ---------------------------------------------------------------------
function buildLog() {
  logLines = [];
  if (!hasPress) { return; }

  logLines.push({
    txt: 't=0.0 ms: contact bounce begins - press accepted',
    col: '#2E7D32'
  });

  let ignoredShown = 0;
  let ignoredTotal = 0;

  for (let i = 1; i < rawEdges.length; i++) {
    const t = rawEdges[i];
    const wasAccepted = acceptedPresses.some(function (p) {
      return abs(p.t - t) < 0.0001;
    });
    if (wasAccepted) { continue; }

    if (t <= debounceMs) {
      ignoredTotal++;
      if (ignoredShown < 2) {
        logLines.push({
          txt: 't=' + nf(t, 1, 1) + ' ms: bounce ignored, inside the ' +
               debounceMs + ' ms window',
          col: '#607D8B'
        });
        ignoredShown++;
      }
    }
  }

  if (ignoredTotal > ignoredShown) {
    logLines.push({
      txt: '  (' + (ignoredTotal - ignoredShown) + ' more bounces ignored)',
      col: '#90A4AE'
    });
  }

  // The first bounce that slipped past the window, plus a count of any others.
  if (acceptedPresses.length > 1) {
    const extra = acceptedPresses.length - 2;
    logLines.push({
      txt: 't=' + nf(acceptedPresses[1].t, 1, 1) +
           ' ms: bounce ACCEPTED as a second press - FALSE' +
           (extra > 0 ? ' (and ' + extra + ' more)' : ''),
      col: '#C62828'
    });
  }

  if (acceptedPresses.length === 1) {
    logLines.push({
      txt: 't=' + nf(debounceMs, 1, 1) + ' ms: window closes, contacts settled at t=' +
           nf(bounceDuration, 1, 1) + ' ms - one clean press',
      col: '#2E7D32'
    });
  } else {
    logLines.push({
      txt: 'Result: ' + acceptedPresses.length +
           ' presses counted from one physical press.',
      col: '#C62828'
    });
  }
}

// ---------------------------------------------------------------------
// Panel geometry
// ---------------------------------------------------------------------
function getLayout() {
  return {
    panelX: 10,
    panelW: max(150, canvasWidth - 20),
    panelH: 92,
    rawY: 46,
    cleanY: 144,
    logY: 242,
    logH: 120
  };
}

// Convert a time in milliseconds to an x pixel on the shared axis.
function timeToX(ms, layout) {
  const axisX = layout.panelX + 46;
  const axisW = layout.panelW - 60;
  return axisX + ((ms - T_START) / (T_END - T_START)) * axisW;
}

// ---------------------------------------------------------------------
// Draw
// ---------------------------------------------------------------------
function draw() {
  const layout = getLayout();

  // Background regions
  fill('aliceblue');
  stroke('silver');
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  // Title
  noStroke();
  fill('black');
  textSize(19);
  textAlign(CENTER, TOP);
  text('One Press, Two Very Different Signals', canvasWidth / 2, 6);

  // Comparison caption: this is the whole story in one line.
  const tooShort = hasPress && debounceMs < bounceDuration;
  const capText = hasPress
    ? 'Bounce lasts ' + nf(bounceDuration, 1, 1) + ' ms. Debounce window is ' +
      debounceMs + ' ms.' + (tooShort ? '  Window is too short!' : '  Window is long enough.')
    : 'Press the button to draw a trace.';
  fill(tooShort ? '#C62828' : '#455A64');
  textSize(fitTextSize(capText, canvasWidth - 20, 14, 9));
  text(capText, canvasWidth / 2, 28);

  drawSignalPanel(layout, true);
  drawSignalPanel(layout, false);
  drawEventLog(layout);
  drawControlLabels();

  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
}

// ---------------------------------------------------------------------
// One signal panel
// ---------------------------------------------------------------------
function drawSignalPanel(layout, isRaw) {
  const x = layout.panelX;
  const y = isRaw ? layout.rawY : layout.cleanY;
  const w = layout.panelW;
  const h = layout.panelH;

  stroke('#B0BEC5');
  fill('white');
  rect(x, y, w, h, 8);
  noStroke();

  const yHigh = y + 33;
  const yLow = y + 58;

  // Shaded band marking the debounce window that opens at the first edge.
  if (hasPress) {
    noStroke();
    fill('rgba(255, 213, 79, 0.35)');
    const bx = timeToX(0, layout);
    const bw = timeToX(debounceMs, layout) - bx;
    rect(bx, y + 22, bw, 46);
  }

  // Panel heading
  fill('black');
  textAlign(LEFT, TOP);
  textSize(14);
  text(isRaw ? 'Raw pin reading' : 'Debounced output', x + 10, y + 6);

  // Right-hand summary for this panel
  let noteText = '';
  let noteColor = '#607D8B';
  if (hasPress) {
    if (isRaw) {
      noteText = rawEdges.length + ' edges in ' + nf(bounceDuration, 1, 1) + ' ms';
    } else if (acceptedPresses.length === 1) {
      noteText = 'Presses counted: 1';
      noteColor = '#2E7D32';
    } else {
      noteText = 'Presses counted: ' + acceptedPresses.length + ' - wrong!';
      noteColor = '#C62828';
    }
  }
  fill(noteColor);
  textAlign(RIGHT, TOP);
  textSize(12);
  text(noteText, x + w - 10, y + 8);
  textAlign(LEFT, TOP);

  // HIGH and LOW guide labels
  fill('#90A4AE');
  textSize(11);
  textAlign(LEFT, CENTER);
  text('HIGH', x + 8, yHigh);
  text('LOW', x + 8, yLow);
  textAlign(LEFT, TOP);

  // The trace itself
  const transitions = isRaw ? rawTransitions() : debouncedTransitions();
  stroke(isRaw ? '#1565C0' : '#2E7D32');
  strokeWeight(2);
  noFill();
  let level = 1;                                   // idle HIGH thanks to the pull-up
  let prevX = timeToX(T_START, layout);
  for (const tr of transitions) {
    const ex = timeToX(tr.t, layout);
    line(prevX, level ? yHigh : yLow, ex, level ? yHigh : yLow);
    line(ex, level ? yHigh : yLow, ex, tr.level ? yHigh : yLow);
    level = tr.level;
    prevX = ex;
  }
  line(prevX, level ? yHigh : yLow, timeToX(T_END, layout), level ? yHigh : yLow);
  strokeWeight(1);
  noStroke();

  // Markers for the accepted presses on the debounced panel.
  if (!isRaw && hasPress) {
    for (let i = 0; i < acceptedPresses.length; i++) {
      const px = timeToX(acceptedPresses[i].t, layout);
      const good = (i === 0);
      stroke(good ? '#2E7D32' : '#C62828');
      strokeWeight(2);
      line(px, y + 22, px, yLow + 6);
      strokeWeight(1);
      noStroke();
      // Only the first real press and the first false press get a label, so
      // a long chain of false presses does not turn into a wall of text.
      // The real press is labeled to the left of its marker and the false one
      // to the right, so the two labels cannot collide.
      if (i <= 1) {
        fill(good ? '#2E7D32' : '#C62828');
        textSize(11);
        textAlign(good ? RIGHT : LEFT, TOP);
        text(good ? 'press 1' : 'false press', px + (good ? -4 : 4), y + 22);
        textAlign(LEFT, TOP);
      }
    }
  }

  // Time axis under the trace
  drawTimeAxis(layout, yLow + 12);
}

// The raw reading flips at every edge in the bounce.
function rawTransitions() {
  const out = [];
  for (let i = 0; i < rawEdges.length; i++) {
    out.push({ t: rawEdges[i], level: levelAfterEdge(i) });
  }
  return out;
}

// The debounced output only moves at the edges the debounce rule accepted.
// A second accepted press means the code also saw the release just before it,
// which is the extra step that should never be there.
function debouncedTransitions() {
  const out = [];
  for (let i = 0; i < acceptedPresses.length; i++) {
    if (i > 0 && acceptedPresses[i].prevRise !== null) {
      out.push({ t: acceptedPresses[i].prevRise, level: 1 });
    }
    out.push({ t: acceptedPresses[i].t, level: 0 });
  }
  return out;
}

function drawTimeAxis(layout, y) {
  stroke('#CFD8DC');
  strokeWeight(1);
  line(timeToX(0, layout), y, timeToX(T_END, layout), y);
  noStroke();
  fill('#90A4AE');
  textSize(10);
  textAlign(CENTER, TOP);
  for (let t = 0; t <= T_END; t += 25) {
    const tx = timeToX(t, layout);
    stroke('#CFD8DC');
    line(tx, y - 3, tx, y + 3);
    noStroke();
    text(t + ' ms', tx, y + 5);
  }
  textAlign(LEFT, TOP);
}

// ---------------------------------------------------------------------
// The event log
// ---------------------------------------------------------------------
function drawEventLog(layout) {
  const x = layout.panelX;
  const y = layout.logY;
  const w = layout.panelW;
  const h = layout.logH;

  stroke('#B0BEC5');
  fill('white');
  rect(x, y, w, h, 8);
  noStroke();

  fill('black');
  textSize(14);
  textAlign(LEFT, TOP);
  text('Event log', x + 10, y + 6);

  if (logLines.length === 0) {
    fill('#90A4AE');
    textSize(12);
    text('Click Press the Button to record a press.', x + 10, y + 30);
    return;
  }

  let ly = y + 26;
  const lineH = 15;
  const innerW = w - 20;

  // Pick one size that lets every line fit the panel width.
  let size = 13;
  for (const ln of logLines) {
    size = min(size, fitTextSize(ln.txt, innerW, 13, 8));
  }
  textSize(size);

  for (const ln of logLines) {
    if (ly + lineH > y + h - 3) { break; }
    fill(ln.col);
    text(ln.txt, x + 10, ly);
    ly += lineH;
  }
}

// Shrink a text size until the string fits inside maxW pixels.
function fitTextSize(str, maxW, startSize, minSize) {
  let size = startSize;
  textSize(size);
  while (textWidth(str) > maxW && size > minSize) {
    size -= 1;
    textSize(size);
  }
  return size;
}

// ---------------------------------------------------------------------
// Control-strip labels
// ---------------------------------------------------------------------
function drawControlLabels() {
  noStroke();
  fill('black');
  textSize(14);
  textAlign(LEFT, CENTER);
  text('Bounce severity: ' + bounceSeverity + ' spikes', 10, drawHeight + 56);
  text('Debounce time constant: ' + debounceMs + ' ms', 10, drawHeight + 92);
  textSize(defaultTextSize);
}
