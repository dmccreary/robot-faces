// Expression Menu Live Simulator MicroSim
// Chapter 14: Building an Expression Menu & Live Controls
// Bloom level: Apply (L3) with an optional Create (L6) extension
// Interaction: operate simulated hardware - two push buttons and a rotary
// knob - that drive the same menu logic as the chapter's final MicroPython
// program, then optionally remap which control performs which function.
//
// CANVAS_HEIGHT: 680

// ---------------------------------------------------------------------------
// Layout constants. Total height never changes; the control strip grows one
// row taller on narrow screens, so drawHeight is recomputed every frame.
// ---------------------------------------------------------------------------
let canvasWidth = 800;
let canvasHeight = 680;        // fixed total: matches CANVAS_HEIGHT above
let drawHeight = 590;          // recomputed by layoutControls()
let controlHeight = 90;        // recomputed by layoutControls()
let margin = 12;
let defaultTextSize = 16;
let sliderLeftMargin = 180;

// ---------------------------------------------------------------------------
// The 13 named expressions from Chapter 10, written in the state-dictionary
// vocabulary this chapter's menu code uses: eyebrow_angle, mouth_curve, and
// eye_openness. The first five entries copy the chapter's own EXPRESSIONS
// dictionary exactly; the other eight convert Chapter 10's recipes into the
// same three-key form, where eye_openness 1.0 means the normal eye size.
// ---------------------------------------------------------------------------
const EXPRESSIONS = [
  { name: 'neutral',   eyebrow_angle: 0,   mouth_curve: 0,  eye_openness: 1.0 },
  { name: 'happy',     eyebrow_angle: 5,   mouth_curve: 8,  eye_openness: 0.9 },
  { name: 'sad',       eyebrow_angle: -10, mouth_curve: -8, eye_openness: 0.7,
    eyelid: 0.18 },
  { name: 'angry',     eyebrow_angle: -25, mouth_curve: -5, eye_openness: 0.8 },
  { name: 'afraid',    eyebrow_angle: 16,  mouth_curve: -2, eye_openness: 1.5,
    mouth_open: true },
  { name: 'surprised', eyebrow_angle: 30,  mouth_curve: 2,  eye_openness: 1.3,
    mouth_open: true },
  { name: 'disgusted', eyebrow_angle: -8,  mouth_curve: -3, eye_openness: 0.75,
    eyebrow_angle_left: -12, eyebrow_angle_right: -3,
    mouth_one_side: 4, mouth_offset_x: -5 },
  { name: 'contempt',  eyebrow_angle: 0,   mouth_curve: 0,  eye_openness: 1.0,
    mouth_one_side: 6 },
  { name: 'tired',     eyebrow_angle: -2,  mouth_curve: -2, eye_openness: 1.0,
    eyelid: 0.45 },
  { name: 'stern',     eyebrow_angle: -4,  mouth_curve: 0,  eye_openness: 1.0 },
  { name: 'sleepy',    eyebrow_angle: -1,  mouth_curve: -1, eye_openness: 1.0,
    eyelid: 0.8 },
  { name: 'confused',  eyebrow_angle: 4,   mouth_curve: 1,  eye_openness: 1.0,
    eyebrow_angle_left: 14, eyebrow_angle_right: -6, mouth_tilt: 2 },
  { name: 'excited',   eyebrow_angle: 14,  mouth_curve: 10, eye_openness: 1.5,
    mouth_open: true }
];

const SURPRISE_INDEX = 5;        // index of 'surprised' in the list above
const SURPRISE_BURST_MS = 150;   // the chapter's overshoot window
const SURPRISE_BURST_ANGLE = 40; // the chapter's overshoot eyebrow_angle
const NAME_FLASH_MS = 500;       // how long the new name stays on screen

// ---------------------------------------------------------------------------
// Menu state, mirroring the variables in the chapter's final program
// ---------------------------------------------------------------------------
let currentIndex = 0;
let faceState = {};              // the live copy of one expression's parameters
let tuningMode = false;
let lastActivityMs = 0;
let nameFlashUntil = 0;
let surpriseBurstStart = null;
let isIdle = false;
let blinkPhase = 0;              // drives the idle blink
let mouseOverCanvas = false;

// Simulated hardware
let knobDeg = 0;                 // -135 to +135 degrees of knob rotation
let lastDetent = 0;              // step counter used for step-style functions
let draggingKnob = false;
let pressedControl = '';         // which simulated button is visually held down

// Control mapping. Any of the three functions can sit on any control.
let controlMap = { btn1: 'Next', btn2: 'Tune', knob: 'Adjust' };
let dragFunction = '';           // function label currently being dragged
let dragFromControl = '';
let dragX = 0;
let dragY = 0;

// p5 controls (all of them live in the control strip below drawHeight)
let remapCheckbox;
let idleSlider;
let resetButton;

// Hit boxes for the simulated hardware, refreshed every frame
let hw = { btn1: null, btn2: null, knob: null };

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
function setup() {
  updateCanvasSize();
  const cnv = createCanvas(canvasWidth, canvasHeight);
  const parentEl = document.querySelector('main');
  cnv.parent(parentEl);
  cnv.mouseOver(function () { mouseOverCanvas = true; });
  cnv.mouseOut(function () { mouseOverCanvas = false; });

  remapCheckbox = createCheckbox(' Advanced: remap controls', false);
  remapCheckbox.parent(parentEl);

  resetButton = createButton('Reset Menu');
  resetButton.parent(parentEl);
  resetButton.mousePressed(resetMenu);

  idleSlider = createSlider(1, 12, 8, 1);
  idleSlider.parent(parentEl);

  applyExpression(0, true);
  lastActivityMs = millis();
  layoutControls();
  positionControls();

  describe(
    'A simulated expression menu. Two on-screen push buttons and a rotary ' +
    'knob drive a live robot-face preview. One button advances through ' +
    'thirteen named expressions, the other toggles live-tuning mode, and the ' +
    'knob reshapes the mouth curve while tuning is on. Entering the surprised ' +
    'expression briefly overshoots the eyebrow angle. After the idle timeout ' +
    'passes with no input, the face returns to its neutral idle state. An ' +
    'advanced mode lets the learner drag function labels between the controls.'
  );
}

// ---------------------------------------------------------------------------
// Responsive sizing
// ---------------------------------------------------------------------------
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
  positionControls();
}

// Narrow screens need an extra control row, so the drawing area shrinks.
function layoutControls() {
  controlHeight = canvasWidth < 470 ? 125 : 90;
  drawHeight = canvasHeight - controlHeight;
}

function positionControls() {
  const rowY = drawHeight + 8;
  remapCheckbox.position(10, rowY);

  if (canvasWidth < 470) {
    resetButton.position(10, rowY + 32);
    idleSlider.position(sliderLeftMargin, rowY + 66);
  } else {
    resetButton.position(230, rowY - 3);
    idleSlider.position(sliderLeftMargin, rowY + 32);
  }
  idleSlider.size(max(80, canvasWidth - sliderLeftMargin - margin));
}

// ---------------------------------------------------------------------------
// Menu logic - the same steps as the chapter's MicroPython program
// ---------------------------------------------------------------------------

// Copy one expression's dictionary into the live face state.
function applyExpression(index, quiet) {
  currentIndex = index;
  const src = EXPRESSIONS[index];
  faceState = {};
  for (const property in src) {
    faceState[property] = src[property];
  }
  // While the knob is mapped to Adjust it always shows the current mouth_curve.
  if (controlMap.knob === 'Adjust') {
    knobDeg = map(faceState.mouth_curve, -10, 10, -135, 135);
    lastDetent = round(knobDeg / 30);
  }

  if (src.name === 'surprised') {
    surpriseBurstStart = millis();   // arms the state-based animation trigger
  } else {
    surpriseBurstStart = null;
  }
  if (!quiet) {
    nameFlashUntil = millis() + NAME_FLASH_MS;
    noteActivity();
  }
}

function nextExpression() {
  applyExpression((currentIndex + 1) % EXPRESSIONS.length, false);
}

function toggleTuning() {
  tuningMode = !tuningMode;
  noteActivity();
}

// Any real input resets the inactivity timer and wakes the face from idle.
function noteActivity() {
  lastActivityMs = millis();
  isIdle = false;
}

function resetMenu() {
  tuningMode = false;
  controlMap = { btn1: 'Next', btn2: 'Tune', knob: 'Adjust' };
  applyExpression(0, false);
}

// Run one control's mapped function. A push button can only step a continuous
// value, which is exactly why the chapter maps Adjust to the knob instead.
function runFunction(fn, sourceIsKnob) {
  if (fn === 'Next') {
    nextExpression();
  } else if (fn === 'Tune') {
    toggleTuning();
  } else if (fn === 'Adjust' && !sourceIsKnob) {
    if (tuningMode) {
      let curve = faceState.mouth_curve + 2;
      if (curve > 10) curve = -10;
      faceState.mouth_curve = curve;
      knobDeg = map(curve, -10, 10, -135, 135);
    }
    noteActivity();
  }
}

// ---------------------------------------------------------------------------
// Mouse handling for the simulated hardware
// ---------------------------------------------------------------------------
function insideBox(box, mx, my) {
  return box && mx > box.x && mx < box.x + box.w &&
         my > box.y && my < box.y + box.h;
}

function mousePressed() {
  if (mouseY > drawHeight) return;

  // In remap mode, pressing a function badge starts a drag.
  if (remapCheckbox.checked()) {
    const targets = ['btn1', 'btn2', 'knob'];
    for (let i = 0; i < targets.length; i++) {
      const box = hw[targets[i]];
      if (box && insideBox(box.badge, mouseX, mouseY)) {
        dragFunction = controlMap[targets[i]];
        dragFromControl = targets[i];
        dragX = mouseX;
        dragY = mouseY;
        return;
      }
    }
  }

  if (insideBox(hw.btn1, mouseX, mouseY)) {
    pressedControl = 'btn1';
    runFunction(controlMap.btn1, false);
    return;
  }
  if (insideBox(hw.btn2, mouseX, mouseY)) {
    pressedControl = 'btn2';
    runFunction(controlMap.btn2, false);
    return;
  }
  if (hw.knob) {
    const d = dist(mouseX, mouseY, hw.knob.cx, hw.knob.cy);
    if (d < hw.knob.r + 8) {
      draggingKnob = true;
      turnKnobTo(mouseX, mouseY);
    }
  }
}

function mouseDragged() {
  if (dragFunction !== '') {
    dragX = mouseX;
    dragY = mouseY;
    return;
  }
  if (draggingKnob) turnKnobTo(mouseX, mouseY);
}

function mouseReleased() {
  pressedControl = '';
  draggingKnob = false;

  // Dropping a function badge on another control swaps the two functions.
  if (dragFunction !== '') {
    const targets = ['btn1', 'btn2', 'knob'];
    for (let i = 0; i < targets.length; i++) {
      const box = hw[targets[i]];
      const zone = targets[i] === 'knob'
        ? { x: box.cx - box.r, y: box.cy - box.r,
            w: box.r * 2, h: box.r * 2 + 34 }
        : box;
      if (insideBox(zone, mouseX, mouseY) && targets[i] !== dragFromControl) {
        const displaced = controlMap[targets[i]];
        controlMap[targets[i]] = dragFunction;
        controlMap[dragFromControl] = displaced;
        noteActivity();
        break;
      }
    }
    dragFunction = '';
    dragFromControl = '';
  }
}

// Convert a mouse position into a knob angle, then run the knob's function.
function turnKnobTo(mx, my) {
  const raw = degrees(atan2(mx - hw.knob.cx, hw.knob.cy - my));
  knobDeg = constrain(raw, -135, 135);

  if (controlMap.knob === 'Adjust') {
    if (tuningMode) {
      // Live parameter tuning: the same map_range() idea as the chapter's code.
      faceState.mouth_curve = round(map(knobDeg, -135, 135, -10, 10));
      noteActivity();
    }
  } else {
    // Mapped to a step action, the knob behaves like a detented encoder:
    // every 30 degrees of rotation counts as exactly one step.
    const detent = round(knobDeg / 30);
    if (detent !== lastDetent) {
      runFunction(controlMap.knob, true);
      knobDeg = constrain(raw, -135, 135);   // keep the knob under the mouse
      lastDetent = detent;
    }
  }
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------
function draw() {
  updateCanvasSize();
  layoutControls();
  positionControls();

  const now = millis();

  // Inactivity timer: fall back to the default idle state, exactly like the
  // chapter's IDLE_TIMEOUT_MS check.
  const idleTimeoutMs = idleSlider.value() * 1000;
  if (!isIdle && now - lastActivityMs > idleTimeoutMs) {
    isIdle = true;
    tuningMode = false;
    applyExpression(0, true);
  }
  if (mouseOverCanvas) blinkPhase += deltaTime / 1000;

  stroke('silver');
  fill('aliceblue');
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  const narrow = canvasWidth < 650;

  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(narrow ? 18 : 22);
  text('Expression Menu Live Simulator', canvasWidth / 2, 6);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);

  // Build the state the face is actually drawn from, triggers included.
  const shown = renderState(now);

  if (narrow) {
    const faceW = min(canvasWidth - 2 * margin, 300);
    const faceH = faceW / 2;
    drawFaceOn((canvasWidth - faceW) / 2, 34, faceW, faceH, shown);
    drawNameFlash(canvasWidth / 2, 34 + faceH + 3, now);
    const hwTop = 34 + faceH + 28;
    drawHardware(margin, hwTop, canvasWidth - 2 * margin, 132);
    drawInfoPanel(margin, hwTop + 140, canvasWidth - 2 * margin,
      drawHeight - hwTop - 150, shown, true);
  } else {
    const leftW = floor(canvasWidth * 0.6);
    const colW = leftW - 2 * margin;
    const faceW = min(colW, 460);
    const faceH = faceW / 2;
    const hwH = max(140, min(190, drawHeight - 60 - faceH - 32));
    // Center the face and the hardware panel in the left column together.
    const topY = 44 + max(0, (drawHeight - 56 - (faceH + 32 + hwH)) / 2);
    drawFaceOn(margin + (colW - faceW) / 2, topY, faceW, faceH, shown);
    drawNameFlash(margin + colW / 2, topY + faceH + 5, now);
    drawHardware(margin, topY + faceH + 32, colW, hwH);
    drawInfoPanel(leftW + 4, 44, canvasWidth - leftW - margin - 4,
      drawHeight - 56, shown, false);
  }

  if (dragFunction !== '') drawDragGhost();
  drawControlLabels();
}

// Apply the state-based animation trigger on top of the resting parameters.
// This is the chapter's apply_animation_triggers() function, in JavaScript.
function renderState(now) {
  const shown = {};
  for (const property in faceState) shown[property] = faceState[property];

  shown.burstActive = false;
  if (currentIndex === SURPRISE_INDEX && surpriseBurstStart !== null) {
    if (now - surpriseBurstStart < SURPRISE_BURST_MS) {
      shown.eyebrow_angle = SURPRISE_BURST_ANGLE;   // brief overshoot
      shown.burstActive = true;
    } else {
      shown.eyebrow_angle = EXPRESSIONS[SURPRISE_INDEX].eyebrow_angle;
    }
  }

  // Idle animation: the slow blink Chapter 12 built, reused as the home state.
  if (isIdle) {
    const cycle = blinkPhase % 3.4;
    if (cycle > 3.1) {
      const t = (cycle - 3.1) / 0.3;
      shown.eyelid = 1 - abs(t - 0.5) * 2;
    }
  }
  return shown;
}

// ---------------------------------------------------------------------------
// Face rendering. Every measurement is written in the 128 x 64 display's own
// pixel units and then scaled, so one state dictionary renders the same way
// at any size - the same approach the Chapter 10 flashcard gallery uses.
// ---------------------------------------------------------------------------
function drawFaceOn(x, y, w, h, st) {
  const sx = w / 128;
  const sy = h / 64;
  const px = function (dx) { return x + dx * sx; };
  const py = function (dy) { return y + dy * sy; };

  push();
  noStroke();
  fill(12);                                   // an unlit OLED screen
  rect(x, y, w, h, 5);

  const openness = st.eye_openness === undefined ? 1 : st.eye_openness;
  const eyeR = 8 * openness;                  // eye_openness 1.0 = normal size
  const eyeCy = 27;
  const spacing = 44;
  const eyes = [
    { cx: 64 - spacing / 2, side: -1 },
    { cx: 64 + spacing / 2, side: 1 }
  ];

  for (let i = 0; i < eyes.length; i++) {
    const cx = eyes[i].cx;

    noStroke();
    fill(255);
    ellipse(px(cx), py(eyeCy), eyeR * 2 * sx, eyeR * 2 * sy);

    fill(12);                                 // pupil, drawn unlit
    ellipse(px(cx), py(eyeCy), eyeR * 0.7 * sx, eyeR * 0.7 * sy);

    const lid = st.eyelid || 0;               // an unlit band over the eye top
    if (lid > 0) {
      rect(px(cx - eyeR - 1), py(eyeCy - eyeR - 1),
        (eyeR * 2 + 2) * sx, (eyeR * 2 * lid + 1) * sy);
    }

    // Eyebrow. A positive eyebrow_angle lifts the brow away from the eye and
    // tilts its outer end up; a negative angle presses it down onto the eye.
    // Height carries most of the emotional signal, which is what gives
    // surprise its lifted brow and anger its heavy, low one.
    let angle = st.eyebrow_angle;
    if (eyes[i].side < 0 && st.eyebrow_angle_left !== undefined) {
      angle = st.eyebrow_angle_left;
    }
    if (eyes[i].side > 0 && st.eyebrow_angle_right !== undefined) {
      angle = st.eyebrow_angle_right;
    }
    const a = angle || 0;
    const tilt = constrain(a * 0.12, -4, 4);
    const browY = constrain(eyeCy - eyeR - 3.5 - a * 0.22,
      2 + abs(tilt), eyeCy - eyeR - 0.5);
    const outerY = browY - tilt;
    const innerY = browY + tilt;
    stroke(255);
    strokeWeight(max(2, 3 * sy));
    if (eyes[i].side < 0) {
      line(px(cx - 11), py(outerY), px(cx + 11), py(innerY));
    } else {
      line(px(cx - 11), py(innerY), px(cx + 11), py(outerY));
    }
  }

  // Mouth
  const my = 49;
  const curv = st.mouth_curve || 0;
  const shift = st.mouth_offset_x || 0;
  const oneSide = st.mouth_one_side || 0;
  const tiltM = st.mouth_tilt || 0;

  if (st.mouth_open) {
    noStroke();
    fill(255);
    ellipse(px(64 + shift), py(my), (20 + abs(curv)) * sx,
      (11 + abs(curv) * 0.5) * sy);
  } else {
    noFill();
    stroke(255);
    strokeWeight(max(2, 3 * sy));
    beginShape();
    vertex(px(64 - 16 + shift), py(my + tiltM));
    quadraticVertex(px(64 + shift), py(my + curv * 1.1),
      px(64 + 16 + shift), py(my - tiltM - oneSide));
    endShape();
  }
  pop();
}

// The name label that flashes for about half a second after every advance.
function drawNameFlash(cx, y, now) {
  if (now > nameFlashUntil) return;
  noStroke();
  fill('#1565C0');
  textAlign(CENTER, TOP);
  textSize(20);
  text(EXPRESSIONS[currentIndex].name.toUpperCase(), cx, y);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}

// ---------------------------------------------------------------------------
// Simulated hardware panel: two push buttons and one rotary knob
// ---------------------------------------------------------------------------
function drawHardware(x, y, w, h) {
  fill(255, 255, 255, 220);
  stroke(200);
  rect(x, y, w, h, 10);

  noStroke();
  fill('dimgray');
  textAlign(LEFT, TOP);
  textSize(13);
  text('Simulated hardware', x + 10, y + 8);

  const tight = w < 330;
  const btnW = tight ? 68 : 84;
  const btnH = 44;
  const btnY = y + 32;
  const knobR = tight ? 25 : 30;
  const gap = tight ? 10 : 16;

  hw.btn1 = { x: x + 12, y: btnY, w: btnW, h: btnH,
    badge: { x: x + 12, y: btnY + btnH + 4, w: btnW, h: 20 } };
  hw.btn2 = { x: x + 12 + btnW + gap, y: btnY, w: btnW, h: btnH,
    badge: { x: x + 12 + btnW + gap, y: btnY + btnH + 4, w: btnW, h: 20 } };

  const knobCx = x + 12 + btnW * 2 + gap * 2 + knobR + 6;
  const knobCy = btnY + btnH / 2;
  hw.knob = { cx: knobCx, cy: knobCy, r: knobR,
    badge: { x: knobCx - 32, y: knobCy + knobR + 6, w: 64, h: 20 } };

  drawPushButton(hw.btn1, 'btn1');
  drawPushButton(hw.btn2, 'btn2');
  drawKnob();

  // A short note whenever the current mapping is a poor fit for the control.
  noStroke();
  textSize(12);
  fill('#5D4037');
  let note = '';
  if (controlMap.btn1 === 'Adjust' || controlMap.btn2 === 'Adjust') {
    note = 'A push button can only step mouth_curve 2 at a time.';
  } else if (controlMap.knob === 'Tune') {
    note = 'The knob now flips tuning mode every 30 degrees you turn it.';
  } else if (controlMap.knob === 'Next') {
    note = 'Each 30 degrees of knob rotation now counts as one menu step.';
  }
  if (note !== '') text(note, x + 10, y + h - 22, w - 20, 20);
  textSize(defaultTextSize);
}

function drawPushButton(box, id) {
  const held = pressedControl === id;
  stroke('#455A64');
  strokeWeight(1.5);
  fill(held ? '#B0BEC5' : '#ECEFF1');
  rect(box.x, box.y + (held ? 2 : 0), box.w, box.h, 6);
  noStroke();
  fill('black');
  textAlign(CENTER, CENTER);
  textSize(15);
  text(controlMap[id].toUpperCase(), box.x + box.w / 2,
    box.y + box.h / 2 + (held ? 2 : 0));
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
  drawFunctionBadge(box.badge, controlMap[id], id);
}

function drawKnob() {
  const k = hw.knob;
  // The knob is dimmed whenever turning it would do nothing at all.
  const live = controlMap.knob !== 'Adjust' || tuningMode;
  stroke(live ? '#37474F' : '#B0BEC5');
  strokeWeight(2);
  fill(live ? '#CFD8DC' : '#EEEEEE');
  ellipse(k.cx, k.cy, k.r * 2, k.r * 2);

  push();
  translate(k.cx, k.cy);
  rotate(radians(knobDeg));
  stroke(live ? '#D32F2F' : '#BDBDBD');
  strokeWeight(4);
  line(0, 0, 0, -k.r + 7);
  pop();

  noStroke();
  fill(live ? 'black' : 'gray');
  textAlign(CENTER, BOTTOM);
  textSize(12);
  text('knob', k.cx, k.cy - k.r - 4);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
  drawFunctionBadge(k.badge, controlMap.knob, 'knob');
}

// In remap mode each control wears a draggable label naming its function.
function drawFunctionBadge(box, label, id) {
  if (!remapCheckbox.checked()) return;
  if (dragFunction !== '' && dragFromControl === id) return;
  stroke('#00897B');
  strokeWeight(1.5);
  fill('#E0F2F1');
  rect(box.x, box.y, box.w, box.h, 10);
  noStroke();
  fill('#004D40');
  textAlign(CENTER, CENTER);
  textSize(12);
  text(label, box.x + box.w / 2, box.y + box.h / 2);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}

function drawDragGhost() {
  stroke('#00897B');
  strokeWeight(1.5);
  fill('#B2DFDB');
  rect(dragX - 42, dragY - 10, 84, 20, 10);
  noStroke();
  fill('#004D40');
  textAlign(CENTER, CENTER);
  textSize(12);
  text(dragFunction, dragX, dragY);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}

// ---------------------------------------------------------------------------
// Information panel: name, mode indicators, live state, and control mapping
// ---------------------------------------------------------------------------
function drawInfoPanel(x, y, w, h, shown, compact) {
  fill(255, 255, 255, 235);
  stroke(200);
  rect(x, y, w, h, 10);

  noStroke();
  textAlign(LEFT, TOP);
  const innerX = x + 12;
  const wrapW = w - 24;
  let cursorY = y + 10;

  fill('black');
  textSize(18);
  text(EXPRESSIONS[currentIndex].name, innerX, cursorY, wrapW, 24);
  cursorY += 23;

  fill('dimgray');
  textSize(13);
  text('expression ' + (currentIndex + 1) + ' of ' + EXPRESSIONS.length,
    innerX, cursorY, wrapW, 18);
  cursorY += 22;

  // Tuning-mode indicator, plus an idle badge when the timeout has passed
  fill(tuningMode ? '#2E7D32' : '#9E9E9E');
  rect(innerX, cursorY, 116, 22, 6);
  fill('white');
  textAlign(CENTER, CENTER);
  textSize(13);
  text(tuningMode ? 'TUNING: ON' : 'TUNING: OFF', innerX + 58, cursorY + 11);
  if (isIdle) {
    fill('#EF6C00');
    noStroke();
    rect(innerX + 124, cursorY, 62, 22, 6);
    fill('white');
    text('IDLE', innerX + 155, cursorY + 11);
  }
  textAlign(LEFT, TOP);
  cursorY += 30;

  // The live state dictionary, and the control-mapping legend. On narrow
  // screens the two lists sit side by side to save vertical room.
  const colTop = cursorY;
  const colW = compact ? wrapW / 2 : wrapW;

  fill('black');
  textSize(13);
  text('state dictionary', innerX, cursorY, colW, 18);
  cursorY += 19;
  fill(shown.burstActive ? '#E65100' : '#1A237E');
  text('eyebrow_angle: ' + shown.eyebrow_angle +
    (shown.burstActive ? '  (overshoot)' : ''), innerX, cursorY, colW, 18);
  cursorY += 18;
  fill('#1A237E');
  text('mouth_curve: ' + shown.mouth_curve, innerX, cursorY, colW, 18);
  cursorY += 18;
  text('eye_openness: ' + nf(shown.eye_openness, 1, 2), innerX, cursorY,
    colW, 18);
  cursorY += 24;

  const mapX = compact ? innerX + wrapW / 2 : innerX;
  let mapY = compact ? colTop : cursorY;
  fill('black');
  textSize(13);
  text('control mapping', mapX, mapY, colW, 18);
  mapY += 19;
  fill('#37474F');
  text('Button 1  ->  ' + controlMap.btn1, mapX, mapY, colW, 18);
  mapY += 18;
  text('Button 2  ->  ' + controlMap.btn2, mapX, mapY, colW, 18);
  mapY += 18;
  text('Knob  ->  ' + controlMap.knob, mapX, mapY, colW, 18);
  mapY += 24;

  cursorY = compact ? max(cursorY, mapY) : mapY;

  // Whatever the learner most needs to know right now
  fill('#37474F');
  textSize(12);
  let hint;
  let extra;
  if (remapCheckbox.checked()) {
    hint = 'Drag a teal label onto another control to swap them.';
    extra = 'The expression data never changes, only who triggers what.';
  } else if (shown.burstActive) {
    hint = 'Trigger: eyebrow_angle holds 40 for 150 ms, then 30.';
    extra = 'That brief overshoot is the state-based animation trigger.';
  } else if (isIdle) {
    hint = 'Idle timeout passed, so the face returned to neutral.';
    extra = 'It blinks slowly instead of freezing, just like Chapter 12.';
  } else if (tuningMode) {
    hint = 'Tuning is on, so the knob rewrites mouth_curve live.';
    extra = 'The face redraws on the very next frame, with no apply step.';
  } else {
    hint = 'The knob does nothing until tuning mode is on.';
    extra = 'That gate is a design choice, not a bug.';
  }
  const remaining = y + h - cursorY - 8;
  if (remaining > 18) {
    text(compact ? hint : hint + ' ' + extra, innerX, cursorY, wrapW,
      remaining);
  }
  textSize(defaultTextSize);
}

// Labels drawn inside the white control strip.
function drawControlLabels() {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(14);
  const rowY = drawHeight + 8;
  const secondRow = canvasWidth < 470 ? rowY + 76 : rowY + 42;
  text('Idle timeout: ' + idleSlider.value() + ' s', 10, secondRow);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}
