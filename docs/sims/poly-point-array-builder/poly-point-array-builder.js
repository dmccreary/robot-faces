// Poly Point Array Builder MicroSim
// Chapter 7: Ellipse & Polygon Drawing
// Bloom level: Create (L6) - construct, design
// Interaction: a direct point-placement builder. Every click is a design
// decision that appears immediately in the shape and in the generated code.
//
// CANVAS_HEIGHT: 450

// ---------------------------------------------------------------------------
// Layout constants (standard MicroSim pattern)
// ---------------------------------------------------------------------------
let canvasWidth = 800;
let drawHeight = 400;
let controlHeight = 50;          // one row of controls
let canvasHeight = drawHeight + controlHeight;
let margin = 12;
let defaultTextSize = 16;

// The simulated OLED frame buffer is 128 pixels wide by 64 pixels tall.
const BUF_W = 128;
const BUF_H = 64;
const MAX_VERTICES = 10;

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
let undoButton;
let clearButton;
let filledCheckbox;

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
// Vertices in buffer coordinates, in the order the learner placed them.
let polyPoints = [];
let isFilled = false;

// Grid geometry, recomputed every frame so the mouse handler can use it
let gridX = 0;
let gridY = 0;
let cellSize = 3;

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
function setup() {
  updateCanvasSize();
  const cnv = createCanvas(canvasWidth, canvasHeight);
  const parentEl = document.querySelector('main');
  cnv.parent(parentEl);

  undoButton = createButton('Undo Last Point');
  undoButton.parent(parentEl);
  undoButton.mousePressed(undoLastPoint);

  clearButton = createButton('Clear');
  clearButton.parent(parentEl);
  clearButton.mousePressed(clearPoints);

  filledCheckbox = createCheckbox('Filled', false);
  filledCheckbox.parent(parentEl);
  filledCheckbox.changed(onFillChanged);

  positionControls();
  updateButtonStates();

  describe(
    'A polygon builder on a simulated 128 by 64 OLED screen. The learner clicks ' +
    'to place up to ten numbered vertices, and the MicroSim shows the connecting ' +
    'lines, the dashed closing segment, the matching MicroPython point array, ' +
    'and the fb.poly() call that would draw the shape.'
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
  const rowY = drawHeight + 10;
  undoButton.position(10, rowY);
  clearButton.position(140, rowY);
  filledCheckbox.position(215, rowY + 3);
}

// ---------------------------------------------------------------------------
// Point editing
// ---------------------------------------------------------------------------
function undoLastPoint() {
  polyPoints.pop();
  updateButtonStates();
}

function clearPoints() {
  polyPoints = [];
  updateButtonStates();
}

function onFillChanged() {
  isFilled = filledCheckbox.checked();
}

function setEnabled(btn, enabled) {
  if (enabled) {
    btn.removeAttribute('disabled');
  } else {
    btn.attribute('disabled', '');
  }
}

function updateButtonStates() {
  setEnabled(undoButton, polyPoints.length > 0);
  setEnabled(clearButton, polyPoints.length > 0);
}

// ---------------------------------------------------------------------------
// Mouse handling
// ---------------------------------------------------------------------------

// Convert a canvas position to a buffer column and row, or null if off-grid.
function cellUnderMouse() {
  const col = floor((mouseX - gridX) / cellSize);
  const row = floor((mouseY - gridY) / cellSize);
  if (col < 0 || col >= BUF_W || row < 0 || row >= BUF_H) return null;
  return { col: col, row: row };
}

function mousePressed() {
  const cell = cellUnderMouse();
  if (!cell) return;
  if (polyPoints.length >= MAX_VERTICES) return;
  polyPoints.push([cell.col, cell.row]);
  updateButtonStates();
}

// ---------------------------------------------------------------------------
// Code generation
// ---------------------------------------------------------------------------

// The MicroPython point array. framebuf.poly() reads the buffer as 16-bit
// signed values, so the typecode must be 'h'.
function pointArrayText() {
  if (polyPoints.length === 0) {
    return "my_points = array('h', [])";
  }
  const nums = [];
  for (let i = 0; i < polyPoints.length; i++) {
    nums.push(polyPoints[i][0], polyPoints[i][1]);
  }
  return "my_points = array('h', [" + nums.join(', ') + '])';
}

// The matching draw call.
function polyCallText() {
  return 'fb.poly(0, 0, my_points, WHITE, ' + (isFilled ? 'True' : 'False') + ')';
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------
function draw() {
  updateCanvasSize();

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
  text('Poly Point Array Builder', canvasWidth / 2, 6);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);

  if (narrow) {
    // The pixel scale is pinned at 2 so both readout boxes fit above the
    // control strip once everything is stacked in one column.
    const areaW = canvasWidth - 2 * margin;
    cellSize = 2;
    gridX = margin + floor((areaW - cellSize * BUF_W) / 2);
    gridY = 32;
    drawGrid();
    drawCodePanel(margin, gridY + cellSize * BUF_H + 32, areaW, 11, true);
  } else {
    const panelW = max(250, floor(canvasWidth * 0.36));
    const areaW = canvasWidth - panelW - 3 * margin;
    cellSize = constrain(floor(areaW / BUF_W), 2, 5);
    gridX = margin + floor((areaW - cellSize * BUF_W) / 2);
    // Center the screen vertically in the space left over above the controls.
    const availH = drawHeight - 44 - 28;
    gridY = 44 + max(0, floor((availH - cellSize * BUF_H) / 2));
    drawGrid();
    drawCodePanel(canvasWidth - panelW - margin, 42, panelW, 12, false);
  }

  drawControlLabels();
}

// The simulated OLED screen with the polygon under construction.
function drawGrid() {
  const gridW = cellSize * BUF_W;
  const gridH = cellSize * BUF_H;

  // The unlit screen
  stroke('silver');
  fill('black');
  rect(gridX - 2, gridY - 2, gridW + 4, gridH + 4, 4);

  // Faint guide grid every 8 buffer pixels
  stroke(45);
  strokeWeight(1);
  for (let col = 8; col < BUF_W; col += 8) {
    line(gridX + col * cellSize, gridY, gridX + col * cellSize, gridY + gridH);
  }
  for (let row = 8; row < BUF_H; row += 8) {
    line(gridX, gridY + row * cellSize, gridX + gridW, gridY + row * cellSize);
  }
  strokeWeight(1);

  // Convert buffer coordinates to canvas coordinates, centered in the cell
  const screenPts = polyPoints.map(function (p) {
    return [gridX + (p[0] + 0.5) * cellSize, gridY + (p[1] + 0.5) * cellSize];
  });

  // The shape itself: filled or outlined, exactly like the fill flag on poly()
  if (screenPts.length >= 2) {
    if (isFilled && screenPts.length >= 3) {
      noStroke();
      fill('white');
      beginShape();
      for (let i = 0; i < screenPts.length; i++) {
        vertex(screenPts[i][0], screenPts[i][1]);
      }
      endShape(CLOSE);
    } else {
      // Solid segments in the order the points were placed
      stroke('white');
      strokeWeight(2);
      noFill();
      for (let i = 0; i < screenPts.length - 1; i++) {
        line(screenPts[i][0], screenPts[i][1],
          screenPts[i + 1][0], screenPts[i + 1][1]);
      }
      strokeWeight(1);
    }

    // The dashed closing segment back to vertex 0 is always shown, because
    // poly() closes the path for you whether or not you repeat the first point.
    if (screenPts.length >= 3 && !isFilled) {
      stroke('gold');
      strokeWeight(1);
      drawingContext.setLineDash([5, 4]);
      const last = screenPts[screenPts.length - 1];
      line(last[0], last[1], screenPts[0][0], screenPts[0][1]);
      drawingContext.setLineDash([]);
    }
  }

  // Numbered vertex dots, in click order
  for (let i = 0; i < screenPts.length; i++) {
    noStroke();
    fill(i === 0 ? 'coral' : 'deepskyblue');
    circle(screenPts[i][0], screenPts[i][1], 9);
    // Outline the number so it stays readable over both the black screen and
    // the white fill.
    textSize(11);
    textAlign(CENTER, CENTER);
    stroke('black');
    strokeWeight(3);
    fill('white');
    text(i, screenPts[i][0] + 11, screenPts[i][1] - 9);
    noStroke();
    strokeWeight(1);
    fill('white');
    text(i, screenPts[i][0] + 11, screenPts[i][1] - 9);
    textAlign(LEFT, TOP);
    textSize(defaultTextSize);
  }

  // Hover marker so a small cell is still easy to aim at
  const cell = cellUnderMouse();
  if (cell && polyPoints.length < MAX_VERTICES) {
    noFill();
    stroke('coral');
    strokeWeight(2);
    rect(gridX + cell.col * cellSize - 2, gridY + cell.row * cellSize - 2,
      cellSize + 4, cellSize + 4);
    strokeWeight(1);
  }

  // Coordinate readout under the screen
  noStroke();
  fill('dimgray');
  textSize(13);
  textAlign(LEFT, TOP);
  let coordText;
  if (polyPoints.length >= MAX_VERTICES) {
    coordText = 'Maximum of ' + MAX_VERTICES +
                ' vertices placed. Undo a point to keep designing.';
  } else if (cell) {
    coordText = 'Click to place vertex ' + polyPoints.length +
                ' at x = ' + cell.col + ', y = ' + cell.row;
  } else {
    coordText = 'Move onto the screen and click to place a vertex.';
  }
  text(coordText, gridX, gridY + gridH + 8);
  textSize(defaultTextSize);
}

// The live point-array and fb.poly() readouts.
function drawCodePanel(x, y, w, fontSize, compact) {
  const arrayBoxH = compact ? 58 : 82;

  noStroke();
  fill('black');
  textSize(14);
  textAlign(LEFT, TOP);
  text('Point array:', x, y);

  fill('white');
  stroke('silver');
  rect(x, y + 20, w, arrayBoxH, 6);
  noStroke();
  textFont('monospace');
  textSize(fontSize);
  fill(polyPoints.length === 0 ? 'gray' : 'black');
  text(pointArrayText(), x + 8, y + 27, w - 16, arrayBoxH - 12);
  textFont('sans-serif');

  const callY = y + 28 + arrayBoxH;
  fill('black');
  textSize(14);
  text('Draw call:', x, callY);

  fill('white');
  stroke('silver');
  rect(x, callY + 20, w, 36, 6);
  noStroke();
  textFont('monospace');
  textSize(fontSize);
  fill('darkgreen');
  text(polyCallText(), x + 8, callY + 27, w - 16, 30);
  textFont('sans-serif');

  const countY = callY + 66;
  fill('black');
  textSize(14);
  text('Vertices placed: ' + polyPoints.length + ' of ' + MAX_VERTICES,
    x, countY);

  if (!compact) {
    fill('dimgray');
    textSize(12);
    text("The typecode 'h' stores each coordinate as a 16-bit whole number, " +
         'which is the format fb.poly() reads. The first two numbers are ' +
         "vertex 0's x and y, the next two are vertex 1, and so on.",
      x, countY + 24, w, drawHeight - (countY + 24) - 10);
  }
  textSize(defaultTextSize);
}

// Labels drawn inside the white control region.
function drawControlLabels() {
  // The hint only fits once the control strip is wide enough for it.
  if (canvasWidth < 620) return;
  noStroke();
  fill('dimgray');
  textAlign(LEFT, CENTER);
  textSize(13);
  const hint = isFilled
    ? 'Filled is on, so poly() gets True as its last argument.'
    : 'Filled is off, so poly() draws the outline only.';
  text(hint, 300, drawHeight + 23);
  textSize(defaultTextSize);
  textAlign(LEFT, TOP);
}
