// Build This Expression Challenge MicroSim
// Chapter 10: Emotion Theory and the Core Expression Set
// Bloom level: Apply (L3) - demonstrate, construct
// Interaction: the learner builds a named target expression with sliders, then
// asks for a score. The feedback names the one parameter that is furthest off,
// so the next adjustment is a specific action rather than a guess.
//
// CANVAS_HEIGHT: 545

// ---------------------------------------------------------------------------
// Layout constants (standard MicroSim pattern)
// ---------------------------------------------------------------------------
let canvasWidth = 800;
let drawHeight = 360;
let controlHeight = 185;          // 1 toggle/button row + 4 slider rows
let canvasHeight = drawHeight + controlHeight;
let margin = 12;
let sliderLeftMargin = 205;
let defaultTextSize = 16;

const TITLE_H = 30;
const OLED_W = 128;
const OLED_H = 64;

// Fixed parts of the face state, from default_face_state(128, 64)
const EYE_Y = 28;
const EYE_SPACING = 40;
const PUPIL_SIZE = 3;
const MOUTH_Y = 48;
const MOUTH_WIDTH = 42;

// Neutral starting values every new challenge resets to
const NEUTRAL = { brow: 0, eye: 8, gaze: 0, mouth: 6, open: false };

// Slider spans, used to turn a distance into a fair score
const SPAN = { brow: 60, eye: 12, gaze: 20, mouth: 20 };

// ---------------------------------------------------------------------------
// The thirteen target expressions. Each parameter stores an acceptable RANGE,
// not one exact number, because several reasonable builds should all count.
// ---------------------------------------------------------------------------
const TARGETS = [
  {
    name: 'Neutral',
    hint: 'The rest state: level brows, medium eyes, an almost flat mouth.',
    brow: [-3, 3], eye: [7, 10], gaze: [-2, 2], mouth: [-2, 2], open: false,
    solution: { brow: 0, eye: 8, gaze: 0, mouth: 0, open: false }
  },
  {
    name: 'Happy',
    hint: 'One clear upward mouth curve, with brows staying relaxed.',
    brow: [2, 12], eye: [7, 11], gaze: [-2, 2], mouth: [5, 10], open: false,
    solution: { brow: 6, eye: 8, gaze: 0, mouth: 7, open: false }
  },
  {
    name: 'Sad',
    hint: 'Happy with both signs flipped: gentle negative brows, a frowning mouth.',
    brow: [-14, -4], eye: [5, 8], gaze: [-2, 2], mouth: [-10, -4], open: false,
    solution: { brow: -8, eye: 7, gaze: 0, mouth: -6, open: false }
  },
  {
    name: 'Angry',
    hint: 'Sad\'s brow direction pushed much further, plus narrowed eyes and a flat mouth.',
    brow: [-30, -16], eye: [4, 7], gaze: [-2, 2], mouth: [-4, 1], open: false,
    solution: { brow: -24, eye: 5, gaze: 0, mouth: -1, open: false }
  },
  {
    name: 'Afraid',
    hint: 'The face opens up: raised brows, wide eyes, and an open mouth.',
    brow: [10, 24], eye: [11, 15], gaze: [-3, 3], mouth: [4, 10], open: true,
    solution: { brow: 18, eye: 13, gaze: 0, mouth: 7, open: true }
  },
  {
    name: 'Surprised',
    hint: 'Afraid with every value pushed to its extreme. The most reliably read face.',
    brow: [20, 30], eye: [13, 16], gaze: [-2, 2], mouth: [6, 10], open: true,
    solution: { brow: 25, eye: 14, gaze: 0, mouth: 9, open: true }
  },
  {
    name: 'Disgusted',
    hint: 'Scrunched and off-center: lowered brows, narrow eyes, mouth pulled to one side.',
    brow: [-20, -8], eye: [4, 7], gaze: [3, 10], mouth: [-8, -2], open: false,
    solution: { brow: -14, eye: 5, gaze: 6, mouth: -5, open: false }
  },
  {
    name: 'Contempt',
    hint: 'Almost neutral, with one small sideways lift. Subtle by design.',
    brow: [-3, 4], eye: [7, 10], gaze: [2, 8], mouth: [1, 4], open: false,
    solution: { brow: 1, eye: 8, gaze: 5, mouth: 2, open: false }
  },
  {
    name: 'Tired',
    hint: 'Mostly an eye story: small eyes, level brows, a slightly down mouth.',
    brow: [-4, 3], eye: [4, 6], gaze: [-2, 2], mouth: [-4, 0], open: false,
    solution: { brow: 0, eye: 5, gaze: 0, mouth: -2, open: false }
  },
  {
    name: 'Stern',
    hint: 'Angry\'s brow direction at a fraction of the size, with normal eyes.',
    brow: [-8, -2], eye: [7, 10], gaze: [-2, 2], mouth: [-1, 1], open: false,
    solution: { brow: -4, eye: 8, gaze: 0, mouth: 0, open: false }
  },
  {
    name: 'Sleepy',
    hint: 'Tired taken further. Eyes nearly shut, everything else relaxed.',
    brow: [-3, 3], eye: [4, 5], gaze: [-2, 2], mouth: [-2, 1], open: false,
    solution: { brow: 0, eye: 4, gaze: 0, mouth: 0, open: false }
  },
  {
    name: 'Confused',
    hint: 'Raised brows plus a sideways glance. A full build needs two brow angles.',
    brow: [8, 20], eye: [7, 10], gaze: [-9, -3], mouth: [0, 3], open: false,
    solution: { brow: 14, eye: 8, gaze: -5, mouth: 1, open: false }
  },
  {
    name: 'Excited',
    hint: 'Happy at its maximum: wide eyes, raised brows, a big open smile.',
    brow: [14, 28], eye: [11, 15], gaze: [-2, 2], mouth: [7, 10], open: true,
    solution: { brow: 20, eye: 13, gaze: 0, mouth: 9, open: true }
  }
];

// Friendly names used in the feedback line
const PARAM_LABEL = {
  brow: 'eyebrow angle',
  eye: 'eye size',
  gaze: 'pupil position',
  mouth: 'mouth curvature'
};

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let targetIndex = 0;
let checked = false;              // true once "Check My Build" has been pressed
let scorePct = 0;
let feedbackLine = '';

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
let browSlider, eyeSlider, gazeSlider, mouthSlider;
let mouthOpenCheckbox, checkButton, newChallengeButton;

// ---------------------------------------------------------------------------
// Computed layout
// ---------------------------------------------------------------------------
let isNarrow = false;
let faceX = 0, faceY = 0, faceW = 0, faceH = 0;
let panelX = 0, panelY = 0, panelW = 0, panelH = 0;

function setup() {
  updateCanvasSize();
  const cnv = createCanvas(canvasWidth, canvasHeight);
  const parentEl = document.querySelector('main');
  cnv.parent(parentEl);

  browSlider = createSlider(-30, 30, NEUTRAL.brow, 1);
  eyeSlider = createSlider(4, 16, NEUTRAL.eye, 1);
  gazeSlider = createSlider(-10, 10, NEUTRAL.gaze, 1);
  mouthSlider = createSlider(-10, 10, NEUTRAL.mouth, 1);

  mouthOpenCheckbox = createCheckbox(' Mouth open', NEUTRAL.open);
  checkButton = createButton('Check My Build');
  checkButton.mousePressed(checkBuild);
  newChallengeButton = createButton('New Challenge');
  newChallengeButton.mousePressed(newChallenge);

  const allControls = [browSlider, eyeSlider, gazeSlider, mouthSlider,
    mouthOpenCheckbox, checkButton, newChallengeButton];
  for (let i = 0; i < allControls.length; i++) {
    allControls[i].parent(parentEl);
  }

  // Any slider move invalidates the last score, so the meter never shows a
  // number for a face that is no longer on screen.
  browSlider.input(clearScore);
  eyeSlider.input(clearScore);
  gazeSlider.input(clearScore);
  mouthSlider.input(clearScore);
  mouthOpenCheckbox.changed(clearScore);

  positionControls();
  targetIndex = floor(random(TARGETS.length));

  describe(
    'A build-the-expression challenge. A banner names a target expression, ' +
    'such as Build: Angry, with a one-line description. On the left, a ' +
    'simulated 128 by 64 pixel OLED shows a white robot face on a black ' +
    'screen that redraws as the learner moves four sliders: eyebrow angle, ' +
    'eye size, pupil position, and mouth curvature. A Mouth open checkbox ' +
    'switches the mouth between a curve and a round opening. Pressing Check ' +
    'My Build shows a match-quality meter from 0 to 100 percent, names the ' +
    'parameter furthest from the target range and which way to move it, and ' +
    'reveals a small reference face. New Challenge picks another of the ' +
    'thirteen expressions and resets every slider to neutral.'
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

  mouthOpenCheckbox.position(10, drawHeight + 10);
  checkButton.position(125, drawHeight + 6);
  newChallengeButton.position(248, drawHeight + 6);

  browSlider.position(sliderLeftMargin, drawHeight + 42);
  eyeSlider.position(sliderLeftMargin, drawHeight + 77);
  gazeSlider.position(sliderLeftMargin, drawHeight + 112);
  mouthSlider.position(sliderLeftMargin, drawHeight + 147);

  browSlider.size(sliderW);
  eyeSlider.size(sliderW);
  gazeSlider.size(sliderW);
  mouthSlider.size(sliderW);
}

// ---------------------------------------------------------------------------
// Challenge flow
// ---------------------------------------------------------------------------
function clearScore() {
  checked = false;
}

function resetSliders() {
  browSlider.value(NEUTRAL.brow);
  eyeSlider.value(NEUTRAL.eye);
  gazeSlider.value(NEUTRAL.gaze);
  mouthSlider.value(NEUTRAL.mouth);
  mouthOpenCheckbox.checked(NEUTRAL.open);
}

function newChallenge() {
  let next = targetIndex;
  while (next === targetIndex && TARGETS.length > 1) {
    next = floor(random(TARGETS.length));
  }
  targetIndex = next;
  resetSliders();
  checked = false;
}

function currentBuild() {
  return {
    brow: browSlider.value(),
    eye: eyeSlider.value(),
    gaze: gazeSlider.value(),
    mouth: mouthSlider.value(),
    open: mouthOpenCheckbox.checked()
  };
}

// How well one value sits inside its acceptable range. Anything inside scores
// a full 1.0. Outside, the score falls off smoothly with distance, so a near
// miss still reads as close.
function scoreOne(value, range, span) {
  if (value >= range[0] && value <= range[1]) return 1;
  const distance = value < range[0] ? range[0] - value : value - range[1];
  const tolerance = span * 0.45;
  return max(0, 1 - distance / tolerance);
}

function checkBuild() {
  const build = currentBuild();
  const target = TARGETS[targetIndex];

  const parts = {
    brow: scoreOne(build.brow, target.brow, SPAN.brow),
    eye: scoreOne(build.eye, target.eye, SPAN.eye),
    gaze: scoreOne(build.gaze, target.gaze, SPAN.gaze),
    mouth: scoreOne(build.mouth, target.mouth, SPAN.mouth)
  };
  const openScore = (build.open === target.open) ? 1 : 0;

  scorePct = round(((parts.brow + parts.eye + parts.gaze + parts.mouth + openScore) / 5) * 100);

  // Name the single parameter that is furthest from its target range.
  let worstKey = 'brow';
  const keys = ['brow', 'eye', 'gaze', 'mouth'];
  for (let i = 0; i < keys.length; i++) {
    if (parts[keys[i]] < parts[worstKey]) worstKey = keys[i];
  }

  if (openScore === 0) {
    feedbackLine = target.open
      ? 'Turn "Mouth open" on. This expression needs a real opening, not a curve.'
      : 'Turn "Mouth open" off. This expression uses a closed mouth curve.';
  } else if (parts[worstKey] >= 1) {
    feedbackLine = 'Every parameter is inside the target range. This build reads as ' +
      target.name.toLowerCase() + '.';
  } else {
    const range = target[worstKey];
    const value = build[worstKey];
    const direction = value < range[0] ? 'higher' : 'lower';
    feedbackLine = 'Furthest off: ' + PARAM_LABEL[worstKey] + '. Try a ' +
      direction + ' value, somewhere between ' + range[0] + ' and ' + range[1] + '.';
  }

  checked = true;
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------
function computeLayout() {
  isNarrow = canvasWidth < 600;

  if (isNarrow) {
    panelH = 205;
    panelX = margin;
    panelW = canvasWidth - 2 * margin;
    panelY = drawHeight - panelH - margin;

    const areaTop = TITLE_H;
    const areaH = panelY - areaTop - 8;
    const areaW = canvasWidth - 2 * margin;
    faceW = min(areaW, areaH * (OLED_W / OLED_H));
    faceH = faceW / (OLED_W / OLED_H);
    faceX = (canvasWidth - faceW) / 2;
    faceY = areaTop + (areaH - faceH) / 2;
  } else {
    panelW = max(250, floor(canvasWidth * 0.40));
    panelX = canvasWidth - panelW - margin;
    panelY = TITLE_H;
    panelH = drawHeight - TITLE_H - margin;

    const areaW = panelX - 2 * margin;
    const areaTop = TITLE_H;
    const areaH = drawHeight - areaTop - margin;
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
  computeLayout();

  const build = currentBuild();

  stroke('silver');
  fill('aliceblue');
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  drawTargetBanner();
  drawFaceDisplay(faceX, faceY, faceW, build);
  drawScorePanel(build);
  drawControlLabels(build);
}

function drawTargetBanner() {
  const target = TARGETS[targetIndex];
  noStroke();
  fill('#00695C');
  textAlign(CENTER, TOP);
  textSize(canvasWidth < 520 ? 18 : 22);
  const bannerX = isNarrow ? canvasWidth / 2 : (canvasWidth - panelW) / 2;
  text('Build: ' + target.name, bannerX, 4);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}

// ---------------------------------------------------------------------------
// Face rendering in the OLED's own 128 x 64 coordinate space, the same model
// Chapter 9's face-parameter-slider-playground uses.
// ---------------------------------------------------------------------------
function drawFaceDisplay(px, py, pw, f) {
  const s = pw / OLED_W;
  const ph = OLED_H * s;

  push();
  translate(px, py);
  scale(s);

  // 1. Background first
  noStroke();
  fill('black');
  rect(0, 0, OLED_W, OLED_H);

  const centerX = OLED_W / 2;

  // 2. Face outline
  noFill();
  stroke('white');
  strokeWeight(1.4 / s);
  ellipse(centerX, OLED_H / 2, (OLED_W / 2 - 4) * 2, (OLED_H / 2 - 4) * 2);

  const leftEyeX = centerX - EYE_SPACING / 2;
  const rightEyeX = centerX + EYE_SPACING / 2;
  const browY = constrain(EYE_Y - f.eye - 6, 5, 24);

  // 3. Eyebrows, mirrored around the centerline
  noStroke();
  fill('white');
  drawEyebrow(leftEyeX, browY, 11, 3, f.brow, -1);
  drawEyebrow(rightEyeX, browY, 11, 3, f.brow, 1);

  // 4. Eyes, then 5. pupils
  ellipse(leftEyeX, EYE_Y, f.eye * 2, f.eye * 2);
  ellipse(rightEyeX, EYE_Y, f.eye * 2, f.eye * 2);
  fill('black');
  const gazeLimit = max(0, f.eye - PUPIL_SIZE - 1);
  const gaze = constrain(f.gaze, -gazeLimit, gazeLimit);
  ellipse(leftEyeX + gaze, EYE_Y, PUPIL_SIZE * 2, PUPIL_SIZE * 2);
  ellipse(rightEyeX + gaze, EYE_Y, PUPIL_SIZE * 2, PUPIL_SIZE * 2);

  // 6. Mouth
  fill('white');
  drawMouth(centerX, MOUTH_Y, MOUTH_WIDTH, f.mouth, f.open);

  pop();

  noFill();
  stroke('#455A64');
  strokeWeight(2);
  rect(px, py, pw, ph, 3);
  strokeWeight(1);
}

// One eyebrow as a tilted bar. A positive angle raises the OUTER end, the same
// convention Chapter 9's draw_eyebrow() uses.
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

// Positive curvature fills the bottom half of an ellipse for a smile, negative
// fills the top half for a frown, and mouthOpen draws a full rounded opening.
function drawMouth(cx, cy, mouthWidth, curvature, mouthOpen) {
  const rx = mouthWidth / 2;
  if (mouthOpen) {
    ellipse(cx, cy, rx * 1.3, max(6, abs(curvature) * 1.6));
  } else if (curvature > 0) {
    arc(cx, cy, rx * 2, curvature * 2, 0, PI, PIE);
  } else if (curvature < 0) {
    arc(cx, cy, rx * 2, -curvature * 2, PI, TWO_PI, PIE);
  } else {
    rect(cx - rx, cy - 1, rx * 2, 2);
  }
}

// ---------------------------------------------------------------------------
// Text helpers. Wrapping by hand lets the panel know exactly how tall each
// block will be, so the reference face never lands outside its box.
// ---------------------------------------------------------------------------
function wrapToLines(str, maxW) {
  const words = str.split(' ');
  const lines = [];
  let current = '';
  for (let i = 0; i < words.length; i++) {
    const candidate = current === '' ? words[i] : current + ' ' + words[i];
    if (current !== '' && textWidth(candidate) > maxW) {
      lines.push(current);
      current = words[i];
    } else {
      current = candidate;
    }
  }
  if (current !== '') lines.push(current);
  return lines;
}

// Draws wrapped text and returns the y coordinate just below the last line.
function drawWrapped(str, x, y, maxW, lineH) {
  const lines = wrapToLines(str, maxW);
  for (let i = 0; i < lines.length; i++) {
    text(lines[i], x, y + i * lineH);
  }
  return y + lines.length * lineH;
}

// ---------------------------------------------------------------------------
// The right-hand panel: what to build, how close you are, and what to fix
// ---------------------------------------------------------------------------
function drawScorePanel(build) {
  const target = TARGETS[targetIndex];

  fill(255, 255, 255, 238);
  stroke(200);
  rect(panelX, panelY, panelW, panelH, 10);

  const innerX = panelX + 10;
  const wrapW = panelW - 20;
  const bodySize = isNarrow ? 12 : 14;
  const lineH = bodySize + 4;
  let y = panelY + 8;

  noStroke();
  textAlign(LEFT, TOP);
  fill('#37474F');
  textSize(bodySize);
  y = drawWrapped(target.hint, innerX, y, wrapW, lineH) + 6;

  if (!checked) {
    fill('#78909C');
    textSize(bodySize);
    drawWrapped('Move the sliders until the face matches, then press ' +
      '"Check My Build" for a score.', innerX, y, wrapW, lineH);
    textSize(defaultTextSize);
    return;
  }

  // Match-quality meter
  const meterW = wrapW - (isNarrow ? 0 : 78);
  const meterH = 18;
  fill('#607D8B');
  textSize(bodySize - 2);
  text('Match quality', innerX, y);
  y += bodySize + 2;

  noStroke();
  fill('#ECEFF1');
  rect(innerX, y, meterW, meterH, 9);
  fill(scorePct >= 85 ? '#2E7D32' : (scorePct >= 60 ? '#9E9D24' : '#EF6C00'));
  rect(innerX, y, max(6, meterW * scorePct / 100), meterH, 9);
  fill('#263238');
  textSize(bodySize);
  textAlign(LEFT, CENTER);
  text(scorePct + '%', innerX + meterW + 8, y + meterH / 2);
  textAlign(LEFT, TOP);
  y += meterH + 8;

  // The actionable part: one named parameter and which way to move it
  fill('#263238');
  textSize(bodySize);
  y = drawWrapped(feedbackLine, innerX, y, wrapW, lineH) + 6;

  // A reasonable reference build, revealed only after a check. Its width
  // shrinks to whatever vertical room is actually left in the panel.
  const roomBelowLabel = panelY + panelH - y - (bodySize + 4) - 6;
  const thumbW = min(isNarrow ? 150 : 168, wrapW - 4, max(0, roomBelowLabel) * 2);
  if (thumbW >= 96) {
    fill('#607D8B');
    textSize(bodySize - 2);
    text('One face that scores 100%', innerX, y);
    y += bodySize + 4;
    drawFaceDisplay(innerX, y, thumbW, target.solution);
  }

  textSize(defaultTextSize);
}

// ---------------------------------------------------------------------------
// Labels for the control strip
// ---------------------------------------------------------------------------
function drawControlLabels(build) {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(15);
  text('Eyebrow angle: ' + build.brow + ' deg', 10, drawHeight + 52);
  text('Eye size: ' + build.eye, 10, drawHeight + 87);
  text('Pupil position: ' + build.gaze, 10, drawHeight + 122);
  text('Mouth curvature: ' + build.mouth, 10, drawHeight + 157);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}
