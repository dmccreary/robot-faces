// Facial Symmetry Mirror Demonstrator MicroSim
// Chapter 9: Facial Anatomy and Layout Design
// Bloom level: Apply (L3) - demonstrate, apply
// Interaction: the learner moves the LEFT eye only. The right eye is
// recomputed through mirror_x() every frame, and a live readout shows the
// arithmetic, so a prediction can be tested before the redraw confirms it.
//
// CANVAS_HEIGHT: 505

// ---------------------------------------------------------------------------
// Layout constants (standard MicroSim pattern)
// ---------------------------------------------------------------------------
let canvasWidth = 800;
let drawHeight = 320;
let controlHeight = 185;          // 1 toggle/button row + up to 4 slider rows
let canvasHeight = drawHeight + controlHeight;
let margin = 12;
let sliderLeftMargin = 230;
let defaultTextSize = 16;

// The simulated frame buffer is a 128 x 64 OLED.
const OLED_W = 128;
const OLED_H = 64;
const CENTER_X = OLED_W / 2;      // 64, the vertical centerline
const EYE_Y = 28;
const PUPIL_SIZE = 3;

// Defaults from the specification: symmetry on, left eye 20 pixels left of
// center, eye size 8.
const DEFAULT_LEFT_OFFSET = -20;
const DEFAULT_EYE_SIZE = 8;

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let symmetryOn = true;

// The independent right-eye values live here, separate from the mirrored
// values, so turning symmetry back on and off again restores them exactly.
let storedRightOffset = -DEFAULT_LEFT_OFFSET;
let storedRightSize = DEFAULT_EYE_SIZE;
let hasCustomRight = false;       // true once the learner has edited the right eye

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
let leftOffsetSlider, leftSizeSlider;
let rightOffsetSlider, rightSizeSlider;
let breakSymmetryCheckbox, resetButton;

// ---------------------------------------------------------------------------
// Computed layout
// ---------------------------------------------------------------------------
let isNarrow = false;
let faceX = 0, faceY = 0, faceW = 0, faceH = 0;
let panelX = 0, panelY = 0, panelW = 0, panelH = 0;
const TITLE_H = 32;
const LABEL_GUTTER = 44;          // space under the display for the x-value labels

function setup() {
  updateCanvasSize();
  const cnv = createCanvas(canvasWidth, canvasHeight);
  const parentEl = document.querySelector('main');
  cnv.parent(parentEl);

  leftOffsetSlider = createSlider(-40, -5, DEFAULT_LEFT_OFFSET, 1);
  leftSizeSlider = createSlider(4, 16, DEFAULT_EYE_SIZE, 1);
  rightOffsetSlider = createSlider(5, 40, -DEFAULT_LEFT_OFFSET, 1);
  rightSizeSlider = createSlider(4, 16, DEFAULT_EYE_SIZE, 1);

  breakSymmetryCheckbox = createCheckbox(' Break symmetry', false);
  breakSymmetryCheckbox.changed(toggleSymmetry);

  resetButton = createButton('Reset to Symmetric');
  resetButton.mousePressed(resetToSymmetric);

  const allControls = [leftOffsetSlider, leftSizeSlider, rightOffsetSlider,
    rightSizeSlider, breakSymmetryCheckbox, resetButton];
  for (let i = 0; i < allControls.length; i++) {
    allControls[i].parent(parentEl);
  }

  positionControls();
  updateRightControlVisibility();

  describe(
    'A facial symmetry demonstrator. A simulated 128 by 64 pixel OLED shows a ' +
    'white oval face on a black screen with a dashed vertical centerline at ' +
    'x equals 64. Two sliders move and resize the left eye only. The right ' +
    'eye is placed by reflecting the left eye across the centerline, and a ' +
    'panel prints the reflection arithmetic, for example mirror_x of 44 and ' +
    '64 equals 84. A Break symmetry checkbox reveals two more sliders that ' +
    'control the right eye on its own, and a Reset button restores the ' +
    'mirrored defaults.'
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

  breakSymmetryCheckbox.position(10, drawHeight + 10);
  resetButton.position(180, drawHeight + 6);

  leftOffsetSlider.position(sliderLeftMargin, drawHeight + 42);
  leftSizeSlider.position(sliderLeftMargin, drawHeight + 77);
  rightOffsetSlider.position(sliderLeftMargin, drawHeight + 112);
  rightSizeSlider.position(sliderLeftMargin, drawHeight + 147);

  leftOffsetSlider.size(sliderW);
  leftSizeSlider.size(sliderW);
  rightOffsetSlider.size(sliderW);
  rightSizeSlider.size(sliderW);
}

// ---------------------------------------------------------------------------
// Symmetry toggle
// ---------------------------------------------------------------------------
function toggleSymmetry() {
  symmetryOn = !breakSymmetryCheckbox.checked();
  if (!symmetryOn) {
    if (hasCustomRight) {
      // Bring back exactly the asymmetric face the learner built last time.
      rightOffsetSlider.value(storedRightOffset);
      rightSizeSlider.value(storedRightSize);
    } else {
      // First time: freeze the current mirrored values into the independent
      // sliders, so the asymmetric face starts from the symmetric one.
      rightOffsetSlider.value(-leftOffsetSlider.value());
      rightSizeSlider.value(leftSizeSlider.value());
    }
  } else {
    // Remember where the learner left the right eye before mirroring resumes.
    storedRightOffset = rightOffsetSlider.value();
    storedRightSize = rightSizeSlider.value();
    hasCustomRight = true;
  }
  updateRightControlVisibility();
}

function updateRightControlVisibility() {
  if (symmetryOn) {
    rightOffsetSlider.hide();
    rightSizeSlider.hide();
  } else {
    rightOffsetSlider.show();
    rightSizeSlider.show();
  }
}

function resetToSymmetric() {
  leftOffsetSlider.value(DEFAULT_LEFT_OFFSET);
  leftSizeSlider.value(DEFAULT_EYE_SIZE);
  rightOffsetSlider.value(-DEFAULT_LEFT_OFFSET);
  rightSizeSlider.value(DEFAULT_EYE_SIZE);
  storedRightOffset = -DEFAULT_LEFT_OFFSET;
  storedRightSize = DEFAULT_EYE_SIZE;
  hasCustomRight = false;
  breakSymmetryCheckbox.checked(false);
  symmetryOn = true;
  updateRightControlVisibility();
}

// ---------------------------------------------------------------------------
// The rule this whole MicroSim is about: reflect an x-coordinate across the
// face's vertical centerline. This is the JavaScript twin of the chapter's
// mirror_x() function.
// ---------------------------------------------------------------------------
function mirrorX(x, centerX) {
  return centerX + (centerX - x);
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------
function computeLayout() {
  isNarrow = canvasWidth < 600;

  if (isNarrow) {
    panelH = 118;
    panelX = margin;
    panelW = canvasWidth - 2 * margin;
    panelY = drawHeight - panelH - margin;

    const areaTop = TITLE_H;
    const areaH = panelY - areaTop - LABEL_GUTTER;  // room for the x-value labels
    const areaW = canvasWidth - 2 * margin;
    faceW = min(areaW, areaH * (OLED_W / OLED_H));
    faceH = faceW / (OLED_W / OLED_H);
    faceX = (canvasWidth - faceW) / 2;
    faceY = areaTop + (areaH - faceH) / 2;
  } else {
    panelW = max(230, floor(canvasWidth * 0.35));
    panelX = canvasWidth - panelW - margin;
    panelY = TITLE_H;
    panelH = drawHeight - TITLE_H - margin;

    const areaW = panelX - 2 * margin;
    const areaTop = TITLE_H;
    const areaH = drawHeight - areaTop - LABEL_GUTTER;  // room for the x-value labels
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

  const leftOffset = leftOffsetSlider.value();
  const leftSize = leftSizeSlider.value();
  const leftX = CENTER_X + leftOffset;

  // The right eye is either mirrored or independent, never both.
  let rightX, rightSize;
  if (symmetryOn) {
    rightX = mirrorX(leftX, CENTER_X);
    rightSize = leftSize;
  } else {
    rightX = CENTER_X + rightOffsetSlider.value();
    rightSize = rightSizeSlider.value();
  }

  stroke('silver');
  fill('aliceblue');
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  drawTitle();
  drawFaceDisplay(faceX, faceY, faceW, leftX, leftSize, rightX, rightSize);
  drawMathPanel(leftX, leftSize, rightX, rightSize);
  drawControlLabels(leftOffset, leftSize);
}

function drawTitle() {
  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(canvasWidth < 520 ? 17 : 21);
  const titleX = isNarrow ? canvasWidth / 2 : (canvasWidth - panelW) / 2;
  text(symmetryOn ? 'Move One Eye, the Other Follows'
                  : 'Symmetry Off: Two Eyes, Two Sets of Numbers', titleX, 6);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}

// ---------------------------------------------------------------------------
// Face rendering in the OLED's own 128 x 64 coordinate space
// ---------------------------------------------------------------------------
function drawFaceDisplay(px, py, pw, leftX, leftSize, rightX, rightSize) {
  const s = pw / OLED_W;
  const ph = OLED_H * s;

  push();
  translate(px, py);
  scale(s);

  // Background first
  noStroke();
  fill('black');
  rect(0, 0, OLED_W, OLED_H);

  // Face outline
  noFill();
  stroke('white');
  strokeWeight(1.4 / s);
  ellipse(CENTER_X, OLED_H / 2, (OLED_W / 2 - 4) * 2, (OLED_H / 2 - 4) * 2);

  // The dashed vertical centerline every mirrored feature reflects around
  stroke(symmetryOn ? '#26A69A' : '#EF6C00');
  strokeWeight(1.2 / s);
  drawingContext.setLineDash([3, 3]);
  line(CENTER_X, 2, CENTER_X, OLED_H - 2);
  drawingContext.setLineDash([]);

  // Left eye, the one the learner controls directly
  noStroke();
  fill('white');
  ellipse(leftX, EYE_Y, leftSize * 2, leftSize * 2);
  fill('black');
  ellipse(leftX, EYE_Y, PUPIL_SIZE * 2, PUPIL_SIZE * 2);

  // Right eye, mirrored or independent
  fill('white');
  ellipse(rightX, EYE_Y, rightSize * 2, rightSize * 2);
  fill('black');
  ellipse(rightX, EYE_Y, PUPIL_SIZE * 2, PUPIL_SIZE * 2);

  // A flat neutral mouth keeps the face readable without adding a variable.
  fill('white');
  rect(CENTER_X - 21, 47, 42, 2);

  pop();

  // Bezel
  noFill();
  stroke('#455A64');
  strokeWeight(2);
  rect(px, py, pw, ph, 3);
  strokeWeight(1);

  drawEyeMarkers(px, py, pw, ph, s, leftX, rightX);
}

// Labels and a distance bracket drawn on top of the display, in canvas
// coordinates, so the text stays the same size at any face scale.
function drawEyeMarkers(px, py, pw, ph, s, leftX, rightX) {
  const centerCanvasX = px + CENTER_X * s;
  const leftCanvasX = px + leftX * s;
  const rightCanvasX = px + rightX * s;
  const labelY = py + ph + 5;

  noStroke();
  textSize(isNarrow ? 12 : 13);

  textAlign(CENTER, TOP);
  fill(symmetryOn ? '#00695C' : '#E65100');
  text(symmetryOn ? 'centerline x = 64' : 'Symmetry off', centerCanvasX, labelY);

  // The two eye labels anchor to opposite edges of the display so they can
  // never collide, however close together the eyes get.
  textAlign(LEFT, TOP);
  fill('#1565C0');
  text('left eye x = ' + leftX, px, labelY + 17);

  textAlign(RIGHT, TOP);
  fill(symmetryOn ? '#6A1B9A' : '#E65100');
  text('right eye x = ' + rightX, px + pw, labelY + 17);

  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}

// ---------------------------------------------------------------------------
// The live mirror_x() readout. This is the part the learner checks a
// prediction against.
// ---------------------------------------------------------------------------
function drawMathPanel(leftX, leftSize, rightX, rightSize) {
  fill(255, 255, 255, 235);
  stroke(200);
  rect(panelX, panelY, panelW, panelH, 10);

  const innerX = panelX + 10;
  const wrapW = panelW - 20;
  const lineH = isNarrow ? 15 : 18;
  const bodySize = isNarrow ? 12 : 13;
  let y = panelY + 8;

  noStroke();
  textAlign(LEFT, TOP);
  textSize(bodySize + 1);
  fill(symmetryOn ? '#00695C' : '#E65100');
  text(symmetryOn ? 'The mirroring rule, live' : 'Mirroring is switched off',
    innerX, y);
  y += lineH + 2;

  textFont('monospace');
  textSize(bodySize);
  fill('#263238');

  if (symmetryOn) {
    text('center_x    = ' + CENTER_X, innerX, y); y += lineH;
    text('left_eye_x  = ' + leftX, innerX, y); y += lineH;
    text('mirror_x(' + leftX + ', ' + CENTER_X + ')', innerX, y); y += lineH;
    fill('#546E7A');
    text('  = ' + CENTER_X + ' + (' + CENTER_X + ' - ' + leftX + ')', innerX, y);
    y += lineH;
    fill('#6A1B9A');
    text('  = ' + rightX, innerX, y); y += lineH;
    fill('#263238');
    text('eye_size    = ' + leftSize + '  (both)', innerX, y); y += lineH;
  } else {
    text('left_eye_x  = ' + leftX, innerX, y); y += lineH;
    text('right_eye_x = ' + rightX, innerX, y); y += lineH;
    fill('#E65100');
    text('mirror_x would give ' + mirrorX(leftX, CENTER_X), innerX, y); y += lineH;
    fill('#263238');
    text('left size   = ' + leftSize, innerX, y); y += lineH;
    text('right size  = ' + rightSize, innerX, y); y += lineH;
  }

  textFont('sans-serif');
  y += 4;
  fill('#546E7A');
  textSize(bodySize);
  const note = symmetryOn
    ? 'Predict the right eye before you drag. One calculation, reflected.'
    : 'Two eyes now need two sets of numbers. Turn symmetry back on to halve the work.';
  text(note, innerX, y, wrapW, panelY + panelH - y - 6);

  textSize(defaultTextSize);
}

// ---------------------------------------------------------------------------
// Labels for the control strip
// ---------------------------------------------------------------------------
function drawControlLabels(leftOffset, leftSize) {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(15);
  text('Left eye offset: ' + leftOffset, 10, drawHeight + 52);
  text('Left eye size: ' + leftSize, 10, drawHeight + 87);

  if (symmetryOn) {
    fill('#78909C');
    textSize(14);
    textAlign(LEFT, TOP);
    text('The right eye follows automatically. Check "Break symmetry" to ' +
      'control it yourself.', 10, drawHeight + 112, canvasWidth - 20, 60);
  } else {
    fill('black');
    text('Right eye offset: ' + rightOffsetSlider.value(), 10, drawHeight + 122);
    text('Right eye size: ' + rightSizeSlider.value(), 10, drawHeight + 157);
  }

  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}
