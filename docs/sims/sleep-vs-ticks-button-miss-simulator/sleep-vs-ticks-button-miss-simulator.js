// Sleep vs Ticks Button Miss Simulator
// An interactive p5.js MicroSim for the Robot Faces intelligent textbook.
// Chapter 12: Animating Expressions - Timing & Motion
// Bloom level: Analyze (L4) - differentiate, examine
//
// CANVAS_HEIGHT: 405
//
// One shared simulated clock drives two panels running the same 300 ms blink
// cycle. The learner chooses the exact moment to press a button and watches
// how long each version takes to notice it.

// ---------------------------------------------------------------------
// Canvas layout
// ---------------------------------------------------------------------
let canvasWidth = 700;          // initial width, replaced by the container width
let drawHeight = 320;           // two timing panels plus the event log
let controlHeight = 85;         // two rows of controls
let canvasHeight = drawHeight + controlHeight;
let margin = 25;
let defaultTextSize = 16;
let sliderLeftMargin = 250;

// ---------------------------------------------------------------------
// Simulation constants
// ---------------------------------------------------------------------
const CYCLE_MS = 300;           // one animation cycle, matching sleep(0.3)
const SLOW_FACTOR = 5;          // simulated time runs 5x slower than real time
const FLASH_MS = 180;           // how long a detection flash stays visible
const BLINK_MS = 70;            // eyes are closed for the first 70 ms of a cycle

// ---------------------------------------------------------------------
// Simulation state
// ---------------------------------------------------------------------
let simTime = 0;                // simulated milliseconds since the last reset
let checkInterval = 5;          // how often the ticks_ms() loop checks the button

// A press that one panel has not noticed yet. Each holds the absolute
// simulated time the press happened and the time that panel will notice it.
let pendingSleep = null;
let pendingTicks = null;

let sleepFlashUntil = -1;       // absolute sim time the green flash ends
let ticksFlashUntil = -1;
let buttonFlashUntil = -1;      // the yellow flash on the button icon

let eventLog = [];              // newest entry first, capped at MAX_LOG_ENTRIES
const MAX_LOG_ENTRIES = 4;

// Controls
let pressButton, resetButton, intervalSlider;

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
  pressButton.mousePressed(registerPress);

  resetButton = createButton('Reset');
  resetButton.parent(parentMain);
  resetButton.mousePressed(resetSimulation);

  intervalSlider = createSlider(1, 50, checkInterval, 1);
  intervalSlider.parent(parentMain);
  intervalSlider.input(function () {
    checkInterval = intervalSlider.value();
  });

  layoutControls();
  // Button widths are measured after the browser lays them out, so run the
  // layout once more on the next tick in case the first read came in early.
  window.setTimeout(layoutControls, 80);

  describe('Two stacked panels share one simulated clock. The top panel uses a ' +
    'blocking sleep(300) call and the bottom panel uses a non-blocking ' +
    'ticks_ms() loop. Pressing the simulated button shows how many ' +
    'milliseconds each version takes to notice the press, and an event log ' +
    'records every attempt.');
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

  intervalSlider.position(sliderLeftMargin, drawHeight + 50);
  intervalSlider.size(max(60, canvasWidth - sliderLeftMargin - margin));
}

// ---------------------------------------------------------------------
// The simulated button press
// ---------------------------------------------------------------------

// A press lands at whatever point of the 300 ms cycle the clock happens to be
// at. Both panels are told about it at the same instant, so the only thing
// that differs is how soon each one is able to look.
function registerPress() {
  const pressAbs = simTime;
  const pressPos = round(pressAbs % CYCLE_MS);

  // The blocking version is stuck inside sleep() until the cycle ends, so the
  // earliest it can look at the button is the very end of this cycle.
  const sleepPos = CYCLE_MS;

  // The non-blocking version looks again at its next scheduled check, which is
  // never further away than one check interval.
  let ticksPos = ceil(pressPos / checkInterval) * checkInterval;
  ticksPos = min(ticksPos, CYCLE_MS);

  pendingSleep = {
    pressAbs: pressAbs,
    pressPos: pressPos,
    detectAt: pressAbs + (sleepPos - pressPos)
  };
  pendingTicks = {
    pressAbs: pressAbs,
    pressPos: pressPos,
    detectAt: pressAbs + (ticksPos - pressPos)
  };

  buttonFlashUntil = simTime + FLASH_MS;

  eventLog.unshift({
    pressPos: pressPos,
    sleepPos: sleepPos,
    ticksPos: ticksPos
  });
  if (eventLog.length > MAX_LOG_ENTRIES) {
    eventLog.pop();
  }
}

// Clicking anywhere in the drawing area counts as a press too, so the learner
// can aim at a specific point of the progress bar.
function mousePressed() {
  if (mouseX >= 0 && mouseX <= canvasWidth && mouseY >= 0 && mouseY <= drawHeight) {
    registerPress();
  }
}

function resetSimulation() {
  simTime = 0;
  pendingSleep = null;
  pendingTicks = null;
  sleepFlashUntil = -1;
  ticksFlashUntil = -1;
  buttonFlashUntil = -1;
  eventLog = [];
}

// ---------------------------------------------------------------------
// Draw
// ---------------------------------------------------------------------
function draw() {
  // Advance the shared simulated clock. deltaTime is real milliseconds since
  // the previous frame; dividing slows the simulation down enough to watch.
  simTime += deltaTime / SLOW_FACTOR;

  // Retire any press whose panel has now had a chance to look at the button.
  if (pendingSleep && simTime >= pendingSleep.detectAt) {
    sleepFlashUntil = simTime + FLASH_MS;
    pendingSleep = null;
  }
  if (pendingTicks && simTime >= pendingTicks.detectAt) {
    ticksFlashUntil = simTime + FLASH_MS;
    pendingTicks = null;
  }

  const cyclePos = simTime % CYCLE_MS;

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
  text('Who Notices the Button Press?', canvasWidth / 2, 6);

  // Shared clock caption
  const clockText = 'Shared simulated clock: t = ' + nf(cyclePos, 1, 0) +
    ' ms of ' + CYCLE_MS + ' ms, running ' + SLOW_FACTOR +
    'x slower than real hardware';
  fill('#455A64');
  textSize(fitTextSize(clockText, canvasWidth - 20, 13, 9));
  text(clockText, canvasWidth / 2, 30);

  // Region geometry: two panels on the left, the event log on the right.
  const logW = max(195, canvasWidth * 0.32);
  const logX = canvasWidth - logW - 10;
  const panelX = 10;
  const panelW = logX - panelX - 12;
  const panelH = 105;
  const panel1Y = 52;
  const panel2Y = panel1Y + panelH + 12;

  drawTimingPanel(panelX, panel1Y, panelW, panelH, 'sleep', cyclePos);
  drawTimingPanel(panelX, panel2Y, panelW, panelH, 'ticks', cyclePos);
  drawEventLog(logX, panel1Y, logW, panel2Y + panelH - panel1Y);

  // Hint line under the panels
  const hintText = 'Click anywhere in this area, or use the Press Button Now ' +
    'control, to press at the exact moment you choose.';
  noStroke();
  fill('#455A64');
  textAlign(CENTER, TOP);
  textSize(fitTextSize(hintText, canvasWidth - 20, 12, 8));
  text(hintText, canvasWidth / 2, panel2Y + panelH + 8);

  drawControlLabels();
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
}

// ---------------------------------------------------------------------
// One timing panel
// ---------------------------------------------------------------------
function drawTimingPanel(x, y, w, h, kind, cyclePos) {
  const isSleep = (kind === 'sleep');
  const pending = isSleep ? pendingSleep : pendingTicks;
  const flashUntil = isSleep ? sleepFlashUntil : ticksFlashUntil;
  const flashing = simTime < flashUntil;

  // Panel background. A green wash marks the moment a press is noticed.
  stroke('#B0BEC5');
  fill(flashing ? '#E8F5E9' : 'white');
  rect(x, y, w, h, 8);
  noStroke();

  // Panel label
  const panelLabel = isSleep ? 'sleep(300) version - blocking'
                             : 'ticks_ms() version - non-blocking';
  fill('black');
  textAlign(LEFT, TOP);
  textSize(fitTextSize(panelLabel, w - 20, 15, 10));
  text(panelLabel, x + 10, y + 8);

  // A miniature face so the learner can see both versions run the same
  // blinking animation. Only the button response differs.
  const faceW = constrain(w * 0.24, 40, 68);
  drawMiniFace(x + 10, y + 30, faceW, faceW / 2, cyclePos < BLINK_MS);

  // Progress bar for the current 300 ms cycle
  const barX = x + 18 + faceW;
  const barW = w - (barX - x) - 12;
  const barY = y + 34;
  const barH = 20;

  fill('#ECEFF1');
  rect(barX, barY, barW, barH, 4);

  const fillW = barW * (cyclePos / CYCLE_MS);

  if (isSleep && pending) {
    // A press landed mid-bar and this version is still stuck inside sleep().
    // The bar turns solid red from the press point to the end of the cycle.
    const pressX = barW * (pending.pressPos / CYCLE_MS);
    fill('#00897B');
    rect(barX, barY, min(fillW, pressX), barH, 4);
    fill('#C62828');
    rect(barX + pressX, barY, barW - pressX, barH, 4);
  } else if (flashing) {
    fill('#2E7D32');
    rect(barX, barY, barW, barH, 4);
  } else {
    fill('#00897B');
    rect(barX, barY, fillW, barH, 4);
  }

  // A yellow marker showing exactly where in the cycle the last press landed.
  if (pending) {
    const pressX = barX + barW * (pending.pressPos / CYCLE_MS);
    stroke('#FDD835');
    strokeWeight(3);
    line(pressX, barY - 4, pressX, barY + barH + 4);
    strokeWeight(1);
    noStroke();
  }

  // Bar end labels
  fill('#607D8B');
  textSize(11);
  textAlign(LEFT, TOP);
  text('0 ms', barX, barY + barH + 3);
  textAlign(RIGHT, TOP);
  text(CYCLE_MS + ' ms', barX + barW, barY + barH + 3);

  // What this version is doing right now
  let statusText;
  let statusColor;
  if (isSleep) {
    statusColor = pending ? '#C62828' : '#455A64';
    statusText = pending
      ? 'Blocked inside sleep(). It cannot look at the button yet.'
      : 'Blocked inside sleep() until the cycle ends.';
  } else {
    statusColor = flashing ? '#2E7D32' : '#455A64';
    statusText = 'Looping and checking the button every ' + checkInterval + ' ms.';
  }
  textAlign(LEFT, TOP);
  fill(statusColor);
  textSize(fitTextSize(statusText, w - 20, 12, 8));
  text(statusText, x + 10, y + 70);

  // The result of the most recent press for this version
  const latest = eventLog.length > 0 ? eventLog[0] : null;
  let resultText;
  if (latest) {
    const noticedAt = isSleep ? latest.sleepPos : latest.ticksPos;
    const lateBy = noticedAt - latest.pressPos;
    resultText = 'Last press at t=' + latest.pressPos + ' ms was noticed at t=' +
      noticedAt + ' ms, ' + lateBy + ' ms late.';
    fill(isSleep ? '#C62828' : '#2E7D32');
  } else {
    resultText = 'No press yet.';
    fill('#90A4AE');
  }
  textSize(fitTextSize(resultText, w - 20, 12, 8));
  text(resultText, x + 10, y + 87);
}

// A tiny monochrome face, drawn in 128x64 display units and scaled to fit.
function drawMiniFace(x, y, w, h, eyesClosed) {
  push();
  translate(x, y);
  scale(w / 128);
  noStroke();
  fill('black');
  rect(0, 0, 128, 64);

  stroke('white');
  strokeWeight(4);
  if (eyesClosed) {
    // Closed eyes are two short horizontal bars.
    line(30, 30, 54, 30);
    line(74, 30, 98, 30);
  } else {
    noFill();
    ellipse(42, 30, 22, 22);
    ellipse(86, 30, 22, 22);
  }
  noFill();
  strokeWeight(3);
  arc(64, 42, 44, 22, 0.2, PI - 0.2);
  pop();
  noStroke();
  strokeWeight(1);
}

// ---------------------------------------------------------------------
// The shared event log
// ---------------------------------------------------------------------
function drawEventLog(x, y, w, h) {
  stroke('#B0BEC5');
  fill('white');
  rect(x, y, w, h, 8);
  noStroke();

  // Header row: the title plus a button icon that flashes yellow on a press.
  fill('black');
  textSize(14);
  textAlign(LEFT, TOP);
  text('Event log', x + 10, y + 8);

  const iconW = 42;
  const iconX = x + w - iconW - 10;
  stroke('#546E7A');
  fill(simTime < buttonFlashUntil ? '#FDD835' : '#ECEFF1');
  rect(iconX, y + 6, iconW, 18, 4);
  noStroke();
  fill('#37474F');
  textSize(11);
  textAlign(CENTER, TOP);
  text('BTN', iconX + iconW / 2, y + 10);

  textAlign(LEFT, TOP);

  if (eventLog.length === 0) {
    fill('#90A4AE');
    textSize(12);
    text('Press the button to record\nthe first event.', x + 10, y + 34);
    return;
  }

  // Each press produces three lines: when it happened, and when each version
  // actually noticed it. Newest press first.
  let ly = y + 32;
  const lineH = 15;
  const innerW = w - 20;

  for (const entry of eventLog) {
    if (ly + lineH * 3 > y + h - 6) { break; }

    const sleepLate = entry.sleepPos - entry.pressPos;
    const ticksLate = entry.ticksPos - entry.pressPos;

    const lines = [
      { txt: 't=' + entry.pressPos + ' ms: button pressed', col: '#212121' },
      { txt: '  sleep(): MISSED until t=' + entry.sleepPos + ' (+' + sleepLate + ' ms)',
        col: '#C62828' },
      { txt: '  ticks_ms(): SAW it at t=' + entry.ticksPos + ' (+' + ticksLate + ' ms)',
        col: '#2E7D32' }
    ];

    // Pick one text size that lets every line in this entry fit the panel.
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
    ly += 6;
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
  text('ticks_ms() check interval: ' + checkInterval + ' ms', 10, drawHeight + 60);
  textSize(defaultTextSize);
}
