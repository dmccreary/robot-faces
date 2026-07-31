// Expression Interpolation Keyframe Stepper
// An interactive p5.js MicroSim for the Robot Faces intelligent textbook.
// Chapter 12: Animating Expressions - Timing & Motion
// Bloom level: Understand (L2) - interpret, exemplify
//
// CANVAS_HEIGHT: 520
//
// The learner steps one frame at a time from a neutral keyframe to a happy
// keyframe. Every step shows the exact arithmetic interpolate_state() performs,
// so the numbers stay visible instead of blurring past inside an animation.

// ---------------------------------------------------------------------
// Canvas layout
// ---------------------------------------------------------------------
let canvasWidth = 700;          // initial width, replaced by the container width
let drawHeight = 430;           // face view and readout panel
let controlHeight = 90;         // two rows of controls
let canvasHeight = drawHeight + controlHeight;
let margin = 25;
let defaultTextSize = 16;

// Below this container width the readout panel moves under the face view.
const STACK_WIDTH = 620;

// ---------------------------------------------------------------------
// The two keyframes. These match the MicroPython dictionaries in the
// chapter exactly, so the numbers on screen are the numbers in the book.
// ---------------------------------------------------------------------
const keyframeStart = { eyebrow_angle: 0, mouth_curvature: 2 };
const keyframeEnd = { eyebrow_angle: 10, mouth_curvature: 8 };
const PARAM_NAMES = ['eyebrow_angle', 'mouth_curvature'];

// ---------------------------------------------------------------------
// Stepper state
// ---------------------------------------------------------------------
let totalSteps = 10;            // frames in the transition, set by the slider
let currentStep = 0;            // which frame we are looking at, 0 to totalSteps
let easingMode = 'linear';      // 'linear' or 'eased'

// Controls
let btnJumpStart, btnPrev, btnNext, btnJumpEnd;
let modeSelect, stepsSlider;
let sliderLeftMargin = 300;     // recomputed for narrow containers

// ---------------------------------------------------------------------
// The interpolation math, ported straight from the chapter's MicroPython
// ---------------------------------------------------------------------

// interpolate_state(start, end, t) in Python. Every shared key moves the same
// fractional distance t from its start value toward its end value.
function interpolateState(startState, endState, t) {
  const result = {};
  for (const paramName of PARAM_NAMES) {
    result[paramName] = startState[paramName] +
      (endState[paramName] - startState[paramName]) * t;
  }
  return result;
}

// A smooth ease-in-out curve, sometimes called smoothstep. It reshapes t
// itself: the transition creeps away from the start, speeds up through the
// middle, then settles gently into the end. ease(0) is 0 and ease(1) is 1,
// so both modes always land on the exact end keyframe.
function easeInOut(t) {
  return 3 * t * t - 2 * t * t * t;
}

// The raw progress value for the current step, before any easing.
function linearT() {
  return currentStep / totalSteps;
}

// The progress value actually fed into interpolate_state().
function activeT() {
  return (easingMode === 'eased') ? easeInOut(linearT()) : linearT();
}

// ---------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------
function setup() {
  updateCanvasSize();
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent(document.querySelector('main'));

  const parentMain = document.querySelector('main');

  // Row 1: the four step buttons. They are laid out left to right using each
  // button's measured width so no two ever overlap.
  btnJumpStart = createButton('Jump to Start');
  btnJumpStart.parent(parentMain);
  btnJumpStart.mousePressed(function () { goToStep(0); });

  btnPrev = createButton('Previous');
  btnPrev.parent(parentMain);
  btnPrev.mousePressed(function () { goToStep(currentStep - 1); });

  btnNext = createButton('Next Step');
  btnNext.parent(parentMain);
  btnNext.mousePressed(function () { goToStep(currentStep + 1); });

  btnJumpEnd = createButton('Jump to End');
  btnJumpEnd.parent(parentMain);
  btnJumpEnd.mousePressed(function () { goToStep(totalSteps); });

  // Row 2: interpolation mode and the total-step count.
  modeSelect = createSelect();
  modeSelect.parent(parentMain);
  modeSelect.option('Linear');
  modeSelect.option('Eased (ease-in-out)');
  modeSelect.selected('Linear');
  modeSelect.changed(function () {
    easingMode = (modeSelect.value() === 'Linear') ? 'linear' : 'eased';
    redraw();
  });

  stepsSlider = createSlider(5, 20, totalSteps, 1);
  stepsSlider.parent(parentMain);
  stepsSlider.input(function () {
    totalSteps = stepsSlider.value();
    // Keep the current step inside the new range.
    currentStep = constrain(currentStep, 0, totalSteps);
    redraw();
  });

  layoutControls();
  // Button widths are measured after the browser lays them out, so run the
  // layout once more on the next tick in case the first read came in early.
  window.setTimeout(function () { layoutControls(); redraw(); }, 80);

  describe('A step-through view of expression interpolation. A robot face is ' +
    'redrawn one frame at a time between a neutral keyframe and a happy ' +
    'keyframe, while a panel shows the start and end values, the current ' +
    'progress value t, and the exact arithmetic for each face parameter.');

  // No continuous animation: the canvas is redrawn only when the learner
  // presses a button, changes the mode, or moves the slider.
  noLoop();
}

// Move to a step, clamped to the valid range, then redraw once.
function goToStep(newStep) {
  currentStep = constrain(newStep, 0, totalSteps);
  redraw();
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
  redraw();
}

// Place every control in the strip below drawHeight.
function layoutControls() {
  const gap = 8;
  let x = 10;

  // Row 1: four buttons in a line.
  const rowButtons = [btnJumpStart, btnPrev, btnNext, btnJumpEnd];
  for (const btn of rowButtons) {
    btn.position(x, drawHeight + 8);
    x += btn.elt.offsetWidth + gap;
  }

  // Row 2: the mode select on the left, the step-count slider on the right.
  modeSelect.position(10, drawHeight + 48);
  const selectRight = 10 + modeSelect.elt.offsetWidth;

  // Leave room for the "Total steps: NN" label between the select and slider.
  sliderLeftMargin = max(selectRight + 130, 240);
  stepsSlider.position(sliderLeftMargin, drawHeight + 50);
  stepsSlider.size(max(60, canvasWidth - sliderLeftMargin - margin));
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
// Draw
// ---------------------------------------------------------------------
function draw() {
  // Drawing region and control region backgrounds.
  fill('aliceblue');
  stroke('silver');
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  // Title
  fill('black');
  noStroke();
  textSize(20);
  textAlign(CENTER, TOP);
  text('Expression Interpolation, One Frame at a Time', canvasWidth / 2, 8);

  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);

  const stacked = canvasWidth < STACK_WIDTH;
  const topY = 38;

  if (stacked) {
    // Narrow container: face on top, readout panel underneath. The face is
    // capped small here so the panel keeps enough room for its arithmetic.
    const faceW = min(canvasWidth - 2 * margin, 220);
    const faceX = (canvasWidth - faceW) / 2;
    const faceH = faceW / 2;
    const panelY = topY + faceH + 46;
    drawFaceView(faceX, topY, faceW, faceH);
    drawReadoutPanel(margin, panelY, canvasWidth - 2 * margin,
      drawHeight - panelY - 8);
  } else {
    // Wide container: face on the left, readout panel on the right.
    const leftW = canvasWidth * 0.52;
    const faceW = min(leftW - margin - 10, 420);
    const faceH = faceW / 2;
    drawFaceView(margin, topY, faceW, faceH);
    const panelX = leftW + 10;
    drawReadoutPanel(panelX, topY, canvasWidth - panelX - margin,
      drawHeight - topY - 8);
  }

  drawControlLabels();
}

// ---------------------------------------------------------------------
// The face view: an OLED-style panel plus a step progress bar
// ---------------------------------------------------------------------
function drawFaceView(x, y, w, h) {
  const faceState = interpolateState(keyframeStart, keyframeEnd, activeT());

  // The display itself. A 128x64 monochrome OLED is exactly 2:1, so every
  // shape below is drawn in 128x64 units and scaled to fit.
  push();
  translate(x, y);
  scale(w / 128);
  noStroke();
  fill('black');
  rect(0, 0, 128, 64);
  drawRobotFace(faceState);
  pop();

  // A thin bezel so the display reads as hardware, not as empty space.
  noFill();
  stroke('#546E7A');
  strokeWeight(2);
  rect(x, y, w, h);
  strokeWeight(1);

  // Progress bar: one segment per step, filled up to the current step.
  const barY = y + h + 12;
  const barH = 12;
  noStroke();
  fill('#CFD8DC');
  rect(x, barY, w, barH, 6);
  fill('#00897B');
  rect(x, barY, w * (currentStep / totalSteps), barH, 6);

  // Tick marks so the learner can count frames on the bar.
  stroke('white');
  strokeWeight(1);
  for (let i = 1; i < totalSteps; i++) {
    const tx = x + w * (i / totalSteps);
    line(tx, barY, tx, barY + barH);
  }

  noStroke();
  fill('black');
  textSize(15);
  textAlign(LEFT, TOP);
  text('Step ' + currentStep + ' of ' + totalSteps, x, barY + barH + 6);

  // Name the keyframe whenever the face is sitting exactly on one.
  textAlign(RIGHT, TOP);
  if (currentStep === 0) {
    fill('#00695C');
    text('keyframe_neutral', x + w, barY + barH + 6);
  } else if (currentStep === totalSteps) {
    fill('#D84315');
    text('keyframe_happy', x + w, barY + barH + 6);
  }
  textAlign(LEFT, CENTER);
}

// Draw the face inside a 128 by 64 coordinate space, the size of the OLED
// this book uses. Only two parameters change: eyebrow angle and mouth curve.
function drawRobotFace(faceState) {
  const leftEyeX = 42;
  const rightEyeX = 86;
  const eyeY = 30;
  const eyeR = 11;
  const browY = 13;
  const browHalf = 11;
  const mouthY = 48;
  const mouthHalf = 20;

  stroke('white');
  strokeWeight(2);
  noFill();

  // Eyes: two open circles.
  ellipse(leftEyeX, eyeY, eyeR * 2, eyeR * 2);
  ellipse(rightEyeX, eyeY, eyeR * 2, eyeR * 2);

  // Pupils give the face somewhere to look.
  fill('white');
  noStroke();
  ellipse(leftEyeX, eyeY, 8, 8);
  ellipse(rightEyeX, eyeY, 8, 8);

  // Eyebrows: straight bars tilted by eyebrow_angle degrees. A positive angle
  // lifts the outer end of each brow, which reads as friendly and open.
  const a = radians(faceState.eyebrow_angle);
  const dx = browHalf * cos(a);
  const dy = browHalf * sin(a);
  stroke('white');
  strokeWeight(3);
  line(leftEyeX - dx, browY - dy, leftEyeX + dx, browY + dy);
  line(rightEyeX - dx, browY + dy, rightEyeX + dx, browY - dy);

  // Mouth: a parabola whose depth is mouth_curvature. Larger curvature drops
  // the middle further below the corners, which reads as a wider smile.
  noFill();
  strokeWeight(3);
  beginShape();
  for (let i = -mouthHalf; i <= mouthHalf; i += 2) {
    const frac = i / mouthHalf;
    vertex(64 + i, mouthY + faceState.mouth_curvature * (1 - frac * frac));
  }
  endShape();
  strokeWeight(1);
}

// ---------------------------------------------------------------------
// The readout panel: keyframe table, t values, arithmetic, and the
// interpolated dictionary
// ---------------------------------------------------------------------
function drawReadoutPanel(x, y, w, h) {
  const faceState = interpolateState(keyframeStart, keyframeEnd, activeT());
  const tLin = linearT();
  const tEase = easeInOut(tLin);
  const tNow = activeT();

  // Panel background
  fill(255, 255, 255, 235);
  stroke(200);
  rect(x, y, w, h, 10);
  noStroke();

  const px = x + 10;
  const pw = w - 20;
  let cy = y + 10;

  // --- Keyframe table -----------------------------------------------
  fill('black');
  textSize(14);
  textAlign(LEFT, TOP);
  text('Keyframes and the current frame', px, cy);
  cy += 22;

  // Four columns: parameter name, start value, end value, current value.
  const colStart = px + pw * 0.50;
  const colEnd = px + pw * 0.70;
  const colNow = px + pw * 0.90;
  const headerSize = fitTextSize('mouth_curvature', pw * 0.46, 13, 9);

  textSize(headerSize);
  fill('#546E7A');
  text('parameter', px, cy);
  textAlign(CENTER, TOP);
  text('start', colStart, cy);
  text('end', colEnd, cy);
  fill('#00695C');
  text('now', colNow, cy);
  cy += 18;

  stroke('#CFD8DC');
  line(px, cy - 3, px + pw, cy - 3);
  noStroke();

  for (const paramName of PARAM_NAMES) {
    fill('black');
    textAlign(LEFT, TOP);
    text(paramName, px, cy);
    textAlign(CENTER, TOP);
    text(nf(keyframeStart[paramName], 1, 0), colStart, cy);
    text(nf(keyframeEnd[paramName], 1, 0), colEnd, cy);
    fill('#00695C');
    text(nf(faceState[paramName], 1, 2), colNow, cy);
    cy += 19;
  }
  cy += 10;

  // --- The two progress values --------------------------------------
  const linearLine = 'Linear t = ' + currentStep + ' / ' + totalSteps +
    ' = ' + nf(tLin, 1, 2);
  const easedLine = 'Eased t = ease(' + nf(tLin, 1, 2) + ') = ' + nf(tEase, 1, 2);

  textAlign(LEFT, TOP);
  const tSize = min(fitTextSize(linearLine, pw, 13, 9),
    fitTextSize(easedLine, pw, 13, 9));
  textSize(tSize);

  // The active mode is bold black; the other mode stays gray so the learner
  // can compare both t values for the same step at a glance.
  fill(easingMode === 'linear' ? 'black' : '#90A4AE');
  text(linearLine, px, cy);
  cy += tSize + 5;
  fill(easingMode === 'eased' ? 'black' : '#90A4AE');
  text(easedLine, px, cy);
  cy += tSize + 9;

  // --- The arithmetic, one line per parameter -----------------------
  fill('black');
  textSize(13);
  text('interpolate_state() at t = ' + nf(tNow, 1, 2) + ':', px, cy);
  cy += 19;

  // Size all the arithmetic lines together so the column stays even.
  let mathSize = 13;
  for (const paramName of PARAM_NAMES) {
    mathSize = min(mathSize, fitTextSize(mathLine(paramName, tNow), pw, 13, 8));
  }
  textSize(mathSize);
  fill('#263238');
  for (const paramName of PARAM_NAMES) {
    text(mathLine(paramName, tNow), px, cy);
    cy += mathSize + 5;
  }
  cy += 8;

  // --- The resulting dictionary -------------------------------------
  // Shown whenever the panel still has room. On very short panels the "now"
  // column of the table above already carries the same two values.
  if (cy + 62 < y + h) {
    fill('black');
    textSize(13);
    text('The interpolated face state:', px, cy);
    cy += 19;

    const dictLines = [
      '{"eyebrow_angle": ' + nf(faceState.eyebrow_angle, 1, 2) + ',',
      ' "mouth_curvature": ' + nf(faceState.mouth_curvature, 1, 2) + '}'
    ];
    let dictSize = 13;
    for (const dictLine of dictLines) {
      dictSize = min(dictSize, fitTextSize(dictLine, pw, 13, 8));
    }
    textSize(dictSize);
    fill('#00695C');
    for (const dictLine of dictLines) {
      text(dictLine, px, cy);
      cy += dictSize + 4;
    }
  }

  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
}

// Build one line of visible arithmetic, matching the chapter's formula:
//   result[key] = start[key] + (end[key] - start[key]) * t
function mathLine(paramName, t) {
  const s = keyframeStart[paramName];
  const e = keyframeEnd[paramName];
  return paramName + ' = ' + s + ' + (' + e + ' - ' + s + ') * ' +
    nf(t, 1, 2) + ' = ' + nf(s + (e - s) * t, 1, 2);
}

// ---------------------------------------------------------------------
// Control-strip labels
// ---------------------------------------------------------------------
function drawControlLabels() {
  noStroke();
  fill('black');
  textSize(14);
  textAlign(LEFT, CENTER);
  text('Total steps: ' + totalSteps, sliderLeftMargin - 115, drawHeight + 60);
  textSize(defaultTextSize);
}
