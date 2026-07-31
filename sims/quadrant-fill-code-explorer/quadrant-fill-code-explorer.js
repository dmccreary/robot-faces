// Quadrant Fill Code Explorer MicroSim
// Chapter 7: Ellipse and Polygon Drawing
// Bloom level: Apply (L3) - demonstrate, apply
// Interaction: direct manipulation. Every quadrant toggle, radius change, and
// fill change redraws the simulated frame buffer and both readouts at once.
//
// CANVAS_HEIGHT: 585

// ---------------------------------------------------------------------------
// Layout constants (standard MicroSim pattern)
// ---------------------------------------------------------------------------
let canvasWidth = 800;
let drawHeight = 400;
let controlHeight = 185;          // five rows of controls
let canvasHeight = drawHeight + controlHeight;
let margin = 10;
let sliderLeftMargin = 175;
let defaultTextSize = 16;

// ---------------------------------------------------------------------------
// The simulated frame buffer. These match a 128x64 monochrome OLED, so the
// coordinates in the code readout are the same ones a student would type.
// ---------------------------------------------------------------------------
const BUF_W = 128;
const BUF_H = 64;
const BUF_CX = 64;                // ellipse center x used in every readout
const BUF_CY = 32;                // ellipse center y used in every readout

// Quadrant bit values, exactly as MicroPython's framebuf module defines them.
// The order below is the order the buttons appear on screen: top row first.
const QUADRANTS = [
  { bit: 2, name: 'upper left',  label: 'Upper Left (2)',  row: 0, col: 0 },
  { bit: 1, name: 'upper right', label: 'Upper Right (1)', row: 0, col: 1 },
  { bit: 4, name: 'lower left',  label: 'Lower Left (4)',  row: 1, col: 0 },
  { bit: 8, name: 'lower right', label: 'Lower Right (8)', row: 1, col: 1 }
];

// ---------------------------------------------------------------------------
// Model state
// ---------------------------------------------------------------------------
let quadrantMask = 15;            // 1 + 2 + 4 + 8, the whole ellipse
let xRadius = 20;
let yRadius = 12;
let isFilled = true;

// Cached list of frame-buffer pixels the ellipse touches. Each entry stores
// which quadrant bits could light it, so changing the mask never needs a
// recalculation of the ellipse shape itself.
let litPixels = [];

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
let quadrantButtons = [];
let xRadiusSlider;
let yRadiusSlider;
let filledCheckbox;
let resetButton;

// ---------------------------------------------------------------------------
// Computed layout, refreshed every frame
// ---------------------------------------------------------------------------
let isNarrow = false;
let bufX = 0, bufY = 0, bufW = 0, bufH = 0, cellSize = 3;
let panelX = 0, panelY = 0, panelW = 0, panelH = 0;
let captionY = 0;
let lastLayoutWidth = -1;       // so controls are only repositioned on a resize

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
function setup() {
  updateCanvasSize();
  const cnv = createCanvas(canvasWidth, canvasHeight);
  const parentEl = document.querySelector('main');
  cnv.parent(parentEl);

  // Four quadrant toggles, laid out as a 2x2 grid that matches the ellipse's
  // own quadrant positions on screen.
  for (let i = 0; i < QUADRANTS.length; i++) {
    const q = QUADRANTS[i];
    const btn = createButton(q.label);
    btn.parent(parentEl);
    btn.size(140, 26);
    btn.mousePressed(makeQuadrantToggler(q.bit));
    quadrantButtons.push(btn);
  }

  filledCheckbox = createCheckbox('Filled', true);
  filledCheckbox.parent(parentEl);
  filledCheckbox.changed(onFilledChanged);

  resetButton = createButton('Reset to Full Ellipse');
  resetButton.parent(parentEl);
  resetButton.size(180, 26);
  resetButton.mousePressed(resetToFullEllipse);

  xRadiusSlider = createSlider(5, 40, xRadius, 1);
  xRadiusSlider.parent(parentEl);
  xRadiusSlider.input(onRadiusChanged);

  yRadiusSlider = createSlider(5, 40, yRadius, 1);
  yRadiusSlider.parent(parentEl);
  yRadiusSlider.input(onRadiusChanged);

  positionControls();
  refreshButtonStyles();
  recomputePixels();

  describe(
    'A simulated 128 by 64 monochrome display shows one ellipse centered at ' +
    'coordinate 64, 32. Four toggle buttons arranged in a two by two grid turn ' +
    'each quadrant of the ellipse on or off. A readout panel shows the binary ' +
    'and decimal value of the quadrant fill mask and the matching MicroPython ' +
    'fb.ellipse call. Two sliders set the x and y radius and a checkbox ' +
    'switches between a filled and an outlined ellipse.'
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
  const sliderW = max(90, canvasWidth - sliderLeftMargin - margin);

  // Rows 0 and 1: the 2x2 grid of quadrant toggles.
  for (let i = 0; i < quadrantButtons.length; i++) {
    const q = QUADRANTS[i];
    quadrantButtons[i].position(10 + q.col * 145, drawHeight + 8 + q.row * 35);
  }

  // Row 2: the fill checkbox and the reset button.
  filledCheckbox.position(10, drawHeight + 82);
  resetButton.position(110, drawHeight + 78);

  // Rows 3 and 4: the two radius sliders.
  xRadiusSlider.position(sliderLeftMargin, drawHeight + 113);
  xRadiusSlider.size(sliderW);
  yRadiusSlider.position(sliderLeftMargin, drawHeight + 148);
  yRadiusSlider.size(sliderW);
}

// ---------------------------------------------------------------------------
// Control callbacks
// ---------------------------------------------------------------------------

// A small factory so each button remembers its own bit value.
function makeQuadrantToggler(bitValue) {
  return function () {
    toggleQuadrant(bitValue);
  };
}

// Bitwise XOR flips exactly one bit of the mask and leaves the other three
// alone. That is the same arithmetic the chapter describes as adding or
// removing one quadrant's value.
function toggleQuadrant(bitValue) {
  quadrantMask = quadrantMask ^ bitValue;
  refreshButtonStyles();
}

function onRadiusChanged() {
  xRadius = xRadiusSlider.value();
  yRadius = yRadiusSlider.value();
  recomputePixels();
}

function onFilledChanged() {
  isFilled = filledCheckbox.checked();
  recomputePixels();
}

function resetToFullEllipse() {
  quadrantMask = 15;
  refreshButtonStyles();
}

// An enabled quadrant gets the book's teal accent; a disabled one stays white.
function refreshButtonStyles() {
  for (let i = 0; i < quadrantButtons.length; i++) {
    const isOn = (quadrantMask & QUADRANTS[i].bit) !== 0;
    const btn = quadrantButtons[i];
    btn.style('background-color', isOn ? '#00BFA5' : 'white');
    btn.style('color', isOn ? 'white' : '#37474F');
    btn.style('border', isOn ? '1px solid #00897B' : '1px solid silver');
    btn.style('border-radius', '6px');
    btn.style('font-size', '14px');
    btn.style('cursor', 'pointer');
  }
}

// ---------------------------------------------------------------------------
// Ellipse math on the simulated frame buffer
// ---------------------------------------------------------------------------

// Standard ellipse test: a point is inside when the sum of its squared,
// radius-scaled offsets is no more than one.
function isInsideEllipse(px, py) {
  const dx = (px - BUF_CX) / xRadius;
  const dy = (py - BUF_CY) / yRadius;
  return dx * dx + dy * dy <= 1;
}

// An outlined ellipse keeps only the pixels that have at least one neighbor
// outside the shape. That leaves a one-pixel-thick edge, matching what
// fb.ellipse() draws when fill is False.
function isEdgePixel(px, py) {
  return !(isInsideEllipse(px - 1, py) && isInsideEllipse(px + 1, py) &&
           isInsideEllipse(px, py - 1) && isInsideEllipse(px, py + 1));
}

// Which quadrant bits can light this pixel? Pixels sitting exactly on the
// center row or center column belong to two quadrants at once, so they light
// whenever either of those quadrants is enabled.
function quadrantBitsAt(px, py) {
  const dx = px - BUF_CX;
  const dy = py - BUF_CY;
  let bits = 0;
  if (dy <= 0 && dx >= 0) bits = bits | 1;   // upper right
  if (dy <= 0 && dx <= 0) bits = bits | 2;   // upper left
  if (dy >= 0 && dx <= 0) bits = bits | 4;   // lower left
  if (dy >= 0 && dx >= 0) bits = bits | 8;   // lower right
  return bits;
}

// Rebuild the pixel list. Only the radii and the fill setting change the shape,
// so the mask is applied later, at drawing time.
function recomputePixels() {
  litPixels = [];
  for (let py = BUF_CY - yRadius; py <= BUF_CY + yRadius; py++) {
    if (py < 0 || py >= BUF_H) continue;          // clipped by the display edge
    for (let px = BUF_CX - xRadius; px <= BUF_CX + xRadius; px++) {
      if (px < 0 || px >= BUF_W) continue;
      if (!isInsideEllipse(px, py)) continue;
      if (!isFilled && !isEdgePixel(px, py)) continue;
      litPixels.push({ x: px, y: py, bits: quadrantBitsAt(px, py) });
    }
  }
}

// ---------------------------------------------------------------------------
// Layout helpers
// ---------------------------------------------------------------------------
function computeLayout() {
  isNarrow = canvasWidth < 600;

  const titleH = 34;
  const captionH = 18;         // room for the caption under the display
  const areaX = margin;
  const areaY = titleH;
  let areaW, areaH;

  if (isNarrow) {
    // Readout panel stacks below the display on narrow screens.
    panelW = canvasWidth - 2 * margin;
    panelH = 128;
    areaW = canvasWidth - 2 * margin;
    areaH = drawHeight - titleH - captionH - panelH - 8 - margin;
  } else {
    panelW = min(250, floor(canvasWidth * 0.34));
    panelH = 250;
    areaW = canvasWidth - panelW - 3 * margin;
    areaH = drawHeight - titleH - captionH - margin;
  }

  // One frame-buffer pixel is drawn as a square of cellSize screen pixels.
  cellSize = constrain(floor(min(areaW / BUF_W, areaH / BUF_H)), 1, 5);
  bufW = cellSize * BUF_W;
  bufH = cellSize * BUF_H;
  bufX = areaX + (areaW - bufW) / 2;
  bufY = isNarrow ? areaY : areaY + (areaH - bufH) / 2;
  captionY = bufY + bufH + 4;

  if (isNarrow) {
    panelX = margin;
    panelY = captionY + captionH;
  } else {
    panelX = areaX + areaW + margin;
    panelY = areaY;
  }
}

// ---------------------------------------------------------------------------
// Clicking a quadrant of the display toggles that same quadrant
// ---------------------------------------------------------------------------
function mousePressed() {
  computeLayout();
  if (mouseX < bufX || mouseX > bufX + bufW) return;
  if (mouseY < bufY || mouseY > bufY + bufH) return;

  const onRight = mouseX >= bufX + bufW / 2;
  const onBottom = mouseY >= bufY + bufH / 2;
  if (!onRight && !onBottom) toggleQuadrant(2);
  else if (onRight && !onBottom) toggleQuadrant(1);
  else if (!onRight && onBottom) toggleQuadrant(4);
  else toggleQuadrant(8);
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------
function draw() {
  updateCanvasSize();
  if (canvasWidth !== lastLayoutWidth) {
    positionControls();
    lastLayoutWidth = canvasWidth;
  }
  computeLayout();

  stroke('silver');
  fill('aliceblue');
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  drawTitle();
  drawFrameBuffer();
  drawReadoutPanel();
  drawControlLabels();
}

function drawTitle() {
  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(canvasWidth < 500 ? 18 : 22);
  const titleX = isNarrow ? canvasWidth / 2 : (canvasWidth - panelW - margin) / 2;
  text('Quadrant Fill Code Explorer', titleX, 6);
  textSize(defaultTextSize);
  textAlign(LEFT, TOP);
}

// The simulated display: dark background, lit pixels in white, exactly like a
// monochrome OLED with one pixel per square.
function drawFrameBuffer() {
  noStroke();
  fill('#101418');
  rect(bufX, bufY, bufW, bufH);

  // Faint pixel grid, only when the squares are big enough to keep it readable.
  if (cellSize >= 4) {
    stroke(255, 255, 255, 15);
    strokeWeight(1);
    for (let gx = 1; gx < BUF_W; gx++) {
      line(bufX + gx * cellSize, bufY, bufX + gx * cellSize, bufY + bufH);
    }
    for (let gy = 1; gy < BUF_H; gy++) {
      line(bufX, bufY + gy * cellSize, bufX + bufW, bufY + gy * cellSize);
    }
  }

  // Only the pixels whose quadrant is currently enabled are lit.
  noStroke();
  fill('white');
  for (let i = 0; i < litPixels.length; i++) {
    const p = litPixels[i];
    if ((p.bits & quadrantMask) === 0) continue;
    rect(bufX + p.x * cellSize, bufY + p.y * cellSize, cellSize, cellSize);
  }

  drawQuadrantGuides();

  // Border and caption
  noFill();
  stroke('silver');
  strokeWeight(1);
  rect(bufX, bufY, bufW, bufH);
  noStroke();
  fill('dimgray');
  textAlign(CENTER, TOP);
  textSize(13);
  text('Simulated 128 x 64 display - click a quadrant to toggle it',
    bufX + bufW / 2, captionY);
  textSize(defaultTextSize);
  textAlign(LEFT, TOP);
}

// Dashed center lines plus a bit-value label in each corner, so the number on
// each button can be matched to a real region of the screen.
function drawQuadrantGuides() {
  const midX = bufX + bufW / 2;
  const midY = bufY + bufH / 2;

  stroke(0, 191, 165, 150);
  strokeWeight(1);
  drawingContext.setLineDash([4, 4]);
  line(midX, bufY, midX, bufY + bufH);
  line(bufX, midY, bufX + bufW, midY);
  drawingContext.setLineDash([]);

  noStroke();
  textSize(14);
  const pad = 6;
  const corners = [
    { bit: 2, x: bufX + pad, y: bufY + pad, hAlign: LEFT, vAlign: TOP },
    { bit: 1, x: bufX + bufW - pad, y: bufY + pad, hAlign: RIGHT, vAlign: TOP },
    { bit: 4, x: bufX + pad, y: bufY + bufH - pad, hAlign: LEFT, vAlign: BOTTOM },
    { bit: 8, x: bufX + bufW - pad, y: bufY + bufH - pad, hAlign: RIGHT, vAlign: BOTTOM }
  ];
  for (let i = 0; i < corners.length; i++) {
    const c = corners[i];
    const isOn = (quadrantMask & c.bit) !== 0;
    fill(isOn ? '#00BFA5' : '#546E7A');
    textAlign(c.hAlign, c.vAlign);
    text(c.bit, c.x, c.y);
  }
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}

// The live readout: the mask in binary and decimal, which quadrants that mask
// selects, and the exact MicroPython call that produces the picture.
function drawReadoutPanel() {
  noStroke();
  fill(255, 255, 255, 235);
  stroke(200);
  rect(panelX, panelY, panelW, panelH, 10);

  const leftX = panelX + 10;
  const wrapW = panelW - 20;
  const drawnList = quadrantMask === 0 ? 'nothing at all' : enabledQuadrantNames();
  let y = panelY + 8;

  noStroke();
  textAlign(LEFT, TOP);

  if (isNarrow) {
    // Compact one-line-per-fact version for a stacked panel.
    fill('black');
    textSize(14);
    text('Quadrant fill code:', leftX, y);
    textFont('monospace');
    fill('#00695C');
    textSize(15);
    text('0b' + binaryString(quadrantMask) + ' = ' + quadrantMask, leftX + 150, y - 1);
    textFont('sans-serif');
    y += 22;
  } else {
    fill('black');
    textSize(15);
    text('Quadrant Fill Code', leftX, y);
    y += 24;

    textFont('monospace');
    fill('#00695C');
    textSize(17);
    text('0b' + binaryString(quadrantMask), leftX, y);
    y += 22;
    text('decimal ' + quadrantMask, leftX, y);
    textFont('sans-serif');
    y += 26;
  }

  fill('#37474F');
  textSize(13);
  text('Drawing: ' + drawnList, leftX, y, wrapW, 34);
  y += 36;

  if (!isNarrow) {
    stroke(220);
    line(leftX, y, leftX + wrapW, y);
    noStroke();
    y += 8;
    fill('black');
    textSize(13);
    text('The MicroPython call:', leftX, y);
    y += 18;
  }

  textFont('monospace');
  fill('#37474F');
  textSize(13);
  text(codeReadout(), leftX, y, wrapW, 58);
  textFont('sans-serif');
  y += 56;

  // A reminder that 15 is what framebuf assumes when the argument is left off.
  if (!isNarrow) {
    fill('dimgray');
    textSize(12);
    if (quadrantMask === 15) {
      text('15 is the default, so this last argument can be left off entirely.',
        leftX, y, wrapW, 46);
    } else {
      text('Turn every quadrant back on to see the mask return to 15.',
        leftX, y, wrapW, 46);
    }
  }
  textSize(defaultTextSize);
}

// Four binary digits, most significant bit first, so the string reads 1111.
function binaryString(value) {
  let s = '';
  for (let bitIndex = 3; bitIndex >= 0; bitIndex--) {
    s += ((value >> bitIndex) & 1);
  }
  return s;
}

function enabledQuadrantNames() {
  const names = [];
  for (let i = 0; i < QUADRANTS.length; i++) {
    if ((quadrantMask & QUADRANTS[i].bit) !== 0) names.push(QUADRANTS[i].name);
  }
  return names.join(', ');
}

function codeReadout() {
  return 'fb.ellipse(' + BUF_CX + ', ' + BUF_CY + ', ' + xRadius + ', ' +
    yRadius + ', WHITE, ' + (isFilled ? 'True' : 'False') + ', ' +
    quadrantMask + ')';
}

// Labels drawn inside the white control region.
function drawControlLabels() {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('xradius: ' + xRadius, 10, drawHeight + 123);
  text('yradius: ' + yRadius, 10, drawHeight + 158);
  textAlign(LEFT, TOP);
}
