// Color Wheel Emotion Picker MicroSim
// Chapter 15: Porting Faces to a Color Display
// Bloom level: Understand (L2) - interpret, classify, exemplify
// Interaction: pick a point on a hue/saturation wheel, set brightness on a
// separate vertical bar, and read back the warm/cool classification and the
// emotion most often associated with that hue.
//
// CANVAS_HEIGHT: 560

// ---------------------------------------------------------------------------
// Layout constants. Total height is fixed; the control strip grows one row
// taller on narrow screens, so drawHeight is recomputed every frame.
// ---------------------------------------------------------------------------
let canvasWidth = 800;
let canvasHeight = 560;      // fixed total: matches CANVAS_HEIGHT above
let drawHeight = 500;        // recomputed by layoutControls()
let controlHeight = 60;      // recomputed by layoutControls()
let margin = 12;
let defaultTextSize = 16;

// ---------------------------------------------------------------------------
// Selection state. Hue is an angle in degrees measured clockwise from the top
// of the wheel, matching the chapter's color_wheel(angle) convention where
// 0 is red, 120 is green, and 240 is blue. Saturation runs 0 at the center to
// 1 at the rim, and brightness is a completely separate third dimension.
// ---------------------------------------------------------------------------
let hueDeg = 0;
let satAmt = 0;              // starts at the center: an unselected neutral gray
let brightAmt = 0.75;        // the default 75 percent brightness

// Preset animation
let animating = false;
let animT = 0;
let animFrom = { h: 0, s: 0, v: 0.75 };
let animTo = { h: 0, s: 0, v: 0.75 };

// Direct-manipulation state
let draggingWheel = false;
let draggingBar = false;

// Geometry, refreshed every frame
let wheelCx = 0;
let wheelCy = 0;
let wheelR = 120;
let barBox = { x: 0, y: 0, w: 26, h: 200 };

// The wheel is painted once into an offscreen buffer and reused every frame.
let wheelBuffer = null;
let wheelBufferR = 0;

// p5 controls
let presetSelect;
let resetButton;

// ---------------------------------------------------------------------------
// The chapter's six named hues and their common emotion associations. Each
// anchor is the hue angle where that color sits on the wheel.
// ---------------------------------------------------------------------------
const EMOTION_ANCHORS = [
  { name: 'Red',    angle: 0,   emotions: 'Anger, excitement, urgency' },
  { name: 'Orange', angle: 30,  emotions: 'Energy, enthusiasm' },
  { name: 'Yellow', angle: 60,  emotions: 'Happiness, alertness' },
  { name: 'Green',  angle: 120, emotions: 'Calm, safety, "go"' },
  { name: 'Blue',   angle: 220, emotions: 'Calm, sadness, trust' },
  { name: 'Purple', angle: 285, emotions: 'Mystery, creativity' }
];

// Representative colors for the preset dropdown.
const PRESETS = {
  'Anger':      { h: 0,   s: 1.0,  v: 1.0 },
  'Calm':       { h: 220, s: 0.75, v: 0.85 },
  'Happiness':  { h: 55,  s: 0.95, v: 1.0 },
  'Sadness':    { h: 235, s: 0.5,  v: 0.45 },
  'Excitement': { h: 25,  s: 1.0,  v: 1.0 }
};

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
function setup() {
  updateCanvasSize();
  const cnv = createCanvas(canvasWidth, canvasHeight);
  const parentEl = document.querySelector('main');
  cnv.parent(parentEl);

  presetSelect = createSelect();
  presetSelect.parent(parentEl);
  presetSelect.option('Try a Preset Emotion', '');
  for (const emotionName in PRESETS) presetSelect.option(emotionName);
  presetSelect.selected('');
  presetSelect.changed(jumpToPreset);

  resetButton = createButton('Reset');
  resetButton.parent(parentEl);
  resetButton.mousePressed(resetSelection);

  layoutControls();
  positionControls();

  describe(
    'A circular color wheel where hue changes with the angle around the ring ' +
    'and saturation grows from the center to the rim. A separate vertical bar ' +
    'sets brightness. Dragging the selector dot updates a large color swatch, ' +
    'its packed RGB565 hex value, a warm or cool badge, and a panel naming the ' +
    'emotion most commonly associated with that hue. A dropdown jumps the ' +
    'selector to a representative color for anger, calm, happiness, sadness, ' +
    'or excitement.'
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
  controlHeight = canvasWidth < 430 ? 95 : 60;
  drawHeight = canvasHeight - controlHeight;
}

function positionControls() {
  const rowY = drawHeight + 12;
  presetSelect.position(10, rowY);
  presetSelect.size(200, 26);
  if (canvasWidth < 430) {
    resetButton.position(10, rowY + 36);
  } else {
    resetButton.position(224, rowY);
  }
}

// ---------------------------------------------------------------------------
// Color math
// ---------------------------------------------------------------------------

// Standard hue-saturation-brightness to red-green-blue conversion. Hue is in
// degrees, saturation and brightness are 0 to 1, and each returned channel is
// an ordinary 0-255 value - exactly what color565() expects as input.
function hsbToRgb(h, s, v) {
  const hh = ((h % 360) + 360) % 360 / 60;
  const c = v * s;
  const x = c * (1 - abs((hh % 2) - 1));
  let r1 = 0;
  let g1 = 0;
  let b1 = 0;
  if (hh < 1)      { r1 = c; g1 = x; }
  else if (hh < 2) { r1 = x; g1 = c; }
  else if (hh < 3) { g1 = c; b1 = x; }
  else if (hh < 4) { g1 = x; b1 = c; }
  else if (hh < 5) { r1 = x; b1 = c; }
  else             { r1 = c; b1 = x; }
  const m = v - c;
  return [round((r1 + m) * 255), round((g1 + m) * 255), round((b1 + m) * 255)];
}

// The chapter's color565(): keep the top 5, 6, and 5 bits, then shift each
// channel into its own slot of one 16-bit number.
function color565(r, g, b) {
  const r5 = (r >> 3) & 0x1F;
  const g6 = (g >> 2) & 0x3F;
  const b5 = (b >> 3) & 0x1F;
  return (r5 << 11) | (g6 << 5) | b5;
}

function hexWord(value) {
  let s = value.toString(16).toUpperCase();
  while (s.length < 4) s = '0' + s;
  return '0x' + s;
}

// Reds, oranges, and yellows read as warm; greens, blues, and purples as cool.
// A nearly unsaturated color is neither, which is why gray reads as neutral.
function warmthLabel() {
  if (satAmt < 0.15) return 'Neutral';
  return (hueDeg < 75 || hueDeg >= 345) ? 'Warm' : 'Cool';
}

// Find the named hue from the chapter's table that sits closest to this angle.
function nearestAnchor() {
  let best = EMOTION_ANCHORS[0];
  let bestGap = 400;
  for (let i = 0; i < EMOTION_ANCHORS.length; i++) {
    let gap = abs(hueDeg - EMOTION_ANCHORS[i].angle);
    if (gap > 180) gap = 360 - gap;
    if (gap < bestGap) {
      bestGap = gap;
      best = EMOTION_ANCHORS[i];
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------
function jumpToPreset() {
  const choice = presetSelect.value();
  if (choice === '' || !PRESETS[choice]) return;
  animFrom = { h: hueDeg, s: satAmt, v: brightAmt };
  animTo = PRESETS[choice];
  animT = 0;
  animating = true;
}

function resetSelection() {
  animating = false;
  hueDeg = 0;
  satAmt = 0;
  brightAmt = 0.75;
  presetSelect.selected('');
}

function mousePressed() {
  if (mouseY > drawHeight) return;
  if (dist(mouseX, mouseY, wheelCx, wheelCy) <= wheelR + 6) {
    animating = false;
    draggingWheel = true;
    pickFromWheel();
  } else if (mouseX > barBox.x - 8 && mouseX < barBox.x + barBox.w + 8 &&
             mouseY > barBox.y - 8 && mouseY < barBox.y + barBox.h + 8) {
    animating = false;
    draggingBar = true;
    pickFromBar();
  }
}

function mouseDragged() {
  if (draggingWheel) pickFromWheel();
  if (draggingBar) pickFromBar();
}

function mouseReleased() {
  draggingWheel = false;
  draggingBar = false;
}

// Turn a point inside the wheel into a hue angle and a saturation amount.
function pickFromWheel() {
  const dx = mouseX - wheelCx;
  const dy = mouseY - wheelCy;
  hueDeg = (degrees(atan2(dx, -dy)) + 360) % 360;
  satAmt = constrain(dist(mouseX, mouseY, wheelCx, wheelCy) / wheelR, 0, 1);
  presetSelect.selected('');
}

// The bar runs black at the bottom to full brightness at the top.
function pickFromBar() {
  brightAmt = constrain(1 - (mouseY - barBox.y) / barBox.h, 0, 1);
  presetSelect.selected('');
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------
function draw() {
  updateCanvasSize();
  layoutControls();
  positionControls();

  // Ease the selector toward a preset when the dropdown was just used.
  if (animating) {
    animT = min(1, animT + deltaTime / 500);
    let delta = animTo.h - animFrom.h;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const ease = animT * animT * (3 - 2 * animT);
    hueDeg = (animFrom.h + delta * ease + 360) % 360;
    satAmt = animFrom.s + (animTo.s - animFrom.s) * ease;
    brightAmt = animFrom.v + (animTo.v - animFrom.v) * ease;
    if (animT >= 1) animating = false;
  }

  stroke('silver');
  fill('aliceblue');
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  const narrow = canvasWidth < 620;

  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(narrow ? 18 : 22);
  text('Color Wheel Emotion Picker', canvasWidth / 2, 6);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);

  if (narrow) {
    // Wheel on top, swatch and information panel below it.
    const infoH = 240;
    wheelR = max(58, min((canvasWidth - 2 * margin - 92) / 2,
      (drawHeight - 44 - infoH) / 2));
    wheelCx = margin + wheelR + 22;
    wheelCy = 44 + wheelR;
    barBox = { x: wheelCx + wheelR + 18, y: wheelCy - wheelR,
      w: 24, h: wheelR * 2 };
    drawWheel();
    drawBrightnessBar();
    drawInfoPanel(margin, 44 + wheelR * 2 + 14, canvasWidth - 2 * margin,
      drawHeight - (44 + wheelR * 2 + 24), true);
  } else {
    const leftW = floor(canvasWidth * 0.55);
    wheelR = max(70, min((leftW - 2 * margin - 96) / 2, (drawHeight - 76) / 2));
    wheelCx = margin + wheelR + 24;
    wheelCy = 40 + wheelR + 6;
    barBox = { x: wheelCx + wheelR + 22, y: wheelCy - wheelR,
      w: 26, h: wheelR * 2 };
    drawWheel();
    drawBrightnessBar();
    drawInfoPanel(leftW + 4, 40, canvasWidth - leftW - margin - 4,
      drawHeight - 52, false);
  }

  drawControlLabels();
}

// Paint the hue/saturation wheel once into an offscreen buffer, then reuse it.
function buildWheelBuffer(r) {
  const size = ceil(r * 2) + 2;
  wheelBuffer = createGraphics(size, size);
  wheelBuffer.pixelDensity(1);
  wheelBuffer.loadPixels();
  const cx = size / 2;
  const cy = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const rad = sqrt(dx * dx + dy * dy);
      const idx = 4 * (y * size + x);
      if (rad > r) {
        wheelBuffer.pixels[idx + 3] = 0;      // outside the wheel: transparent
        continue;
      }
      const angle = (degrees(atan2(dx, -dy)) + 360) % 360;
      const rgb = hsbToRgb(angle, constrain(rad / r, 0, 1), 1);
      wheelBuffer.pixels[idx] = rgb[0];
      wheelBuffer.pixels[idx + 1] = rgb[1];
      wheelBuffer.pixels[idx + 2] = rgb[2];
      wheelBuffer.pixels[idx + 3] = 255;
    }
  }
  wheelBuffer.updatePixels();
  wheelBufferR = r;
}

function drawWheel() {
  if (!wheelBuffer || abs(wheelBufferR - wheelR) > 0.5) buildWheelBuffer(wheelR);
  imageMode(CENTER);
  image(wheelBuffer, wheelCx, wheelCy);
  imageMode(CORNER);

  // Brightness is a separate dial, so a dimmer setting darkens the whole wheel.
  noStroke();
  fill(0, 0, 0, (1 - brightAmt) * 235);
  ellipse(wheelCx, wheelCy, wheelR * 2, wheelR * 2);

  noFill();
  stroke(150);
  strokeWeight(1);
  ellipse(wheelCx, wheelCy, wheelR * 2, wheelR * 2);

  // Angle labels tie wheel positions back to the chapter's color_wheel(angle).
  noStroke();
  fill('dimgray');
  textSize(11);
  textAlign(CENTER, CENTER);
  const marks = [0, 120, 240];
  for (let i = 0; i < marks.length; i++) {
    const a = radians(marks[i]);
    // The short degree sign keeps the two lower labels clear of both the
    // wheel edge and the brightness bar; " deg" was wide enough to overlap.
    text(marks[i] + '°', wheelCx + sin(a) * (wheelR + 16),
      wheelCy - cos(a) * (wheelR + 16));
  }
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);

  // The selector dot marks the current hue and saturation.
  const a = radians(hueDeg);
  const selX = wheelCx + sin(a) * satAmt * wheelR;
  const selY = wheelCy - cos(a) * satAmt * wheelR;
  stroke('white');
  strokeWeight(3);
  noFill();
  ellipse(selX, selY, 18, 18);
  stroke('black');
  strokeWeight(1.5);
  ellipse(selX, selY, 22, 22);
  strokeWeight(1);
}

function drawBrightnessBar() {
  // A vertical gradient: black at the bottom, this hue at full brightness on
  // top. Brightness is independent of hue and saturation, so it gets its own
  // control instead of a position on the wheel.
  noStroke();
  for (let i = 0; i < barBox.h; i++) {
    const v = 1 - i / barBox.h;
    const rgb = hsbToRgb(hueDeg, satAmt, v);
    fill(rgb[0], rgb[1], rgb[2]);
    rect(barBox.x, barBox.y + i, barBox.w, 1.4);
  }
  noFill();
  stroke(120);
  rect(barBox.x, barBox.y, barBox.w, barBox.h);

  const handleY = barBox.y + (1 - brightAmt) * barBox.h;
  stroke('black');
  strokeWeight(2);
  fill('white');
  rect(barBox.x - 5, handleY - 4, barBox.w + 10, 8, 3);
  strokeWeight(1);

  noStroke();
  fill('dimgray');
  textSize(11);
  textAlign(CENTER, TOP);
  text('bright', barBox.x + barBox.w / 2, barBox.y - 15);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}

// ---------------------------------------------------------------------------
// Swatch, badge, and emotion-association panel
// ---------------------------------------------------------------------------
function drawInfoPanel(x, y, w, h, compact) {
  const rgb = hsbToRgb(hueDeg, satAmt, brightAmt);
  const packed = color565(rgb[0], rgb[1], rgb[2]);
  const anchor = nearestAnchor();
  const warmth = warmthLabel();

  fill(255, 255, 255, 235);
  stroke(200);
  rect(x, y, w, h, 10);

  const innerX = x + 12;
  const wrapW = w - 24;
  let cursorY = y + 12;

  // The large swatch of the current selection
  const swatchW = compact ? min(120, w * 0.35) : wrapW;
  const swatchH = compact ? 76 : 108;
  stroke(120);
  fill(rgb[0], rgb[1], rgb[2]);
  rect(innerX, cursorY, swatchW, swatchH, 8);

  // Readouts sit beside the swatch when the panel is short and wide.
  const readX = compact ? innerX + swatchW + 12 : innerX;
  let readY = compact ? cursorY : cursorY + swatchH + 8;
  const readW = compact ? wrapW - swatchW - 12 : wrapW;

  noStroke();
  fill('black');
  textAlign(LEFT, TOP);
  textSize(14);
  text('RGB565: ' + hexWord(packed) + '  (' + packed + ')',
    readX, readY, readW, 20);
  readY += 20;

  fill('#37474F');
  textSize(13);
  text('hue ' + round(hueDeg) + ' deg   saturation ' + round(satAmt * 100) +
    '%   brightness ' + round(brightAmt * 100) + '%', readX, readY, readW, 34);
  readY += compact ? 32 : 22;

  fill('dimgray');
  textSize(12);
  text('color565(' + rgb[0] + ', ' + rgb[1] + ', ' + rgb[2] + ')',
    readX, readY, readW, 18);
  readY += 22;

  cursorY = compact ? max(cursorY + swatchH + 10, readY) : readY + 4;

  // Warm or cool badge
  const badgeColor = warmth === 'Warm' ? '#E64A19'
    : (warmth === 'Cool' ? '#1565C0' : '#757575');
  noStroke();
  fill(badgeColor);
  rect(innerX, cursorY, 92, 26, 13);
  fill('white');
  textAlign(CENTER, CENTER);
  textSize(14);
  text(warmth, innerX + 46, cursorY + 13);
  textAlign(LEFT, TOP);

  fill('#37474F');
  textSize(12);
  const warmthNote = warmth === 'Neutral'
    ? 'Almost no saturation, so this gray belongs to neither family.'
    : (warmth === 'Warm'
      ? 'Reds, oranges, and yellows read as energetic or urgent.'
      : 'Greens, blues, and purples read as calm, quiet, or serious.');
  text(warmthNote, innerX + 100, cursorY + 2, wrapW - 100, 34);
  cursorY += 34;

  // Emotion association for the nearest named hue
  fill('black');
  textSize(14);
  text('Closest named hue: ' + anchor.name, innerX, cursorY, wrapW, 20);
  cursorY += 20;
  fill('#1A237E');
  textSize(13);
  text(anchor.name + '  ->  ' + anchor.emotions, innerX, cursorY, wrapW, 20);
  cursorY += 22;

  fill('#37474F');
  textSize(12);
  const remaining = y + h - cursorY - 8;
  if (remaining > 16) {
    text('These associations are a design convention, not a law of physics. ' +
      'Use one to reinforce an expression\'s shape, or clash with it on ' +
      'purpose.', innerX, cursorY, wrapW, remaining);
  }
  textSize(defaultTextSize);
}

function drawControlLabels() {
  // The hint only fits when the strip has room left over beside the controls.
  if (canvasWidth >= 430 && canvasWidth < 660) return;
  noStroke();
  fill('dimgray');
  textAlign(LEFT, CENTER);
  textSize(12);
  const hintY = canvasWidth < 430 ? drawHeight + 82 : drawHeight + 25;
  const hintX = canvasWidth < 430 ? 90 : 300;
  text('Drag inside the wheel, or drag the vertical brightness bar.',
    hintX, hintY);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}
