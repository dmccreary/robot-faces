// Circular Buffer Waste Visualizer MicroSim
// Chapter 5: Display & Coordinate Systems
// Bloom level: Analyze (L4) - differentiate, examine
// Interaction: hover-to-examine. Moving the pointer over the 240 x 240 buffer
// reports that pixel's coordinate, byte offset, and visible/wasted status.
//
// CANVAS_HEIGHT: 500

// ---------------------------------------------------------------------------
// Layout constants (standard MicroSim pattern)
// ---------------------------------------------------------------------------
let canvasWidth = 800;
let drawHeight = 420;
let controlHeight = 80;           // two rows of controls
let canvasHeight = drawHeight + controlHeight;
let margin = 16;
let defaultTextSize = 16;

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
let wastedCheckbox;
let byteGridCheckbox;
let resetButton;

// ---------------------------------------------------------------------------
// Model constants
// The round LCD has a 240 x 240 square frame buffer, but only the inscribed
// circle of diameter 240 is physically visible.
// ---------------------------------------------------------------------------
const BUF_SIZE = 240;             // pixels across and down
const RADIUS = BUF_SIZE / 2;      // 120 pixels
const BYTES_PER_PIXEL = 2;        // 16-bit RGB565 color
const GRID_STEP = 8;              // light gridline every 8 buffer pixels
const BYTE_GRID_STEP = 16;        // bold gridline every 16 buffer pixels

// Counted once at load time, since the circle never moves.
let visibleCount = 0;
let wastedCount = 0;

// ---------------------------------------------------------------------------
// Model state
// ---------------------------------------------------------------------------
let showWasted = true;
let showByteGrid = false;
let pinnedPixel = null;           // {x, y} once the learner clicks a cell

// Computed layout, refreshed every frame
let gridX = 0;
let gridY = 58;
let gridSide = 300;
let panelX = 0;
let panelY = 0;
let panelW = 0;
let panelH = 0;
let isNarrow = false;

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
function setup() {
  updateCanvasSize();
  const cnv = createCanvas(canvasWidth, canvasHeight);
  cnv.parent(document.querySelector('main'));

  const parentEl = document.querySelector('main');

  wastedCheckbox = createCheckbox(' Show wasted pixels', true);
  wastedCheckbox.parent(parentEl);
  wastedCheckbox.changed(() => { showWasted = wastedCheckbox.checked(); });

  byteGridCheckbox = createCheckbox(' Show buffer byte grid', false);
  byteGridCheckbox.parent(parentEl);
  byteGridCheckbox.changed(() => { showByteGrid = byteGridCheckbox.checked(); });

  resetButton = createButton('Reset');
  resetButton.parent(parentEl);
  resetButton.size(70);
  resetButton.mousePressed(resetAll);

  countPixels();
  positionControls();

  describe(
    'A 240 by 240 square frame buffer with a circle of diameter 240 drawn ' +
    'inside it. Pixels inside the circle are teal and reach the round screen. ' +
    'Pixels in the four corners are coral and are never seen. Pointing at any ' +
    'pixel reports its coordinate, its byte offset, and which group it is in.'
  );
}

// Walk every buffer pixel once and sort it into visible or wasted.
function countPixels() {
  visibleCount = 0;
  for (let py = 0; py < BUF_SIZE; py++) {
    for (let px = 0; px < BUF_SIZE; px++) {
      if (isVisiblePixel(px, py)) visibleCount++;
    }
  }
  wastedCount = BUF_SIZE * BUF_SIZE - visibleCount;
}

// A pixel is visible when its center lies inside the inscribed circle.
function isVisiblePixel(px, py) {
  const dx = px + 0.5 - RADIUS;
  const dy = py + 0.5 - RADIUS;
  return dx * dx + dy * dy <= RADIUS * RADIUS;
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
  wastedCheckbox.position(10, drawHeight + 12);
  byteGridCheckbox.position(10, drawHeight + 47);
  resetButton.position(max(220, canvasWidth - 70 - margin), drawHeight + 10);
}

function resetAll() {
  pinnedPixel = null;
  showWasted = true;
  showByteGrid = false;
  wastedCheckbox.checked(true);
  byteGridCheckbox.checked(false);
}

// ---------------------------------------------------------------------------
// Layout
// On wide screens the grid takes the left 65% and the readout panel the right
// 35%. On narrow screens the panel drops below the grid.
// ---------------------------------------------------------------------------
function computeLayout() {
  isNarrow = canvasWidth < 620;
  gridY = 58;

  if (isNarrow) {
    panelH = 150;
    const maxSide = drawHeight - gridY - panelH - 30;
    gridSide = max(120, min(canvasWidth - 2 * margin, maxSide));
    gridX = (canvasWidth - gridSide) / 2;
    panelX = margin;
    panelW = canvasWidth - 2 * margin;
    panelY = drawHeight - panelH - 8;
  } else {
    const leftW = canvasWidth * 0.65 - 2 * margin;
    gridSide = max(150, min(leftW, drawHeight - gridY - 52));
    gridX = margin + (leftW - gridSide) / 2;
    panelX = canvasWidth * 0.65 + 4;
    panelW = canvasWidth - panelX - margin;
    panelY = gridY;
    panelH = drawHeight - gridY - 14;
  }
}

// Convert a buffer pixel coordinate to a canvas x or y.
function toCanvas(bufCoord) {
  return (bufCoord / BUF_SIZE) * gridSide;
}

// Which buffer pixel is the pointer over? Returns null when outside the grid.
function pixelUnderMouse() {
  if (mouseX < gridX || mouseX >= gridX + gridSide) return null;
  if (mouseY < gridY || mouseY >= gridY + gridSide) return null;
  const px = floor(((mouseX - gridX) / gridSide) * BUF_SIZE);
  const py = floor(((mouseY - gridY) / gridSide) * BUF_SIZE);
  return {
    x: constrain(px, 0, BUF_SIZE - 1),
    y: constrain(py, 0, BUF_SIZE - 1)
  };
}

// Clicking a cell pins the infobox so it can be read without holding still.
function mousePressed() {
  const p = pixelUnderMouse();
  if (p) pinnedPixel = p;
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------
function draw() {
  updateCanvasSize();
  computeLayout();

  stroke('silver');
  fill('aliceblue');
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  drawTitle();
  drawBuffer();

  const hovered = pixelUnderMouse();
  const shown = hovered || pinnedPixel;
  if (shown) drawCrosshair(shown, hovered !== null);

  drawPanel(shown, hovered !== null);
}

function drawTitle() {
  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(canvasWidth < 520 ? 17 : 22);
  text('Circular Buffer Waste Visualizer', canvasWidth / 2, 8);

  fill('dimgray');
  textSize(14);
  text('A square 240 x 240 buffer feeding a round 240-pixel screen',
    canvasWidth / 2, 36);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}

// The buffer square, the inscribed circle, and the gridlines over both.
function drawBuffer() {
  noStroke();

  // The whole square starts as either wasted-coral or plain white.
  if (showWasted) {
    fill(255, 112, 67, 110);       // translucent coral: never reaches the screen
  } else {
    fill('white');
  }
  rect(gridX, gridY, gridSide, gridSide);

  // The inscribed circle is the part the round display actually shows.
  fill(0, 191, 165, 120);          // translucent teal: visible region
  ellipse(gridX + gridSide / 2, gridY + gridSide / 2, gridSide, gridSide);

  // Light gridlines every 8 buffer pixels
  stroke(200);
  strokeWeight(1);
  for (let i = GRID_STEP; i < BUF_SIZE; i += GRID_STEP) {
    const offset = toCanvas(i);
    line(gridX + offset, gridY, gridX + offset, gridY + gridSide);
    line(gridX, gridY + offset, gridX + gridSide, gridY + offset);
  }

  // The optional byte grid: bolder lines every 16 pixels.
  if (showByteGrid) {
    stroke(90);
    strokeWeight(1);
    for (let i = BYTE_GRID_STEP; i < BUF_SIZE; i += BYTE_GRID_STEP) {
      const offset = toCanvas(i);
      line(gridX + offset, gridY, gridX + offset, gridY + gridSide);
      line(gridX, gridY + offset, gridX + gridSide, gridY + offset);
    }
  }

  // Outer border of the buffer
  noFill();
  stroke('dimgray');
  strokeWeight(1.5);
  rect(gridX, gridY, gridSide, gridSide);
  strokeWeight(1);

  // Caption under the grid explains the byte layout when that grid is on.
  noStroke();
  fill('dimgray');
  textAlign(CENTER, TOP);
  textSize(13);
  let caption;
  if (showByteGrid) {
    caption = isNarrow
      ? '16-bit color: 2 bytes per pixel, 480 bytes per row.'
      : '16-bit color uses 2 bytes per pixel, so each row of 240 pixels is 480 bytes.';
  } else {
    caption = isNarrow
      ? 'Hover a pixel. Click to pin.'
      : 'Hover any pixel to examine it. Click to pin the reading.';
  }
  // The caption spans the whole column, not just the grid, so it stays on one
  // line even when the grid itself is narrow.
  const capW = isNarrow
    ? canvasWidth - 2 * margin
    : canvasWidth * 0.65 - 2 * margin;
  text(caption, margin, gridY + gridSide + 6, capW, 34);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}

// A coral crosshair plus a small marker box on the examined pixel.
function drawCrosshair(p, isHover) {
  const cx = gridX + toCanvas(p.x + 0.5);
  const cy = gridY + toCanvas(p.y + 0.5);
  const boxSide = max(6, gridSide / BUF_SIZE);

  stroke(isHover ? 'crimson' : 'darkorange');
  strokeWeight(1);
  line(gridX, cy, gridX + gridSide, cy);
  line(cx, gridY, cx, gridY + gridSide);

  noFill();
  strokeWeight(2);
  rect(cx - boxSide / 2, cy - boxSide / 2, boxSide, boxSide);
  strokeWeight(1);
}

// The right-side (or bottom) readout: fixed pixel counts plus the infobox.
function drawPanel(shown, isHover) {
  noStroke();
  fill(255, 255, 255, 230);
  stroke(200);
  rect(panelX, panelY, panelW, panelH, 10);

  const twoColumn = panelH < 250;
  const colW = twoColumn ? panelW / 2 : panelW;
  const tx = panelX + 12;
  drawCountBlock(tx, panelY + 10, colW - 20);

  const infoX = twoColumn ? panelX + colW + 12 : tx;
  const infoY = twoColumn ? panelY + 10 : panelY + 150;
  drawInfoBlock(infoX, infoY, colW - 20, shown, isHover);
}

// The visible / wasted tallies, computed once at load time.
function drawCountBlock(x, y, w) {
  const total = BUF_SIZE * BUF_SIZE;
  const visPct = (100 * visibleCount / total).toFixed(1);
  const wastePct = (100 * wastedCount / total).toFixed(1);

  noStroke();
  textAlign(LEFT, TOP);

  fill('black');
  textSize(15);
  text('Pixel count', x, y);

  fill('teal');
  textSize(15);
  text('Visible: ' + withCommas(visibleCount), x, y + 26);
  textSize(13);
  text('(' + visPct + '% of the buffer)', x, y + 46);

  fill('coral');
  textSize(15);
  text('Wasted: ' + withCommas(wastedCount), x, y + 70);
  textSize(13);
  text('(' + wastePct + '% of the buffer)', x, y + 90);

  fill('dimgray');
  textSize(13);
  text('Total buffer: ' + withCommas(total) + ' pixels', x, y + 114);
  textSize(defaultTextSize);
}

// The hovered or pinned pixel's details.
function drawInfoBlock(x, y, w, shown, isHover) {
  noStroke();
  textAlign(LEFT, TOP);

  fill('black');
  textSize(15);
  const heading = !shown ? 'Examined pixel'
    : (isHover ? 'Hovered pixel' : 'Pinned pixel');
  text(heading, x, y);

  if (!shown) {
    fill('dimgray');
    textSize(13);
    text('Move the pointer onto the buffer to read a pixel.', x, y + 26, w, 60);
    textSize(defaultTextSize);
    return;
  }

  const visible = isVisiblePixel(shown.x, shown.y);
  const offset = (shown.y * BUF_SIZE + shown.x) * BYTES_PER_PIXEL;

  fill('black');
  textFont('monospace');
  textSize(15);
  text('(x, y) = (' + shown.x + ', ' + shown.y + ')', x, y + 26);
  text('byte ' + withCommas(offset), x, y + 48);
  textFont('sans-serif');

  fill(visible ? 'teal' : 'coral');
  textSize(17);
  text(visible ? 'VISIBLE' : 'WASTED', x, y + 74);

  fill('dimgray');
  textSize(13);
  const why = visible
    ? 'Inside the circle, so this pixel reaches the screen.'
    : 'Outside the circle, so this pixel is stored but never seen.';
  text(why, x, y + 98, w, 60);
  textSize(defaultTextSize);
}

// Insert thousands separators, e.g. 45244 becomes "45,244".
function withCommas(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

