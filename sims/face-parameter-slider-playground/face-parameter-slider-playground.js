// Face Parameter Slider Playground MicroSim
// Chapter 9: Facial Anatomy and Layout Design
// Bloom level: Create (L6) - construct, design
// Interaction: four live sliders build one face_state dictionary. Every move
// redraws the whole face, so a design choice and its visual proof arrive at
// the same instant.
//
// CANVAS_HEIGHT: 545

// ---------------------------------------------------------------------------
// Layout constants (standard MicroSim pattern)
// ---------------------------------------------------------------------------
let canvasWidth = 800;
let drawHeight = 360;
let controlHeight = 185;          // 1 button row + 4 slider rows
let canvasHeight = drawHeight + controlHeight;
let margin = 12;
let sliderLeftMargin = 200;
let defaultTextSize = 16;

// The simulated frame buffer is a 128 x 64 OLED, exactly the display the
// chapter's MicroPython code writes to.
const OLED_W = 128;
const OLED_H = 64;

// Fixed parts of the face state. These match default_face_state(128, 64).
const EYE_Y = 28;                 // height // 2 - height // 16
const PUPIL_SIZE = 3;             // height // 20
const GAZE_OFFSET_X = 0;
const MOUTH_Y = 48;               // int(height * 0.75)
const MOUTH_WIDTH = 42;           // width // 3

// Neutral starting values, from default_face_state()
const DEFAULT_EYE_SIZE = 8;
const DEFAULT_EYE_SPACING = 40;
const DEFAULT_EYEBROW_ANGLE = 0;
const DEFAULT_MOUTH_CURVATURE = 6;

// ---------------------------------------------------------------------------
// The four parameters the learner designs
// ---------------------------------------------------------------------------
let eyeSize = DEFAULT_EYE_SIZE;
let eyeSpacing = DEFAULT_EYE_SPACING;
let eyebrowAngle = DEFAULT_EYEBROW_ANGLE;
let mouthCurvature = DEFAULT_MOUTH_CURVATURE;

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
let eyeSizeSlider, eyeSpacingSlider, eyebrowAngleSlider, mouthCurvatureSlider;
let randomizeButton, resetButton;

// ---------------------------------------------------------------------------
// Computed layout, refreshed every frame
// ---------------------------------------------------------------------------
let isNarrow = false;
let faceX = 0, faceY = 0, faceW = 0, faceH = 0;
let panelX = 0, panelY = 0, panelW = 0, panelH = 0;
const TITLE_H = 34;

function setup() {
  updateCanvasSize();
  const cnv = createCanvas(canvasWidth, canvasHeight);
  const parentEl = document.querySelector('main');
  cnv.parent(parentEl);

  eyeSizeSlider = createSlider(4, 16, DEFAULT_EYE_SIZE, 1);
  eyeSpacingSlider = createSlider(20, 60, DEFAULT_EYE_SPACING, 1);
  eyebrowAngleSlider = createSlider(-30, 30, DEFAULT_EYEBROW_ANGLE, 1);
  mouthCurvatureSlider = createSlider(-10, 10, DEFAULT_MOUTH_CURVATURE, 1);

  randomizeButton = createButton('Randomize');
  randomizeButton.mousePressed(randomizeFace);

  resetButton = createButton('Reset to Default');
  resetButton.mousePressed(resetFace);

  // Every control is parented into <main> so it lands inside the iframe.
  const allControls = [eyeSizeSlider, eyeSpacingSlider, eyebrowAngleSlider,
    mouthCurvatureSlider, randomizeButton, resetButton];
  for (let i = 0; i < allControls.length; i++) {
    allControls[i].parent(parentEl);
  }

  positionControls();

  describe(
    'A face parameter playground. On the left, a simulated 128 by 64 pixel ' +
    'OLED shows a white robot face on a black screen: an oval face outline, ' +
    'two tilted eyebrows, two eyes with pupils, and a curved mouth. On the ' +
    'right, a Python face_state dictionary lists every parameter and its ' +
    'current value. Four sliders below set eye size, eye spacing, eyebrow ' +
    'angle, and mouth curvature. A Randomize button picks new values for all ' +
    'four at once and a Reset button restores the neutral defaults. A short ' +
    'label under the face guesses what the current combination reads as.'
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
  positionControls();
}

function positionControls() {
  const sliderW = max(80, canvasWidth - sliderLeftMargin - margin);

  randomizeButton.position(10, drawHeight + 6);
  resetButton.position(110, drawHeight + 6);

  eyeSizeSlider.position(sliderLeftMargin, drawHeight + 42);
  eyeSpacingSlider.position(sliderLeftMargin, drawHeight + 77);
  eyebrowAngleSlider.position(sliderLeftMargin, drawHeight + 112);
  mouthCurvatureSlider.position(sliderLeftMargin, drawHeight + 147);

  eyeSizeSlider.size(sliderW);
  eyeSpacingSlider.size(sliderW);
  eyebrowAngleSlider.size(sliderW);
  mouthCurvatureSlider.size(sliderW);
}

// ---------------------------------------------------------------------------
// Button actions
// ---------------------------------------------------------------------------
function randomizeFace() {
  eyeSizeSlider.value(floor(random(4, 17)));
  eyeSpacingSlider.value(floor(random(20, 61)));
  eyebrowAngleSlider.value(floor(random(-30, 31)));
  mouthCurvatureSlider.value(floor(random(-10, 11)));
}

function resetFace() {
  eyeSizeSlider.value(DEFAULT_EYE_SIZE);
  eyeSpacingSlider.value(DEFAULT_EYE_SPACING);
  eyebrowAngleSlider.value(DEFAULT_EYEBROW_ANGLE);
  mouthCurvatureSlider.value(DEFAULT_MOUTH_CURVATURE);
}

// ---------------------------------------------------------------------------
// The face state dictionary. This is the whole point of the chapter: one bag
// of numbers that a single draw_face() call turns into a complete expression.
// ---------------------------------------------------------------------------
function eyebrowY(eyeYValue, eyeSizeValue) {
  // The brow rides just above the eye, so it stays visible at every eye size.
  return constrain(eyeYValue - eyeSizeValue - 6, 5, 24);
}

function buildFaceState() {
  return {
    eye_size: eyeSize,
    eye_spacing: eyeSpacing,
    eye_y: EYE_Y,
    pupil_size: PUPIL_SIZE,
    gaze_offset_x: GAZE_OFFSET_X,
    eyebrow_angle: eyebrowAngle,
    eyebrow_y: eyebrowY(EYE_Y, eyeSize),
    mouth_curvature: mouthCurvature,
    mouth_y: MOUTH_Y,
    mouth_width: MOUTH_WIDTH
  };
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------
function computeLayout() {
  isNarrow = canvasWidth < 600;

  if (isNarrow) {
    // Dictionary readout stacks below the face.
    panelH = 190;
    panelX = margin;
    panelW = canvasWidth - 2 * margin;
    panelY = drawHeight - panelH - margin;

    const areaTop = TITLE_H;
    const areaH = panelY - areaTop - 30;      // 30 leaves room for the hint line
    const areaW = canvasWidth - 2 * margin;
    faceW = min(areaW, areaH * (OLED_W / OLED_H));
    faceH = faceW / (OLED_W / OLED_H);
    faceX = (canvasWidth - faceW) / 2;
    faceY = areaTop + (areaH - faceH) / 2;
  } else {
    panelW = max(215, floor(canvasWidth * 0.38));
    panelX = canvasWidth - panelW - margin;
    panelY = TITLE_H;
    panelH = drawHeight - TITLE_H - margin;

    const areaW = panelX - 2 * margin;
    const areaTop = TITLE_H;
    const areaH = drawHeight - areaTop - 34;  // 34 leaves room for the hint line
    faceW = min(areaW, areaH * (OLED_W / OLED_H));
    faceH = faceW / (OLED_W / OLED_H);
    faceX = margin + (areaW - faceW) / 2;
    faceY = areaTop + (areaH - faceH) / 2;
  }
}

// ---------------------------------------------------------------------------
// Main draw loop
// ---------------------------------------------------------------------------
function draw() {
  updateCanvasSize();

  // Read the controls once per frame.
  eyeSize = eyeSizeSlider.value();
  eyeSpacing = eyeSpacingSlider.value();
  eyebrowAngle = eyebrowAngleSlider.value();
  mouthCurvature = mouthCurvatureSlider.value();

  computeLayout();

  stroke('silver');
  fill('aliceblue');
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  drawTitle();

  const state = buildFaceState();
  drawFaceDisplay(faceX, faceY, faceW, state);
  drawReadsAsHint();
  drawDictionaryPanel(state);
  drawControlLabels();
}

function drawTitle() {
  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(canvasWidth < 520 ? 17 : 22);
  const titleX = isNarrow ? canvasWidth / 2 : (canvasWidth - panelW) / 2;
  text('One Dictionary of Numbers, One Whole Face', titleX, 7);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}

// ---------------------------------------------------------------------------
// Face rendering. Everything below works in the OLED's own 128 x 64 coordinate
// space, then scales up, so the numbers here are the same numbers the
// MicroPython code would send to the real display.
// ---------------------------------------------------------------------------
function drawFaceDisplay(px, py, pw, state) {
  const s = pw / OLED_W;
  const ph = OLED_H * s;

  push();
  translate(px, py);
  scale(s);

  // 1. Background first, exactly the draw order draw_face() uses.
  noStroke();
  fill('black');
  rect(0, 0, OLED_W, OLED_H);

  const centerX = OLED_W / 2;

  // 2. Face outline: an unfilled ellipse. Radii become diameters for p5.
  noFill();
  stroke('white');
  strokeWeight(1.4 / s);
  ellipse(centerX, OLED_H / 2, (OLED_W / 2 - 4) * 2, (OLED_H / 2 - 4) * 2);

  // 3. Eyebrows, mirrored around the vertical centerline.
  const browHalfW = 11;
  const browThick = 3;
  const leftEyeX = centerX - state.eye_spacing / 2;
  const rightEyeX = centerX + state.eye_spacing / 2;
  noStroke();
  fill('white');
  drawEyebrow(leftEyeX, state.eyebrow_y, browHalfW, browThick, state.eyebrow_angle, -1);
  drawEyebrow(rightEyeX, state.eyebrow_y, browHalfW, browThick, state.eyebrow_angle, 1);

  // 4. Eyes: the larger shape before its own smaller detail.
  fill('white');
  ellipse(leftEyeX, state.eye_y, state.eye_size * 2, state.eye_size * 2);
  ellipse(rightEyeX, state.eye_y, state.eye_size * 2, state.eye_size * 2);

  // 5. Pupils, the smallest eye detail, drawn last inside the eyes.
  fill('black');
  const gaze = state.gaze_offset_x;
  ellipse(leftEyeX + gaze, state.eye_y, state.pupil_size * 2, state.pupil_size * 2);
  ellipse(rightEyeX + gaze, state.eye_y, state.pupil_size * 2, state.pupil_size * 2);

  // 6. Mouth, a half-ellipse curve using the quadrant fill idea.
  fill('white');
  drawMouth(centerX, state.mouth_y, state.mouth_width, state.mouth_curvature);

  pop();

  // The display's plastic bezel, drawn outside the scaled coordinate space.
  noFill();
  stroke('#455A64');
  strokeWeight(2);
  rect(px, py, pw, ph, 3);
  strokeWeight(1);
}

// One eyebrow, drawn as a tilted bar. A positive angle raises the OUTER end,
// exactly the convention draw_eyebrow() uses in the chapter. outerSign is -1
// when the outer end points left and +1 when it points right.
function drawEyebrow(cx, cy, halfW, thickness, angleDegrees, outerSign) {
  // The brow can only tilt as far as the room above it allows, so a very
  // large eye never pushes an eyebrow off the top of the 64-pixel screen.
  const maxTilt = constrain(cy - 3, 1, 7);
  const tilt = constrain(Math.tan(radians(angleDegrees)) * halfW, -maxTilt, maxTilt);
  const outerX = cx + outerSign * halfW;
  const innerX = cx - outerSign * halfW;
  const outerYTop = cy - tilt;
  const innerYTop = cy + tilt;
  quad(outerX, outerYTop, innerX, innerYTop,
       innerX, innerYTop + thickness, outerX, outerYTop + thickness);
}

// The mouth. Positive curvature fills the bottom half of an ellipse for a
// smile; negative curvature fills the top half for a frown; zero draws the
// flat line a neutral face uses.
function drawMouth(cx, cy, mouthWidth, curvature) {
  const rx = mouthWidth / 2;
  if (curvature > 0) {
    arc(cx, cy, rx * 2, curvature * 2, 0, PI, PIE);
  } else if (curvature < 0) {
    arc(cx, cy, rx * 2, -curvature * 2, PI, TWO_PI, PIE);
  } else {
    rect(cx - rx, cy - 1, rx * 2, 2);
  }
}

// ---------------------------------------------------------------------------
// A playful reading of the current combination. These are rules of thumb, not
// a grade, and the label says so.
// ---------------------------------------------------------------------------
function readsAs() {
  if (mouthCurvature >= 5 && eyeSize >= 12 && eyebrowAngle >= 10) return 'looks excited';
  if (eyeSize >= 13 && eyebrowAngle >= 15) return 'looks surprised';
  if (mouthCurvature <= -4 && eyebrowAngle <= -15 && eyeSize <= 7) return 'looks angry';
  if (mouthCurvature <= -4) return 'looks upset';
  if (mouthCurvature >= 8) return 'looks happy';
  if (mouthCurvature >= 4) return 'looks friendly';
  if (eyeSize <= 5) return 'looks sleepy';
  if (eyebrowAngle <= -10) return 'looks stern';
  if (eyebrowAngle >= 12) return 'looks curious';
  return 'looks neutral';
}

function drawReadsAsHint() {
  noStroke();
  fill('#37474F');
  textAlign(CENTER, TOP);
  textSize(isNarrow ? 14 : 16);
  const hintX = faceX + faceW / 2;
  text('This face ' + readsAs() + ' - a rule-of-thumb guess, not a score.',
    hintX, faceY + faceH + 7);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}

// ---------------------------------------------------------------------------
// The live face_state readout, printed the way Python would print it. The four
// keys the sliders control are highlighted so the link is obvious.
// ---------------------------------------------------------------------------
const EDITABLE_KEYS = ['eye_size', 'eye_spacing', 'eyebrow_angle', 'mouth_curvature'];

function drawDictionaryPanel(state) {
  fill(255, 255, 255, 235);
  stroke(200);
  rect(panelX, panelY, panelW, panelH, 10);

  const bodySize = isNarrow ? 11 : 13;
  const lineH = isNarrow ? 12 : 16;
  const innerX = panelX + 10;
  let y = panelY + 8;

  noStroke();
  fill('#00695C');
  textAlign(LEFT, TOP);
  textSize(bodySize + 1);
  text('face_state, live', innerX, y);
  y += lineH + 3;

  textFont('monospace');
  textSize(bodySize);
  fill('#263238');
  text('face_state = {', innerX, y);
  y += lineH;

  const keys = Object.keys(state);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const isEditable = EDITABLE_KEYS.indexOf(key) >= 0;
    fill(isEditable ? '#00695C' : '#78909C');
    text('    "' + key + '": ' + state[key] + ',', innerX, y);
    y += lineH;
  }
  fill('#263238');
  text('}', innerX, y);
  y += lineH + 4;

  textFont('sans-serif');
  fill('#546E7A');
  textSize(bodySize);
  const note = isNarrow
    ? 'Teal keys are the four you control.'
    : 'Teal keys are the four you control. draw_face() reads all ten.';
  text(note, innerX, y, panelW - 20, panelY + panelH - y - 4);

  textSize(defaultTextSize);
}

// ---------------------------------------------------------------------------
// Labels for the control strip
// ---------------------------------------------------------------------------
function drawControlLabels() {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(15);
  text('Eye size: ' + eyeSize, 10, drawHeight + 52);
  text('Eye spacing: ' + eyeSpacing, 10, drawHeight + 87);
  text('Eyebrow angle: ' + eyebrowAngle + ' deg', 10, drawHeight + 122);
  text('Mouth curvature: ' + mouthCurvature, 10, drawHeight + 157);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}
