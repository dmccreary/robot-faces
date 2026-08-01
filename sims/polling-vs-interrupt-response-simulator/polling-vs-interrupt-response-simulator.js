// Polling vs Interrupt Response Simulator
// An interactive p5.js MicroSim for the Robot Faces intelligent textbook.
// Chapter 13: Interactive Controls - Inputs & Concurrency
// Bloom level: Analyze (L4) - differentiate, examine
//
// CANVAS_HEIGHT: 450
//
// Two panels share one simulated millisecond clock and one simulated button.
// The polling panel can only look at the button at fixed loop-check ticks.
// The interrupt panel is notified the instant the press begins.

// ---------------------------------------------------------------------
// Canvas layout
// ---------------------------------------------------------------------
let canvasWidth = 700;          // initial width, replaced by the container width
let drawHeight = 330;           // two timeline panels plus a hint line
let controlHeight = 120;        // three rows of controls
let canvasHeight = drawHeight + controlHeight;
let margin = 25;
let defaultTextSize = 16;
let sliderLeftMargin = 260;

// ---------------------------------------------------------------------
// Simulation constants
// ---------------------------------------------------------------------
const WINDOW_MS = 600;          // how much simulated time one timeline shows
const SLOW_FACTOR = 10;         // simulated time runs 10x slower than real time
const FLASH_MS = 200;           // how long a detection flash stays visible
const MAX_PRESSES = 5;          // press bars kept on the timelines
const MAX_LOG_ENTRIES = 3;      // press records kept in the event log

// ---------------------------------------------------------------------
// Simulation state
// ---------------------------------------------------------------------
let simTime = 0;                // simulated milliseconds, wraps at WINDOW_MS
let pressDuration = 20;         // how long the finger holds the button, in ms
let tickInterval = 50;          // gap between polling-loop checks, in ms

let pressList = [];             // presses currently drawn on the timelines
let eventLog = [];              // newest press first

// Controls
let pressButton, resetButton, durationSlider, intervalSlider;

// ---------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------
function setup() {
  updateCanvasSize();
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent(document.querySelector('main'));

  const parentMain = document.querySelector('main');

  pressButton = createButton('Press Button Now');
  pressButton.parent(parentMain);
  pressButton.mousePressed(function () {
    registerPress(simTime);
  });

  resetButton = createButton('Reset');
  resetButton.parent(parentMain);
  resetButton.mousePressed(resetSimulation);

  durationSlider = createSlider(5, 500, pressDuration, 5);
  durationSlider.parent(parentMain);
  durationSlider.input(function () {
    pressDuration = durationSlider.value();
  });

  intervalSlider = createSlider(10, 200, tickInterval, 10);
  intervalSlider.parent(parentMain);
  intervalSlider.input(function () {
    tickInterval = intervalSlider.value();
  });

  layoutControls();
  // Button widths are only known after the browser lays them out, so run the
  // layout once more on the next tick in case the first read came in early.
  window.setTimeout(layoutControls, 80);

  describe('Two stacked timelines share one simulated clock and one simulated ' +
    'button. The polling timeline shows tick marks at each loop check; the ' +
    'interrupt timeline has no ticks because a handler can fire at any ' +
    'instant. Pressing the button draws a shaded press bar on both timelines ' +
    'and reports whether the polling loop caught the press or missed it.');
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
  durationSlider.position(sliderLeftMargin, drawHeight + 46);
  durationSlider.size(sliderW);
  intervalSlider.position(sliderLeftMargin, drawHeight + 82);
  intervalSlider.size(sliderW);
}

// ---------------------------------------------------------------------
// Panel geometry, shared by draw() and mousePressed()
// ---------------------------------------------------------------------
function getLayout() {
  const logW = constrain(canvasWidth * 0.32, 170, 265);
  const logX = canvasWidth - logW - 10;
  const panelX = 10;
  const panelW = max(120, logX - panelX - 12);
  return {
    logX: logX,
    logW: logW,
    panelX: panelX,
    panelW: panelW,
    panelH: 116,
    panel1Y: 52,
    panel2Y: 176,
    axisX: panelX + 14,
    axisW: panelW - 28
  };
}

// Convert a simulated time in milliseconds to an x pixel on the timeline.
function timeToX(ms, layout) {
  return layout.axisX + (ms / WINDOW_MS) * layout.axisW;
}

// Convert an x pixel back to a simulated time in milliseconds.
function xToTime(px, layout) {
  return ((px - layout.axisX) / layout.axisW) * WINDOW_MS;
}

// ---------------------------------------------------------------------
// The simulated button press
// ---------------------------------------------------------------------

// A press begins at time t and lasts pressDuration milliseconds. The polling
// loop only looks at the pin at times 0, tickInterval, 2 * tickInterval, and
// so on, so it sees the press only when one of those ticks lands inside the
// press. The interrupt handler is called by the hardware at time t itself.
function registerPress(atTime) {
  const startMs = round(constrain(atTime, 0, WINDOW_MS));
  const endMs = startMs + pressDuration;

  // The first polling check at or after the press begins.
  const nextTick = ceil(startMs / tickInterval) * tickInterval;
  const caught = (nextTick <= endMs);

  const entry = {
    startMs: startMs,
    endMs: endMs,
    duration: pressDuration,
    interval: tickInterval,
    nextTick: nextTick,
    caught: caught,
    flashUntil: millis() + FLASH_MS * 3
  };

  pressList.push(entry);
  if (pressList.length > MAX_PRESSES) {
    pressList.shift();
  }

  eventLog.unshift(entry);
  if (eventLog.length > MAX_LOG_ENTRIES) {
    eventLog.pop();
  }
}

// Clicking directly on either timeline places a press at that exact instant.
// That lets a learner aim a very short press into the gap between two ticks.
function mousePressed() {
  const layout = getLayout();
  const inPanel1 = mouseY >= layout.panel1Y && mouseY <= layout.panel1Y + layout.panelH;
  const inPanel2 = mouseY >= layout.panel2Y && mouseY <= layout.panel2Y + layout.panelH;
  const inAxis = mouseX >= layout.axisX && mouseX <= layout.axisX + layout.axisW;

  if (inAxis && (inPanel1 || inPanel2)) {
    registerPress(xToTime(mouseX, layout));
  }
}

function resetSimulation() {
  simTime = 0;
  pressList = [];
  eventLog = [];
}

// ---------------------------------------------------------------------
// Draw
// ---------------------------------------------------------------------
function draw() {
  // Advance the shared simulated clock. deltaTime is real milliseconds since
  // the previous frame; dividing slows the sweep enough to aim a press.
  simTime += deltaTime / SLOW_FACTOR;
  if (simTime > WINDOW_MS) {
    simTime -= WINDOW_MS;
  }

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
  text('Can Each Approach See the Press?', canvasWidth / 2, 6);

  // Shared clock caption
  const clockText = 'Shared simulated clock: t = ' + nf(simTime, 1, 0) + ' ms of ' +
    WINDOW_MS + ' ms, running ' + SLOW_FACTOR + 'x slower than real hardware';
  fill('#455A64');
  textSize(fitTextSize(clockText, canvasWidth - 20, 13, 9));
  text(clockText, canvasWidth / 2, 30);

  drawTimelinePanel(layout, true);
  drawTimelinePanel(layout, false);
  drawEventLog(layout);

  // Hint line under the panels
  const hintText = 'Click on either timeline to place a press at that exact ' +
    'instant, or use Press Button Now to press at the moving cursor.';
  noStroke();
  fill('#455A64');
  textAlign(CENTER, TOP);
  textSize(fitTextSize(hintText, canvasWidth - 20, 12, 8));
  text(hintText, canvasWidth / 2, layout.panel2Y + layout.panelH + 8);

  drawControlLabels();
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
}

// ---------------------------------------------------------------------
// One timeline panel
// ---------------------------------------------------------------------
function drawTimelinePanel(layout, isPolling) {
  const x = layout.panelX;
  const y = isPolling ? layout.panel1Y : layout.panel2Y;
  const w = layout.panelW;
  const h = layout.panelH;

  // The most recent press decides what this panel reports.
  const latest = eventLog.length > 0 ? eventLog[0] : null;
  const flashing = latest && millis() < latest.flashUntil;
  const panelGood = !isPolling || (latest && latest.caught);

  // Panel background. A wash of green or red marks the latest verdict.
  stroke('#B0BEC5');
  if (flashing) {
    fill(panelGood ? '#E8F5E9' : '#FFEBEE');
  } else {
    fill('white');
  }
  rect(x, y, w, h, 8);
  noStroke();

  // Panel heading
  const heading = isPolling ? 'Polling loop' : 'Interrupt handler';
  fill('black');
  textAlign(LEFT, TOP);
  textSize(15);
  text(heading, x + 10, y + 7);

  // One-line reminder of how this approach works
  const subText = isPolling
    ? 'Reads the pin only at each loop check, every ' + tickInterval + ' ms'
    : 'Hardware calls the handler the instant the pin changes';
  fill('#607D8B');
  textSize(fitTextSize(subText, w - 20, 12, 8));
  text(subText, x + 10, y + 26);

  // Timeline track
  const trackY = y + 46;
  const trackH = 24;
  fill('#ECEFF1');
  noStroke();
  rect(layout.axisX, trackY, layout.axisW, trackH, 4);

  if (isPolling) {
    // Tick marks: the only moments this loop is able to read the pin.
    stroke('#78909C');
    strokeWeight(1);
    for (let t = 0; t <= WINDOW_MS; t += tickInterval) {
      const tx = timeToX(t, layout);
      line(tx, trackY - 5, tx, trackY + trackH + 5);
    }
    noStroke();
  } else {
    // No ticks: the handler is always listening, so the whole track is live.
    noStroke();
    fill('#B2DFDB');
    rect(layout.axisX, trackY, layout.axisW, trackH, 4);
    fill('#00695C');
    textAlign(CENTER, CENTER);
    textSize(11);
    text('always listening', layout.axisX + layout.axisW / 2, trackY + trackH / 2);
    textAlign(LEFT, TOP);
  }

  // Press bars. Every press is drawn on both timelines at the same place.
  for (const entry of pressList) {
    const px = timeToX(entry.startMs, layout);
    const pw = max(2, timeToX(min(entry.endMs, WINDOW_MS), layout) - px);
    const good = !isPolling || entry.caught;

    noStroke();
    fill(good ? 'rgba(46,125,50,0.45)' : 'rgba(198,40,40,0.45)');
    rect(px, trackY - 3, pw, trackH + 6, 3);

    if (isPolling && entry.caught) {
      // Highlight the tick that actually saw the press.
      const cx = timeToX(entry.nextTick, layout);
      stroke('#2E7D32');
      strokeWeight(3);
      line(cx, trackY - 8, cx, trackY + trackH + 8);
      strokeWeight(1);
      noStroke();
    }
    if (!isPolling) {
      // The handler fires exactly at the leading edge of the press.
      stroke('#2E7D32');
      strokeWeight(3);
      line(px, trackY - 8, px, trackY + trackH + 8);
      strokeWeight(1);
      noStroke();
    }
  }

  // The moving cursor showing "now" on the shared clock.
  const cursorX = timeToX(simTime, layout);
  stroke('#FDD835');
  strokeWeight(2);
  line(cursorX, trackY - 8, cursorX, trackY + trackH + 8);
  strokeWeight(1);
  noStroke();

  // Axis end labels
  fill('#607D8B');
  textSize(11);
  textAlign(LEFT, TOP);
  text('0 ms', layout.axisX, trackY + trackH + 6);
  textAlign(RIGHT, TOP);
  text(WINDOW_MS + ' ms', layout.axisX + layout.axisW, trackY + trackH + 6);
  textAlign(LEFT, TOP);

  // Verdict line for the latest press
  let verdictText;
  let verdictColor;
  if (!latest) {
    verdictText = 'No press yet.';
    verdictColor = '#90A4AE';
  } else if (isPolling) {
    verdictColor = latest.caught ? '#2E7D32' : '#C62828';
    verdictText = latest.caught
      ? 'CAUGHT: the check at t=' + latest.nextTick + ' ms landed inside the press.'
      : 'MISSED: the press ended at t=' + latest.endMs +
        ' ms, before the check at t=' + latest.nextTick + ' ms.';
  } else {
    verdictColor = '#2E7D32';
    verdictText = 'CAUGHT: handler fired at t=' + latest.startMs +
      ' ms, the instant the press began.';
  }
  fill(verdictColor);
  textSize(fitTextSize(verdictText, w - 20, 13, 8));
  text(verdictText, x + 10, y + h - 22);
}

// ---------------------------------------------------------------------
// The shared event log
// ---------------------------------------------------------------------
function drawEventLog(layout) {
  const x = layout.logX;
  const y = layout.panel1Y;
  const w = layout.logW;
  const h = layout.panel2Y + layout.panelH - layout.panel1Y;

  stroke('#B0BEC5');
  fill('white');
  rect(x, y, w, h, 8);
  noStroke();

  fill('black');
  textSize(14);
  textAlign(LEFT, TOP);
  text('Event log', x + 10, y + 8);

  if (eventLog.length === 0) {
    fill('#90A4AE');
    textSize(12);
    text('Press the button to\nrecord the first event.', x + 10, y + 32);
    return;
  }

  let ly = y + 32;
  const lineH = 16;
  const innerW = w - 20;

  // Each press writes three lines: when it started, when the handler fired,
  // and what the polling loop was able to see.
  for (const entry of eventLog) {
    if (ly + lineH * 3 > y + h - 8) { break; }

    const lines = [
      {
        txt: 't=' + entry.startMs + 'ms: ' + entry.duration + 'ms press started',
        col: '#212121'
      },
      {
        txt: '  interrupt handler fired at t=' + entry.startMs + 'ms',
        col: '#2E7D32'
      },
      {
        txt: entry.caught
          ? '  polling loop checks at t=' + entry.nextTick + 'ms - CAUGHT'
          : '  polling loop next checks at t=' + entry.nextTick + 'ms - MISSED',
        col: entry.caught ? '#2E7D32' : '#C62828'
      }
    ];

    // Pick one text size that lets every line of this entry fit.
    let size = 12;
    for (const ln of lines) {
      size = min(size, fitTextSize(ln.txt, innerW, 12, 8));
    }
    textSize(size);

    for (const ln of lines) {
      fill(ln.col);
      text(ln.txt, x + 10, ly);
      ly += lineH;
    }
    ly += 8;
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
  text('Press duration: ' + pressDuration + ' ms', 10, drawHeight + 56);
  text('Loop check interval: ' + tickInterval + ' ms', 10, drawHeight + 92);
  textSize(defaultTextSize);
}
