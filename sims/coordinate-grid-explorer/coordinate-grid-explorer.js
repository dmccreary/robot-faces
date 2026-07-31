// Coordinate Grid Explorer MicroSim
// Chapter 5: Display & Coordinate Systems
// Bloom level: Apply (L3) - demonstrate, identify
// Interaction: direct manipulation. Clicking any cell of the scaled-up pixel
// grid reports the exact integer (x, y) coordinate of that pixel.
//
// CANVAS_HEIGHT: 480

// ---------------------------------------------------------------------------
// Layout constants (standard MicroSim pattern)
// ---------------------------------------------------------------------------
let canvasWidth = 800;
let drawHeight = 400;
let controlHeight = 80;           // two rows of controls
let canvasHeight = drawHeight + controlHeight;
let margin = 16;
let defaultTextSize = 16;

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
let displaySelect;
let axesCheckbox;
let quadrantCheckbox;
let resetButton;

// ---------------------------------------------------------------------------
// Model state
// dispW and dispH are the display's pixel counts, named to stay clear of the
// p5.js globals width and height.
// ---------------------------------------------------------------------------
let dispW = 128;
let dispH = 64;
let displayName = '128x64 OLED';
let showAxes = true;
let showQuadrant = false;
let clickedPixel = null;          // {x, y} once the learner clicks

// A darker gridline every 8 pixels hints at the byte boundaries in the buffer.
const BYTE_STEP = 8;

// Computed layout, refreshed every frame
let gridX = 0;
let gridY = 96;
let gridW = 0;
let gridH = 0;
let pxScale = 1;                  // canvas pixels per display pixel
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

  displaySelect = createSelect();
  displaySelect.parent(parentEl);
  displaySelect.option('128x64 OLED');
  displaySelect.option('240x240 Color Round');
  displaySelect.selected('128x64 OLED');
  displaySelect.changed(onDisplayChanged);

  axesCheckbox = createCheckbox(' Show origin & axes', true);
  axesCheckbox.parent(parentEl);
  axesCheckbox.changed(() => { showAxes = axesCheckbox.checked(); });

  quadrantCheckbox = createCheckbox(' Show valid quadrant', false);
  quadrantCheckbox.parent(parentEl);
  quadrantCheckbox.changed(() => { showQuadrant = quadrantCheckbox.checked(); });

  resetButton = createButton('Reset');
  resetButton.parent(parentEl);
  resetButton.size(70);
  resetButton.mousePressed(resetAll);

  positionControls();

  describe(
    'A scaled-up pixel grid standing in for a robot display. Clicking any ' +
    'cell drops a coral crosshair and reports that pixel as an integer x and ' +
    'y pair. Optional markers show the origin in the upper-left corner, the ' +
    'direction x increases, and the direction y increases.'
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
  displaySelect.position(80, drawHeight + 10);
  resetButton.position(max(250, canvasWidth - 70 - margin), drawHeight + 10);
  axesCheckbox.position(10, drawHeight + 47);
  quadrantCheckbox.position(190, drawHeight + 47);
}

// ---------------------------------------------------------------------------
// Control callbacks
// ---------------------------------------------------------------------------
function onDisplayChanged() {
  displayName = displaySelect.value();
  if (displayName === '240x240 Color Round') {
    dispW = 240;
    dispH = 240;
  } else {
    dispW = 128;
    dispH = 64;
  }
  clickedPixel = null;            // the old marker no longer means anything
}

function resetAll() {
  clickedPixel = null;
  showAxes = true;
  showQuadrant = false;
  axesCheckbox.checked(true);
  quadrantCheckbox.checked(false);
}

// ---------------------------------------------------------------------------
// Layout
// The grid keeps the display's aspect ratio inside whatever box is available.
// ---------------------------------------------------------------------------
function computeLayout() {
  isNarrow = canvasWidth < 620;
  const gridLeft = margin + 30;   // room for the rotated "Y increases" label
  const gridTop = 96;             // room for the title and the "X increases" label

  let boxW;
  let boxH;
  if (isNarrow) {
    panelH = 108;
    boxW = canvasWidth - gridLeft - margin;
    boxH = drawHeight - gridTop - panelH - 34;
    panelX = margin;
    panelW = canvasWidth - 2 * margin;
    panelY = drawHeight - panelH - 8;
  } else {
    boxW = canvasWidth * 0.70 - gridLeft - 10;
    boxH = drawHeight - gridTop - 46;
    panelX = canvasWidth * 0.70 + 4;
    panelW = canvasWidth - panelX - margin;
    panelY = gridTop - 30;
    panelH = drawHeight - panelY - 14;
  }

  boxW = max(60, boxW);
  boxH = max(60, boxH);
  pxScale = min(boxW / dispW, boxH / dispH);
  gridW = dispW * pxScale;
  gridH = dispH * pxScale;
  // Center the grid in whatever box is left over, so a square display does
  // not sit hard against the left edge.
  gridX = gridLeft + (boxW - gridW) / 2;
  gridY = gridTop;
}

// Which display pixel is under the pointer? Returns null when outside.
function pixelAt(mx, my) {
  if (mx < gridX || mx >= gridX + gridW) return null;
  if (my < gridY || my >= gridY + gridH) return null;
  return {
    x: constrain(floor((mx - gridX) / pxScale), 0, dispW - 1),
    y: constrain(floor((my - gridY) / pxScale), 0, dispH - 1)
  };
}

// Clicking snaps to the nearest whole pixel and drops the marker there.
function mousePressed() {
  const p = pixelAt(mouseX, mouseY);
  if (p) clickedPixel = p;
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

  drawGrid();
  if (showQuadrant) drawQuadrantOverlay();
  if (showAxes) drawAxes();
  if (clickedPixel) drawMarker(clickedPixel);
  drawTitle();
  drawPanel();
  drawControlLabels();
}

function drawTitle() {
  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(canvasWidth < 520 ? 17 : 22);
  text('Coordinate Grid Explorer', canvasWidth * (isNarrow ? 0.5 : 0.35), 8);

  fill('dimgray');
  textSize(14);
  text('Click a pixel to read its (x, y) coordinate',
    canvasWidth * (isNarrow ? 0.5 : 0.35), 36);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}

// The grid of simulated pixels. Every pixel gets its own faint line when the
// cells are big enough; otherwise only the byte-boundary lines are drawn.
function drawGrid() {
  noStroke();
  fill('white');
  rect(gridX, gridY, gridW, gridH);

  const perPixelLines = pxScale >= 3;

  if (perPixelLines) {
    stroke(228);
    strokeWeight(1);
    for (let px = 1; px < dispW; px++) {
      const x = gridX + px * pxScale;
      line(x, gridY, x, gridY + gridH);
    }
    for (let py = 1; py < dispH; py++) {
      const y = gridY + py * pxScale;
      line(gridX, y, gridX + gridW, y);
    }
  }

  // Darker line every 8 pixels: the byte boundaries of the frame buffer
  stroke(180);
  strokeWeight(1);
  for (let px = BYTE_STEP; px < dispW; px += BYTE_STEP) {
    const x = gridX + px * pxScale;
    line(x, gridY, x, gridY + gridH);
  }
  for (let py = BYTE_STEP; py < dispH; py += BYTE_STEP) {
    const y = gridY + py * pxScale;
    line(gridX, y, gridX + gridW, y);
  }

  noFill();
  stroke('dimgray');
  strokeWeight(1.5);
  rect(gridX, gridY, gridW, gridH);
  strokeWeight(1);
}

// A teal wash over the whole grid: the only quadrant a display ever uses.
function drawQuadrantOverlay() {
  noStroke();
  fill(0, 191, 165, 70);          // translucent teal
  rect(gridX, gridY, gridW, gridH);

  // The caption only appears when there is clear space beneath the grid.
  const captionY = gridY + gridH + 6;
  const captionLimit = isNarrow ? panelY : drawHeight;
  if (captionY + 30 <= captionLimit) {
    fill('teal');
    textAlign(LEFT, TOP);
    textSize(13);
    text('Only positive X, positive Y - the rest of the plane is never used',
      gridX, captionY, gridW, 30);
  }
  textSize(defaultTextSize);
}

// Origin dot plus the two direction arrows and their labels.
function drawAxes() {
  // Origin marker at pixel (0, 0), the upper-left corner
  noStroke();
  fill('teal');
  ellipse(gridX, gridY, 14, 14);
  textAlign(LEFT, BOTTOM);
  textSize(13);
  text('origin (0, 0)', gridX + 10, gridY - 4);

  // Horizontal arrow above the top edge
  const arrowY = gridY - 26;
  stroke('teal');
  strokeWeight(2);
  const arrowRight = gridX + gridW;
  line(gridX, arrowY, arrowRight, arrowY);
  line(arrowRight, arrowY, arrowRight - 9, arrowY - 5);
  line(arrowRight, arrowY, arrowRight - 9, arrowY + 5);
  noStroke();
  fill('teal');
  textAlign(CENTER, BOTTOM);
  textSize(13);
  text('X increases →', gridX + gridW / 2, arrowY - 4);

  // Vertical arrow to the left of the grid
  const arrowX = gridX - 20;
  stroke('teal');
  strokeWeight(2);
  const arrowBottom = gridY + gridH;
  line(arrowX, gridY, arrowX, arrowBottom);
  line(arrowX, arrowBottom, arrowX - 5, arrowBottom - 9);
  line(arrowX, arrowBottom, arrowX + 5, arrowBottom - 9);
  strokeWeight(1);

  // The vertical label is rotated so it reads down the left edge.
  push();
  translate(arrowX - 6, gridY + gridH / 2);
  rotate(-HALF_PI);
  noStroke();
  fill('teal');
  textAlign(CENTER, BOTTOM);
  textSize(13);
  text('Y increases ↓', 0, 0);
  pop();

  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}

// The coral crosshair on the most recently clicked pixel.
function drawMarker(p) {
  const cellX = gridX + p.x * pxScale;
  const cellY = gridY + p.y * pxScale;
  const cellSide = max(pxScale, 5);

  noStroke();
  fill('coral');
  rect(cellX, cellY, cellSide, cellSide);

  stroke('coral');
  strokeWeight(1);
  const midX = cellX + cellSide / 2;
  const midY = cellY + cellSide / 2;
  line(gridX, midY, gridX + gridW, midY);
  line(midX, gridY, midX, gridY + gridH);
}

// The readout panel: which display, what was clicked, and what it means.
function drawPanel() {
  noStroke();
  fill(255, 255, 255, 230);
  stroke(200);
  rect(panelX, panelY, panelW, panelH, 10);

  const tx = panelX + 12;
  const tw = panelW - 24;
  let ty = panelY + 12;

  noStroke();
  textAlign(LEFT, TOP);

  fill('black');
  textSize(15);
  text('Display: ' + displayName, tx, ty);
  ty += 22;

  fill('dimgray');
  textSize(13);
  text(dispW + ' pixels across, ' + dispH + ' pixels down', tx, ty);
  ty += (isNarrow ? 24 : 34);

  if (clickedPixel) {
    fill('coral');
    textSize(isNarrow ? 17 : 19);
    text('You clicked: (' + clickedPixel.x + ', ' + clickedPixel.y + ')', tx, ty);
    ty += (isNarrow ? 24 : 30);

    fill('dimgray');
    textSize(13);
    text('x = ' + clickedPixel.x + ' pixels right of the origin, y = ' +
      clickedPixel.y + ' pixels down from it.', tx, ty, tw, 60);
  } else {
    fill('dimgray');
    textSize(14);
    text('Click anywhere on the grid to place a marker and read its ' +
      'coordinate.', tx, ty, tw, 70);
  }

  textSize(defaultTextSize);
}

function drawControlLabels() {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('Display:', 10, drawHeight + 20);
  textAlign(LEFT, TOP);
}
