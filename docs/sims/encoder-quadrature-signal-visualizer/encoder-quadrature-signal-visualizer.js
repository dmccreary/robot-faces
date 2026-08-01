// Encoder Quadrature Signal Visualizer
// An interactive p5.js MicroSim for the Robot Faces intelligent textbook.
// Chapter 14: Building an Expression Menu & Live Controls
// Bloom level: Understand (L2) / Analyze (L4) - explain, differentiate
//
// CANVAS_HEIGHT: 400
//
// A rotary encoder has two output pins, A and B. This MicroSim advances them
// one step at a time so the learner can freeze on a single step and see which
// signal changed first. The timeline only moves when a step happens.

// ---------------------------------------------------------------------
// Canvas layout
// ---------------------------------------------------------------------
let canvasWidth = 700;          // initial width, replaced by the container width
let drawHeight = 315;           // knob column, waveform panel, and the rule box
let controlHeight = 85;         // two rows of controls
let canvasHeight = drawHeight + controlHeight;
let margin = 25;
let defaultTextSize = 16;

// ---------------------------------------------------------------------
// Quadrature model
// ---------------------------------------------------------------------
// The two pins move through four phases. Exactly one pin changes between
// neighboring phases, which is what makes the signals "quadrature".
const PHASE_LEVELS = [
  [0, 0],   // phase 0
  [1, 0],   // phase 1
  [1, 1],   // phase 2
  [0, 1]    // phase 3
];

// Phases 0 and 2 are the resting positions you feel as detents. One detent
// step is two phase changes, so signal A always leads going clockwise and
// signal B always leads going counter-clockwise.
const SPAN = 13;                // how many slot units of timeline are visible
const STEP_DEG = 20;            // knob rotation needed to produce one step
const MAX_EDGES = 60;           // edges kept in memory

const COLOR_A = '#1565C0';      // signal A is blue
const COLOR_B = '#EF6C00';      // signal B is orange

// ---------------------------------------------------------------------
// State
// ---------------------------------------------------------------------
let encoderPosition = 0;        // the counter the chapter's code keeps
let plannedPhase = 0;           // phase after everything queued has happened
let slotCursor = 0;             // x position, in slot units, of the newest edge
let baseA = 0;                  // signal levels before the oldest kept edge
let baseB = 0;

let edgeList = [];              // revealed edges, oldest first
let pendingEdges = [];          // edges waiting to be revealed
let lastRevealAt = 0;           // millis of the last scheduled reveal

let lastDirection = 0;          // +1 for clockwise, -1 for counter-clockwise
let directionFlashUntil = 0;

let knobAngle = 0;              // drawn rotation of the knob, in degrees
let draggingKnob = false;
let lastDragAngle = 0;
let dragAccum = 0;              // rotation collected but not yet turned into steps

// Controls
let stepCwButton, stepCcwButton, resetButton, slowMotionCheckbox;

// ---------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------
function setup() {
  updateCanvasSize();
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent(document.querySelector('main'));

  const parentMain = document.querySelector('main');

  stepCwButton = createButton('Step CW');
  stepCwButton.parent(parentMain);
  stepCwButton.mousePressed(function () {
    knobAngle += STEP_DEG;
    queueStep(1);
  });

  stepCcwButton = createButton('Step CCW');
  stepCcwButton.parent(parentMain);
  stepCcwButton.mousePressed(function () {
    knobAngle -= STEP_DEG;
    queueStep(-1);
  });

  resetButton = createButton('Reset position to 0');
  resetButton.parent(parentMain);
  resetButton.mousePressed(resetSimulation);

  slowMotionCheckbox = createCheckbox(' Slow motion', false);
  slowMotionCheckbox.parent(parentMain);

  layoutControls();
  // Button widths are only known after the browser lays them out, so run the
  // layout once more on the next tick in case the first read came in early.
  window.setTimeout(layoutControls, 80);

  describe('A rotary encoder knob on the left can be dragged or stepped one ' +
    'detent at a time. On the right, two square-wave timelines labeled ' +
    'Signal A and Signal B grow one step at a time. A colored marker line at ' +
    'every edge shows which signal changed. Turning clockwise always changes ' +
    'signal A first and adds one to the position counter; turning ' +
    'counter-clockwise always changes signal B first and subtracts one.');
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
  let x = 10;
  stepCwButton.position(x, drawHeight + 8);
  x += stepCwButton.elt.offsetWidth + 10;
  stepCcwButton.position(x, drawHeight + 8);
  x += stepCcwButton.elt.offsetWidth + 10;
  resetButton.position(x, drawHeight + 8);

  slowMotionCheckbox.position(10, drawHeight + 48);
}

// ---------------------------------------------------------------------
// Producing one quadrature step
// ---------------------------------------------------------------------
// A step is queued as two edges. The first edge is revealed right away and
// the second a moment later, so the learner can literally watch which signal
// moved first. Slow motion stretches that gap.
function queueStep(direction) {
  if (pendingEdges.length > 6) { return; }   // do not build a long backlog

  const phase1 = (plannedPhase + direction + 4) % 4;
  const phase2 = (plannedPhase + 2 * direction + 4) % 4;

  const gap = slowMotionCheckbox.checked() ? 900 : 320;
  const startAt = max(millis(), lastRevealAt + 160);

  pendingEdges.push(makePending(plannedPhase, phase1, direction, 1, startAt));
  pendingEdges.push(makePending(phase1, phase2, direction, 2, startAt + gap));

  lastRevealAt = startAt + gap;
  plannedPhase = phase2;
}

// Work out which of the two signals changed between two phases.
function makePending(fromPhase, toPhase, direction, order, revealAt) {
  const changedA = PHASE_LEVELS[fromPhase][0] !== PHASE_LEVELS[toPhase][0];
  return {
    a: PHASE_LEVELS[toPhase][0],
    b: PHASE_LEVELS[toPhase][1],
    sig: changedA ? 'A' : 'B',
    direction: direction,
    order: order,
    revealAt: revealAt
  };
}

// Move one pending edge onto the visible timeline.
function revealEdge(pending) {
  slotCursor += (pending.order === 1) ? 1.5 : 1.1;

  edgeList.push({
    slot: slotCursor,
    a: pending.a,
    b: pending.b,
    sig: pending.sig,
    direction: pending.direction,
    order: pending.order
  });

  // Forget the oldest edge once the list gets long, but remember the levels
  // it left behind so the trace still starts at the right height.
  while (edgeList.length > MAX_EDGES) {
    const dropped = edgeList.shift();
    baseA = dropped.a;
    baseB = dropped.b;
  }

  // The step is complete once its second edge arrives.
  if (pending.order === 2) {
    encoderPosition += pending.direction;
    lastDirection = pending.direction;
    directionFlashUntil = millis() + 700;
  }
}

function resetSimulation() {
  encoderPosition = 0;
  plannedPhase = 0;
  slotCursor = 0;
  baseA = 0;
  baseB = 0;
  edgeList = [];
  pendingEdges = [];
  lastRevealAt = 0;
  lastDirection = 0;
  directionFlashUntil = 0;
  knobAngle = 0;
  dragAccum = 0;
}

// ---------------------------------------------------------------------
// Knob geometry and dragging
// ---------------------------------------------------------------------
function getKnobGeometry() {
  const columnW = constrain(canvasWidth * 0.30, 150, 210);
  return {
    columnW: columnW,
    cx: columnW / 2,
    cy: 112,
    r: constrain(columnW * 0.28, 40, 58)
  };
}

function angleFromMouse(knob) {
  return degrees(atan2(mouseY - knob.cy, mouseX - knob.cx));
}

function mousePressed() {
  const knob = getKnobGeometry();
  if (dist(mouseX, mouseY, knob.cx, knob.cy) < knob.r * 1.6 && mouseY < drawHeight) {
    draggingKnob = true;
    lastDragAngle = angleFromMouse(knob);
  }
}

function mouseDragged() {
  if (!draggingKnob) { return; }
  const knob = getKnobGeometry();
  const nowAngle = angleFromMouse(knob);

  // Take the shortest way around so crossing the 180 degree seam is smooth.
  let delta = nowAngle - lastDragAngle;
  while (delta > 180) { delta -= 360; }
  while (delta < -180) { delta += 360; }
  lastDragAngle = nowAngle;

  knobAngle += delta;
  dragAccum += delta;

  // Every STEP_DEG degrees of rotation produces one detent step.
  while (dragAccum >= STEP_DEG) {
    queueStep(1);
    dragAccum -= STEP_DEG;
  }
  while (dragAccum <= -STEP_DEG) {
    queueStep(-1);
    dragAccum += STEP_DEG;
  }
}

function mouseReleased() {
  draggingKnob = false;
}

// ---------------------------------------------------------------------
// Timeline view window
// ---------------------------------------------------------------------
function getView() {
  const viewEnd = max(SPAN, slotCursor + 2.0);
  return { start: viewEnd - SPAN, end: viewEnd };
}

// ---------------------------------------------------------------------
// Draw
// ---------------------------------------------------------------------
function draw() {
  // Reveal any pending edges whose moment has arrived.
  while (pendingEdges.length > 0 && millis() >= pendingEdges[0].revealAt) {
    revealEdge(pendingEdges.shift());
  }

  const knob = getKnobGeometry();
  const panelX = knob.columnW + 6;
  const panelW = max(200, canvasWidth - panelX - 10);

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
  text('Which Signal Changed First?', canvasWidth / 2, 6);

  drawKnobColumn(knob);
  drawWavePanel(panelX, 38, panelW, 175);
  drawRuleBox(panelX, 222, panelW, 76);

  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
}

// ---------------------------------------------------------------------
// Left column: the knob and the position counter
// ---------------------------------------------------------------------
function drawKnobColumn(knob) {
  // Knob body
  stroke('#546E7A');
  fill(draggingKnob ? '#CFD8DC' : '#ECEFF1');
  circle(knob.cx, knob.cy, knob.r * 2);

  // Detent notches around the rim, one every STEP_DEG degrees.
  stroke('#B0BEC5');
  strokeWeight(1);
  for (let d = 0; d < 360; d += STEP_DEG) {
    const rad = radians(d + knobAngle);
    const x1 = knob.cx + cos(rad) * knob.r * 0.82;
    const y1 = knob.cy + sin(rad) * knob.r * 0.82;
    const x2 = knob.cx + cos(rad) * knob.r * 0.96;
    const y2 = knob.cy + sin(rad) * knob.r * 0.96;
    line(x1, y1, x2, y2);
  }

  // Pointer showing how far the knob has been turned
  const pointerRad = radians(knobAngle - 90);
  stroke('#37474F');
  strokeWeight(4);
  line(knob.cx, knob.cy,
       knob.cx + cos(pointerRad) * knob.r * 0.8,
       knob.cy + sin(pointerRad) * knob.r * 0.8);
  strokeWeight(1);
  noStroke();

  // Position counter, the value the chapter's code stores in encoder_position
  fill('#607D8B');
  textSize(13);
  textAlign(CENTER, TOP);
  text('encoder_position', knob.cx, knob.cy + knob.r + 18);
  fill('black');
  textSize(26);
  text(encoderPosition, knob.cx, knob.cy + knob.r + 36);

  fill('#607D8B');
  textSize(12);
  text('Drag the knob, or use', knob.cx, knob.cy + knob.r + 74);
  text('the step buttons below.', knob.cx, knob.cy + knob.r + 90);
}

// ---------------------------------------------------------------------
// Right panel: the two square waves
// ---------------------------------------------------------------------
function drawWavePanel(x, y, w, h) {
  stroke('#B0BEC5');
  fill('white');
  rect(x, y, w, h, 8);
  noStroke();

  const axisX = x + 54;
  const axisW = w - 68;
  const view = getView();

  const yHighA = y + 30;
  const yLowA = y + 56;
  const yHighB = y + 92;
  const yLowB = y + 118;

  // Direction indicator above the traces
  drawDirectionBadge(x + w - 10, y + 6);

  // Signal labels
  fill(COLOR_A);
  textAlign(LEFT, TOP);
  textSize(14);
  text('Signal A', x + 10, y + 8);
  fill(COLOR_B);
  text('Signal B', x + 10, y + 70);

  fill('#90A4AE');
  textSize(10);
  textAlign(LEFT, CENTER);
  text('HIGH', x + 12, yHighA);
  text('LOW', x + 12, yLowA);
  text('HIGH', x + 12, yHighB);
  text('LOW', x + 12, yLowB);
  textAlign(LEFT, TOP);

  // Marker lines, one at every revealed edge, colored by the signal that moved
  for (const e of edgeList) {
    if (e.slot < view.start) { continue; }
    const ex = slotToX(e.slot, axisX, axisW, view);
    stroke(e.sig === 'A' ? COLOR_A : COLOR_B);
    strokeWeight(e.order === 1 ? 2 : 1);
    // The marker is broken into two segments so it never hides the traces.
    line(ex, yLowA, ex, yHighB);
    line(ex, yLowB, ex, yLowB + 8);
    strokeWeight(1);
  }
  noStroke();

  // The traces themselves
  drawSquareWave('a', baseA, axisX, axisW, view, yHighA, yLowA, COLOR_A);
  drawSquareWave('b', baseB, axisX, axisW, view, yHighB, yLowB, COLOR_B);

  // A letter under each edge naming the signal that changed there
  textAlign(CENTER, TOP);
  textSize(11);
  for (const e of edgeList) {
    if (e.slot < view.start) { continue; }
    const ex = slotToX(e.slot, axisX, axisW, view);
    fill(e.sig === 'A' ? COLOR_A : COLOR_B);
    text(e.sig, ex, yLowB + 10);
    if (e.order === 1) {
      fill('#607D8B');
      text('1st', ex, yLowB + 24);
    }
  }
  textAlign(LEFT, TOP);

  // Reading hint along the bottom of the panel
  const hintText = edgeList.length === 0
    ? 'Both signals are resting LOW. Take one step to start the trace.'
    : 'Read left to right. The "1st" marker is the signal that moved first.';
  noStroke();
  fill('#607D8B');
  textSize(fitTextSize(hintText, w - 20, 12, 8));
  text(hintText, x + 10, y + h - 18);
}

// Draw one square wave across the visible window.
function drawSquareWave(key, baseLevel, axisX, axisW, view, yHigh, yLow, traceColor) {
  stroke(traceColor);
  strokeWeight(2.5);
  noFill();

  let level = baseLevel;
  let prevSlot = view.start;

  for (const e of edgeList) {
    if (e.slot <= view.start) {
      level = e[key];
      continue;
    }
    const ex = slotToX(e.slot, axisX, axisW, view);
    const px = slotToX(prevSlot, axisX, axisW, view);
    line(px, level ? yHigh : yLow, ex, level ? yHigh : yLow);
    line(ex, level ? yHigh : yLow, ex, e[key] ? yHigh : yLow);
    level = e[key];
    prevSlot = e.slot;
  }

  const endX = slotToX(view.end, axisX, axisW, view);
  const startX = slotToX(prevSlot, axisX, axisW, view);
  line(startX, level ? yHigh : yLow, endX, level ? yHigh : yLow);

  strokeWeight(1);
  noStroke();
}

function slotToX(slot, axisX, axisW, view) {
  const fraction = (slot - view.start) / (view.end - view.start);
  return axisX + constrain(fraction, 0, 1) * axisW;
}

// The CW / CCW badge, which brightens for a moment after a completed step.
function drawDirectionBadge(rightX, y) {
  const flashing = millis() < directionFlashUntil;
  let label = 'idle';
  let badgeColor = '#B0BEC5';

  if (lastDirection > 0) {
    label = 'CW';
    badgeColor = flashing ? '#2E7D32' : '#A5D6A7';
  } else if (lastDirection < 0) {
    label = 'CCW';
    badgeColor = flashing ? '#1565C0' : '#90CAF9';
  }

  const badgeW = 54;
  noStroke();
  fill(badgeColor);
  rect(rightX - badgeW, y, badgeW, 22, 5);
  // Only the flashing badges are dark enough to carry white text; the pale
  // idle and resting fills need dark ink to stay readable.
  fill(flashing ? 'white' : '#263238');
  textSize(13);
  textAlign(CENTER, CENTER);
  text(label, rightX - badgeW / 2, y + 11);
  textAlign(LEFT, TOP);
}

// ---------------------------------------------------------------------
// The rule box, tying the waveform straight to the chapter's code
// ---------------------------------------------------------------------
function drawRuleBox(x, y, w, h) {
  stroke('#B0BEC5');
  fill('white');
  rect(x, y, w, h, 8);
  noStroke();

  fill('black');
  textSize(13);
  textAlign(LEFT, TOP);
  text('The rule your code uses', x + 10, y + 6);

  const rows = [
    {
      active: lastDirection > 0,
      txt: 'Clockwise: Signal A changes first, then Signal B   ->   encoder_position += 1',
      col: '#2E7D32'
    },
    {
      active: lastDirection < 0,
      txt: 'Counter-clockwise: Signal B changes first, then Signal A   ->   encoder_position -= 1',
      col: '#1565C0'
    }
  ];

  let rowSize = 13;
  for (const row of rows) {
    rowSize = min(rowSize, fitTextSize(row.txt, w - 30, 13, 8));
  }

  for (let i = 0; i < rows.length; i++) {
    const ry = y + 26 + i * 24;
    if (rows[i].active) {
      noStroke();
      fill(i === 0 ? 'rgba(46,125,50,0.12)' : 'rgba(21,101,192,0.12)');
      rect(x + 6, ry - 3, w - 12, 22, 4);
    }
    noStroke();
    fill(rows[i].active ? rows[i].col : '#78909C');
    textSize(rowSize);
    text(rows[i].txt, x + 12, ry);
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
