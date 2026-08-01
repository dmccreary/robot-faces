// Round Display Safe-Area Layout Planner MicroSim
// Chapter 15: Porting Faces to a Color Display
// Bloom level: Analyze (L4) - examine, distinguish, differentiate
// Interaction: place candidate feature boxes on a 240x240 round-display buffer
// and classify each one as Safe, At Risk, or Clipped by testing all four of
// its corners against the safe-area circle and the visible circle.
//
// CANVAS_HEIGHT: 560

// ---------------------------------------------------------------------------
// Layout constants. Total height is fixed; the control strip grows one row
// taller on narrow screens, so drawHeight is recomputed every frame.
// ---------------------------------------------------------------------------
let canvasWidth = 800;
let canvasHeight = 560;      // fixed total: matches CANVAS_HEIGHT above
let drawHeight = 505;        // recomputed by layoutControls()
let controlHeight = 55;      // recomputed by layoutControls()
let margin = 12;
let defaultTextSize = 16;

// ---------------------------------------------------------------------------
// The display's own geometry, all measured in buffer pixels. The GC9A01's
// frame buffer is a 240x240 square, but only the inscribed circle is real
// glass. The safe area is a slightly smaller circle that leaves a margin.
// ---------------------------------------------------------------------------
const BUFFER_SIZE = 240;
const BUF_CENTER = 120;   // renamed: bare CENTER shadows the p5 alignment constant
const VISIBLE_R = 120;       // the inscribed circle the display can light up
const SAFE_INSET = 15;       // the comfortable margin this chapter recommends
const SAFE_R = VISIBLE_R - SAFE_INSET;
const MAX_FEATURES = 6;

// Default sizes for each kind of feature, in buffer pixels.
const FEATURE_KINDS = {
  'Eye':     { w: 44, h: 44 },
  'Eyebrow': { w: 58, h: 14 },
  'Mouth':   { w: 84, h: 26 }
};

// Placed feature boxes: {label, x, y, w, h} with x and y as the top-left
// corner, in buffer pixels.
let features = [];
let addCount = 0;

// Drag state
let dragIndex = -1;
let dragMode = '';           // 'move' or 'resize'
let dragOffsetX = 0;
let dragOffsetY = 0;

// Canvas geometry, refreshed every frame
let originX = 0;
let originY = 0;
let scaleF = 1;              // screen pixels per buffer pixel
let handleSize = 12;

// Controls
let addEyeButton;
let addEyebrowButton;
let addMouthButton;
let resetButton;

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
function setup() {
  updateCanvasSize();
  const cnv = createCanvas(canvasWidth, canvasHeight);
  const parentEl = document.querySelector('main');
  cnv.parent(parentEl);

  addEyeButton = createButton('Add Eye');
  addEyeButton.parent(parentEl);
  addEyeButton.mousePressed(function () { addFeature('Eye'); });

  addEyebrowButton = createButton('Add Eyebrow');
  addEyebrowButton.parent(parentEl);
  addEyebrowButton.mousePressed(function () { addFeature('Eyebrow'); });

  addMouthButton = createButton('Add Mouth');
  addMouthButton.parent(parentEl);
  addMouthButton.mousePressed(function () { addFeature('Mouth'); });

  resetButton = createButton('Reset Layout');
  resetButton.parent(parentEl);
  resetButton.mousePressed(function () {
    features = [];
    addCount = 0;
  });

  layoutControls();
  positionControls();

  describe(
    'A layout planner for a 240 by 240 round display. The square frame buffer ' +
    'is drawn with its inscribed visible circle shaded teal and a dashed ' +
    'safe-area circle inset fifteen pixels inside it. Buttons add draggable, ' +
    'resizable Eye, Eyebrow, and Mouth boxes. Each box turns green when all ' +
    'four corners sit inside the safe area, yellow when a corner reaches the ' +
    'band between the safe area and the visible circle, and red when any ' +
    'corner leaves the visible circle. A status list reports every box as ' +
    'Safe, At Risk, or Clipped.'
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

function layoutControls() {
  controlHeight = canvasWidth < 560 ? 90 : 55;
  drawHeight = canvasHeight - controlHeight;
}

function positionControls() {
  const rowY = drawHeight + 12;
  addEyeButton.position(10, rowY);
  addEyebrowButton.position(90, rowY);
  addMouthButton.position(196, rowY);
  if (canvasWidth < 560) {
    resetButton.position(10, rowY + 36);
  } else {
    resetButton.position(292, rowY);
  }
}

// ---------------------------------------------------------------------------
// Feature placement and classification
// ---------------------------------------------------------------------------

// New boxes appear near the center, stepped a little so they do not stack.
function addFeature(kind) {
  if (features.length >= MAX_FEATURES) return;
  const size = FEATURE_KINDS[kind];
  const step = (addCount % 4) * 14 - 21;
  features.push({
    label: kind,
    x: BUF_CENTER - size.w / 2 + step,
    y: BUF_CENTER - size.h / 2 + step,
    w: size.w,
    h: size.h
  });
  addCount++;
}

// The distance test at the heart of this MicroSim: check all four corners of
// a box against the two circles, and report the worst case.
function classify(feature) {
  const corners = [
    [feature.x, feature.y],
    [feature.x + feature.w, feature.y],
    [feature.x, feature.y + feature.h],
    [feature.x + feature.w, feature.y + feature.h]
  ];
  let worst = 0;
  for (let i = 0; i < corners.length; i++) {
    const dx = corners[i][0] - BUF_CENTER;
    const dy = corners[i][1] - BUF_CENTER;
    const d = sqrt(dx * dx + dy * dy);
    if (d > worst) worst = d;
  }
  let status = 'Safe';
  if (worst > VISIBLE_R) status = 'Clipped';
  else if (worst > SAFE_R) status = 'At Risk';
  return { status: status, worst: worst };
}

function statusColor(status) {
  if (status === 'Safe') return '#2E7D32';
  if (status === 'At Risk') return '#EF6C00';
  return '#C62828';
}

function statusFill(status) {
  if (status === 'Safe') return color(76, 175, 80, 130);
  if (status === 'At Risk') return color(255, 179, 0, 140);
  return color(229, 57, 53, 140);
}

// ---------------------------------------------------------------------------
// Mouse handling
// ---------------------------------------------------------------------------
function toBufferX(sx) { return (sx - originX) / scaleF; }
function toBufferY(sy) { return (sy - originY) / scaleF; }

function mousePressed() {
  if (mouseY > drawHeight) return;
  // Search from the top of the stack downward so the visible box wins.
  for (let i = features.length - 1; i >= 0; i--) {
    const f = features[i];
    const sx = originX + f.x * scaleF;
    const sy = originY + f.y * scaleF;
    const sw = f.w * scaleF;
    const sh = f.h * scaleF;

    // The resize handle sits on the bottom-right corner.
    if (mouseX > sx + sw - handleSize && mouseX < sx + sw + handleSize &&
        mouseY > sy + sh - handleSize && mouseY < sy + sh + handleSize) {
      dragIndex = i;
      dragMode = 'resize';
      return;
    }
    if (mouseX > sx && mouseX < sx + sw && mouseY > sy && mouseY < sy + sh) {
      dragIndex = i;
      dragMode = 'move';
      dragOffsetX = toBufferX(mouseX) - f.x;
      dragOffsetY = toBufferY(mouseY) - f.y;
      // Bring the grabbed box to the front of the stack.
      features.push(features.splice(i, 1)[0]);
      dragIndex = features.length - 1;
      return;
    }
  }
}

function mouseDragged() {
  if (dragIndex < 0) return;
  const f = features[dragIndex];
  if (dragMode === 'move') {
    f.x = constrain(toBufferX(mouseX) - dragOffsetX, 0, BUFFER_SIZE - f.w);
    f.y = constrain(toBufferY(mouseY) - dragOffsetY, 0, BUFFER_SIZE - f.h);
  } else if (dragMode === 'resize') {
    f.w = constrain(toBufferX(mouseX) - f.x, 10, BUFFER_SIZE - f.x);
    f.h = constrain(toBufferY(mouseY) - f.y, 8, BUFFER_SIZE - f.y);
  }
}

function mouseReleased() {
  dragIndex = -1;
  dragMode = '';
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------
function draw() {
  updateCanvasSize();
  layoutControls();
  positionControls();

  stroke('silver');
  fill('aliceblue');
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  const narrow = canvasWidth < 620;

  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(narrow ? 17 : 22);
  text('Round Display Safe-Area Layout Planner', canvasWidth / 2, 6);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);

  let side;
  if (narrow) {
    const statusH = 200;
    side = max(150, min(canvasWidth - 2 * margin, drawHeight - 44 - statusH));
    originX = (canvasWidth - side) / 2;
    originY = 38;
    scaleF = side / BUFFER_SIZE;
    drawBuffer(side);
    drawFeatures();
    drawStatusPanel(margin, 38 + side + 8, canvasWidth - 2 * margin,
      drawHeight - (38 + side + 16), true);
  } else {
    const leftW = floor(canvasWidth * 0.65);
    side = max(180, min(leftW - 2 * margin, drawHeight - 60));
    originX = margin + (leftW - 2 * margin - side) / 2;
    originY = 40;
    scaleF = side / BUFFER_SIZE;
    drawBuffer(side);
    drawFeatures();
    drawStatusPanel(leftW + 4, 40, canvasWidth - leftW - margin - 4,
      drawHeight - 52, false);
  }
}

// The 240x240 buffer, its visible circle, and the dashed safe-area circle.
function drawBuffer(side) {
  const cx = originX + BUF_CENTER * scaleF;
  const cy = originY + BUF_CENTER * scaleF;

  // The square buffer. Its corners are memory nobody can ever see.
  stroke('#90A4AE');
  fill('#ECEFF1');
  rect(originX, originY, side, side);

  // The visible circle: the only part of the buffer that reaches real glass.
  noStroke();
  fill(0, 150, 136, 55);
  ellipse(cx, cy, VISIBLE_R * 2 * scaleF, VISIBLE_R * 2 * scaleF);
  noFill();
  stroke('#00796B');
  strokeWeight(2);
  ellipse(cx, cy, VISIBLE_R * 2 * scaleF, VISIBLE_R * 2 * scaleF);

  // The dashed safe area, inset 15 buffer pixels from the visible edge.
  stroke('#37474F');
  strokeWeight(1.5);
  const dashes = 72;
  for (let i = 0; i < dashes; i += 2) {
    const a1 = TWO_PI * i / dashes;
    const a2 = TWO_PI * (i + 1) / dashes;
    line(cx + cos(a1) * SAFE_R * scaleF, cy + sin(a1) * SAFE_R * scaleF,
      cx + cos(a2) * SAFE_R * scaleF, cy + sin(a2) * SAFE_R * scaleF);
  }
  strokeWeight(1);

  noStroke();
  fill('dimgray');
  textSize(11);
  text('240 x 240 buffer', originX + 4, originY + 4);
  fill('#00695C');
  textAlign(CENTER, TOP);
  text('visible circle', cx, originY + 5);
  fill('#37474F');
  text('safe area', cx, cy + SAFE_R * scaleF + 5);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}

// Every placed box, colored by its own classification.
function drawFeatures() {
  for (let i = 0; i < features.length; i++) {
    const f = features[i];
    const verdict = classify(f);
    const sx = originX + f.x * scaleF;
    const sy = originY + f.y * scaleF;
    const sw = f.w * scaleF;
    const sh = f.h * scaleF;

    stroke(statusColor(verdict.status));
    strokeWeight(2);
    fill(statusFill(verdict.status));
    rect(sx, sy, sw, sh);

    // The resize handle on the bottom-right corner.
    noStroke();
    fill(statusColor(verdict.status));
    rect(sx + sw - 9, sy + sh - 9, 9, 9);

    fill('black');
    noStroke();
    textSize(11);
    textAlign(CENTER, CENTER);
    if (sh > 16 && sw > 34) text(f.label, sx + sw / 2, sy + sh / 2);
    textAlign(LEFT, TOP);
    textSize(defaultTextSize);
    strokeWeight(1);
  }
}

// The live status list, plus a legend explaining the three verdicts.
function drawStatusPanel(x, y, w, h, compact) {
  fill(255, 255, 255, 235);
  stroke(200);
  rect(x, y, w, h, 10);

  noStroke();
  textAlign(LEFT, TOP);
  const innerX = x + 12;
  const wrapW = w - 24;
  let cursorY = y + 10;

  fill('black');
  textSize(15);
  text('Placed features', innerX, cursorY, wrapW, 20);
  cursorY += 22;

  if (features.length === 0) {
    fill('#37474F');
    textSize(12);
    text('Nothing placed yet. Add a box below, then drag it. The small ' +
      'square on its bottom-right corner resizes it.',
      innerX, cursorY, wrapW, compact ? 56 : 74);
    cursorY += compact ? 62 : 80;
  } else {
    for (let i = 0; i < features.length; i++) {
      const f = features[i];
      const verdict = classify(f);
      noStroke();
      fill(statusColor(verdict.status));
      rect(innerX, cursorY + 2, 8, 8, 2);
      fill('black');
      textSize(13);
      text(f.label, innerX + 16, cursorY, 74, 18);
      fill(statusColor(verdict.status));
      text(verdict.status, innerX + 92, cursorY, 76, 18);
      if (!compact) {
        fill('dimgray');
        textSize(11);
        text('(' + round(f.x) + ', ' + round(f.y) + ')  ' + round(f.w) +
          ' x ' + round(f.h) + '   worst corner ' + round(verdict.worst) +
          ' px', innerX + 16, cursorY + 17, wrapW - 16, 16);
        cursorY += 34;
      } else {
        fill('dimgray');
        textSize(11);
        text(round(verdict.worst) + ' px', innerX + 176, cursorY + 1, 60, 16);
        cursorY += 20;
      }
    }
    cursorY += 8;
  }

  // Legend: what each verdict means, in terms of the two circles.
  const legend = [
    ['Safe', 'every corner inside the dashed safe area'],
    ['At Risk', 'a corner is past the safe area but still visible'],
    ['Clipped', 'a corner left the visible circle and will vanish']
  ];
  for (let i = 0; i < legend.length; i++) {
    if (cursorY + 30 > y + h) break;
    noStroke();
    fill(statusColor(legend[i][0]));
    rect(innerX, cursorY + 2, 8, 8, 2);
    fill(statusColor(legend[i][0]));
    textSize(12);
    text(legend[i][0], innerX + 16, cursorY, 60, 16);
    fill('#37474F');
    textSize(11);
    text(legend[i][1], innerX + 16, cursorY + 15, wrapW - 16, 26);
    cursorY += compact ? 30 : 34;
  }

  if (features.length >= MAX_FEATURES && cursorY + 16 < y + h) {
    fill('#C62828');
    textSize(11);
    text('That is all ' + MAX_FEATURES + ' boxes. Click Reset Layout to start ' +
      'over.', innerX, cursorY, wrapW, 30);
  }
  textSize(defaultTextSize);
}
