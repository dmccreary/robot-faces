// Potentiometer ADC Mapping Visualizer
// An interactive p5.js MicroSim for the Robot Faces intelligent textbook.
// Chapter 13: Interactive Controls - Inputs & Concurrency
// Bloom level: Apply (L3) - calculate, demonstrate
//
// CANVAS_HEIGHT: 425
//
// Drag the knob to change the raw ADC reading, then watch the same
// map_range() arithmetic taught in this chapter run with your real numbers.

// ---------------------------------------------------------------------
// Canvas layout
// ---------------------------------------------------------------------
let canvasWidth = 700;          // initial width, replaced by the container width
let drawHeight = 340;           // knob column plus the calculation column
let controlHeight = 85;         // two rows of controls
let canvasHeight = drawHeight + controlHeight;
let margin = 25;
let defaultTextSize = 16;

// ---------------------------------------------------------------------
// Model constants
// ---------------------------------------------------------------------
// A MicroPython ADC on the Pico returns a 16-bit reading, so the input range
// is always 0 to 65535 no matter which pin you read.
const ADC_MIN = 0;
const ADC_MAX = 65535;

// The knob turns from a 7-o'clock position to a 5-o'clock position, which is
// 300 degrees of travel measured clockwise from straight up.
const KNOB_MIN_DEG = -150;
const KNOB_MAX_DEG = 150;

// ---------------------------------------------------------------------
// State
// ---------------------------------------------------------------------
let rawValue = 32768;           // the simulated ADC reading, 0 to 65535
let outMin = -30;               // low end of the mapped output range
let outMax = 30;                // high end of the mapped output range
let draggingKnob = false;

// Controls
let centerButton, resetRangeButton, minInput, maxInput;

// ---------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------
function setup() {
  updateCanvasSize();
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent(document.querySelector('main'));

  const parentMain = document.querySelector('main');

  centerButton = createButton('Snap to center');
  centerButton.parent(parentMain);
  centerButton.mousePressed(function () {
    rawValue = 32768;
  });

  resetRangeButton = createButton('Reset ranges');
  resetRangeButton.parent(parentMain);
  resetRangeButton.mousePressed(function () {
    outMin = -30;
    outMax = 30;
    minInput.value('-30');
    maxInput.value('30');
  });

  minInput = createInput('-30', 'number');
  minInput.parent(parentMain);
  minInput.size(58);
  minInput.input(readRangeInputs);

  maxInput = createInput('30', 'number');
  maxInput.parent(parentMain);
  maxInput.size(58);
  maxInput.input(readRangeInputs);

  layoutControls();

  describe('A potentiometer knob on the left can be dragged from a 7-o-clock ' +
    'to a 5-o-clock position. The right side shows the raw 16-bit ADC ' +
    'reading, the map_range formula with every number substituted in, the ' +
    'mapped output angle, and a small robot face whose left eyebrow tilts to ' +
    'that angle. Editable output minimum and maximum boxes re-map the same ' +
    'raw reading into a different range.');
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
  centerButton.position(10, drawHeight + 8);
  const nextX = 10 + centerButton.elt.offsetWidth + 10;
  resetRangeButton.position(nextX, drawHeight + 8);

  minInput.position(100, drawHeight + 46);
  maxInput.position(265, drawHeight + 46);
}

// Read the two number boxes. Anything that is not a number is ignored so a
// half-typed value such as "-" does not blank out the whole calculation.
function readRangeInputs() {
  const lowValue = parseFloat(minInput.value());
  const highValue = parseFloat(maxInput.value());
  if (!isNaN(lowValue)) { outMin = lowValue; }
  if (!isNaN(highValue)) { outMax = highValue; }
}

// ---------------------------------------------------------------------
// The mapping itself
// ---------------------------------------------------------------------
// This is the same map_range() function the chapter writes in MicroPython,
// rewritten in JavaScript so the displayed arithmetic always matches the code.
function mapRange(x, inMin, inMax, lowOut, highOut) {
  return lowOut + (x - inMin) * (highOut - lowOut) / (inMax - inMin);
}

// ---------------------------------------------------------------------
// Knob geometry and dragging
// ---------------------------------------------------------------------
function getKnobGeometry() {
  const leftW = max(190, canvasWidth * 0.45);
  const knobR = constrain(leftW * 0.28, 40, 68);
  return {
    leftW: leftW,
    cx: leftW / 2,
    cy: 140,
    r: knobR
  };
}

// Turn the raw ADC reading into the knob's pointer angle, in degrees
// clockwise from straight up.
function rawToKnobDegrees(raw) {
  const travel = KNOB_MAX_DEG - KNOB_MIN_DEG;
  return KNOB_MIN_DEG + (raw / ADC_MAX) * travel;
}

function mousePressed() {
  const knob = getKnobGeometry();
  if (dist(mouseX, mouseY, knob.cx, knob.cy) < knob.r * 1.7 && mouseY < drawHeight) {
    draggingKnob = true;
    setRawFromMouse(knob);
  }
}

function mouseDragged() {
  if (draggingKnob) {
    setRawFromMouse(getKnobGeometry());
  }
}

function mouseReleased() {
  draggingKnob = false;
}

// Convert the mouse position into an angle, clamp it to the knob's travel,
// then convert that angle back into a raw ADC reading.
function setRawFromMouse(knob) {
  const dx = mouseX - knob.cx;
  const dy = mouseY - knob.cy;
  // atan2(dx, -dy) gives 0 straight up and grows clockwise.
  let deg = degrees(atan2(dx, -dy));
  deg = constrain(deg, KNOB_MIN_DEG, KNOB_MAX_DEG);
  const fraction = (deg - KNOB_MIN_DEG) / (KNOB_MAX_DEG - KNOB_MIN_DEG);
  rawValue = round(fraction * ADC_MAX);
}

// ---------------------------------------------------------------------
// Draw
// ---------------------------------------------------------------------
function draw() {
  const knob = getKnobGeometry();
  const mappedValue = mapRange(rawValue, ADC_MIN, ADC_MAX, outMin, outMax);

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
  text('From Knob to Eyebrow Angle', canvasWidth / 2, 6);

  drawKnobColumn(knob, mappedValue);
  drawCalculationColumn(knob.leftW, mappedValue);
  drawControlLabels();

  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
}

// ---------------------------------------------------------------------
// Left column: the knob
// ---------------------------------------------------------------------
function drawKnobColumn(knob, mappedValue) {
  const deg = rawToKnobDegrees(rawValue);
  const percent = (rawValue / ADC_MAX) * 100;

  // Travel arc, drawn from the 7-o'clock stop around to the 5-o'clock stop.
  noFill();
  stroke('#B0BEC5');
  strokeWeight(6);
  arc(knob.cx, knob.cy, knob.r * 2.5, knob.r * 2.5,
      radians(-90 + KNOB_MIN_DEG), radians(-90 + KNOB_MAX_DEG));

  // Filled portion of the arc showing how far the knob has been turned.
  if (deg > KNOB_MIN_DEG + 0.5) {
    stroke('#00897B');
    arc(knob.cx, knob.cy, knob.r * 2.5, knob.r * 2.5,
        radians(-90 + KNOB_MIN_DEG), radians(-90 + deg));
  }
  strokeWeight(1);

  // Knob body
  stroke('#546E7A');
  fill(draggingKnob ? '#CFD8DC' : '#ECEFF1');
  circle(knob.cx, knob.cy, knob.r * 2);

  // Pointer line
  const px = knob.cx + knob.r * 0.82 * sin(radians(deg));
  const py = knob.cy - knob.r * 0.82 * cos(radians(deg));
  stroke('#37474F');
  strokeWeight(4);
  line(knob.cx, knob.cy, px, py);
  strokeWeight(1);
  noStroke();

  // End-stop labels
  fill('#607D8B');
  textSize(11);
  textAlign(CENTER, CENTER);
  text('0', knob.cx - knob.r * 1.35, knob.cy + knob.r * 0.95);
  text('65535', knob.cx + knob.r * 1.35, knob.cy + knob.r * 0.95);

  // Percentage of full travel
  fill('black');
  textSize(15);
  textAlign(CENTER, TOP);
  text(nf(percent, 1, 1) + '% of full travel', knob.cx, knob.cy + knob.r + 26);

  fill('#607D8B');
  textSize(12);
  text('Drag the knob to turn it', knob.cx, knob.cy + knob.r + 46);

  // A single eyebrow icon that tilts live to the mapped angle. The drawn
  // tilt is capped so a very wide output range cannot push it off the panel.
  const iconY = knob.cy + knob.r + 88;
  const iconW = constrain(knob.leftW * 0.20, 36, 52);
  push();
  translate(knob.cx, iconY);
  rotate(radians(-constrain(mappedValue, -60, 60)));
  stroke('#00897B');
  strokeWeight(7);
  line(-iconW / 2, 0, iconW / 2, 0);
  pop();
  noStroke();
  fill('#607D8B');
  textSize(12);
  textAlign(CENTER, TOP);
  text('live eyebrow tilt', knob.cx, iconY + 24);
}

// ---------------------------------------------------------------------
// Right column: raw reading, formula, mapped output, face preview
// ---------------------------------------------------------------------
function drawCalculationColumn(leftW, mappedValue) {
  const x = leftW + 6;
  const w = canvasWidth - x - 12;

  textAlign(LEFT, TOP);

  // --- Stage 1: the raw reading, with no mapping applied yet -------------
  noStroke();
  fill('#37474F');
  textSize(13);
  text('Step 1 - raw reading from the ADC', x, 40);

  const rawText = 'raw_value = ' + withCommas(rawValue) + ' / ' + ADC_MAX;
  fill('black');
  textSize(fitTextSize(rawText, w, 17, 10));
  text(rawText, x, 58);

  // A bar showing the raw reading as a share of full scale.
  const barY = 82;
  const barH = 14;
  fill('#ECEFF1');
  rect(x, barY, w, barH, 4);
  fill('#00897B');
  rect(x, barY, w * (rawValue / ADC_MAX), barH, 4);

  // --- Stage 2: the formula with every number substituted in -------------
  fill('#37474F');
  textSize(13);
  text('Step 2 - map_range() with your numbers', x, 106);

  const spread = ADC_MAX - ADC_MIN;
  const outSpread = outMax - outMin;
  const line1 = 'out_min + (raw_value - in_min) * (out_max - out_min) / (in_max - in_min)';
  const line2 = '= ' + fmt(outMin) + ' + (' + rawValue + ' - ' + ADC_MIN + ') * (' +
    fmt(outMax) + ' - (' + fmt(outMin) + ')) / (' + ADC_MAX + ' - ' + ADC_MIN + ')';
  const line3 = '= ' + fmt(outMin) + ' + ' + rawValue + ' * ' + fmt(outSpread) +
    ' / ' + spread + ' = ' + nf(mappedValue, 1, 1);

  const formulaLines = [line1, line2, line3];
  let formulaSize = 14;
  for (const ln of formulaLines) {
    formulaSize = min(formulaSize, fitTextSize(ln, w, 14, 8));
  }
  textSize(formulaSize);
  fill('#263238');
  text(line1, x, 124);
  text(line2, x, 142);
  text(line3, x, 160);

  // --- Stage 3: the mapped output ---------------------------------------
  fill('#37474F');
  textSize(13);
  text('Step 3 - mapped output', x, 184);

  const outText = 'eyebrow_angle = ' + nf(mappedValue, 1, 1) + ' degrees';
  fill('#00695C');
  textSize(fitTextSize(outText, w, 19, 11));
  text(outText, x, 202);

  // --- The face preview --------------------------------------------------
  const faceW = constrain(w * 0.45, 100, 150);
  drawFacePreview(x, 228, faceW, mappedValue);

  // Caption beside the face, sized to whatever room is left.
  const capX = x + faceW + 10;
  const capW = max(60, canvasWidth - 12 - capX);
  const capLines = [
    'The left eyebrow follows',
    'the mapped angle.',
    'Edit Output min and',
    'Output max below to',
    're-map the same reading.'
  ];
  let capSize = 12;
  for (const ln of capLines) {
    capSize = min(capSize, fitTextSize(ln, capW, 12, 8));
  }
  textSize(capSize);
  fill('#607D8B');
  for (let i = 0; i < capLines.length; i++) {
    text(capLines[i], capX, 232 + i * 16);
  }
}

// A tiny monochrome robot face drawn in 128x64 display units, then scaled.
function drawFacePreview(x, y, w, browAngle) {
  push();
  translate(x, y);
  scale(w / 128);
  noStroke();
  fill('black');
  rect(0, 0, 128, 64);

  // Eyes
  noFill();
  stroke('white');
  strokeWeight(4);
  circle(42, 34, 22);
  circle(86, 34, 22);

  // Right eyebrow stays flat as a reference line.
  strokeWeight(5);
  line(74, 16, 98, 16);

  // Left eyebrow tilts to the mapped angle. Screen y grows downward, so a
  // positive angle is drawn as a counter-clockwise rotation.
  push();
  translate(42, 16);
  rotate(radians(-constrain(browAngle, -80, 80)));
  stroke('#4DD0E1');
  line(-12, 0, 12, 0);
  pop();
  pop();

  noStroke();
  strokeWeight(1);
}

// ---------------------------------------------------------------------
// Small formatting helpers
// ---------------------------------------------------------------------

// Add thousands separators so a 16-bit reading is easy to read aloud.
function withCommas(n) {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Print a range endpoint without a trailing ".0" when it is a whole number.
function fmt(n) {
  return (Math.abs(n - Math.round(n)) < 0.001) ? String(Math.round(n)) : nf(n, 1, 1);
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
  text('Output min:', 10, drawHeight + 58);
  text('Output max:', 175, drawHeight + 58);
  textSize(defaultTextSize);
}
