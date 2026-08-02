// Pixel Drawing Sandbox MicroSim
// Chapter 6: Basic Drawing Primitives
// Bloom level: Apply (L3) - demonstrate, execute
// Interaction: direct manipulation. The learner draws on a simulated 128x64
// frame buffer and reads back the exact MicroPython call each mark produced.
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
// How many calls the history keeps. Only a few are visible at once; the rest
// are reached by scrolling the list.
const MAX_HISTORY = 200;

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
let toolSelect;
let clearButton;
let copyButton;
let copyLabelTimer = null;      // pending setTimeout that restores the label

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
// One entry per simulated pixel: 1 = on (white), 0 = off (black).
// Named gridCells because `pixels` is a reserved p5.js global.
let gridCells = new Uint8Array(BUF_W * BUF_H);

let currentTool = 'pixel';       // 'pixel' | 'hline' | 'vline'
let lastCall = '';               // the most recent generated method call
let callHistory = [];            // newest first, at most MAX_HISTORY entries

// Scrolling state for the history list. scrollOffset is the index of the entry
// drawn on the top visible line, so 0 always means "showing the newest call".
let scrollOffset = 0;
let historyBox = { x: 0, y: 0, w: 0, h: 0, visible: 5 };
let scrollThumb = { x: 0, y: 0, w: 0, h: 0, active: false };
let isScrollDragging = false;
let scrollGrabDy = 0;            // where inside the thumb the drag started

// Drag state for the two line tools
let isDragging = false;
let dragStartCol = 0;
let dragStartRow = 0;
let dragEndCol = 0;
let dragEndRow = 0;

// The canvas element itself, needed to place a wheel event on the canvas
let cnvEl = null;

// Grid geometry, recomputed every frame so the mouse handlers can use it
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
  cnvEl = cnv.elt;

  toolSelect = createSelect();
  toolSelect.parent(parentEl);
  toolSelect.option('Pixel', 'pixel');
  toolSelect.option('Horizontal Line', 'hline');
  toolSelect.option('Vertical Line', 'vline');
  toolSelect.selected('pixel');
  toolSelect.changed(onToolChanged);

  clearButton = createButton('Clear');
  clearButton.parent(parentEl);
  clearButton.mousePressed(clearBuffer);

  copyButton = createButton('Copy Code');
  copyButton.parent(parentEl);
  copyButton.mousePressed(copyCode);

  positionControls();

  describe(
    'A drawing sandbox for a simulated 128 by 64 monochrome OLED frame buffer. ' +
    'The learner picks the pixel, horizontal line, or vertical line tool, draws ' +
    'directly on the grid, and reads the exact MicroPython FrameBuf method call ' +
    'that each mark would require.'
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
  toolSelect.position(55, rowY);
  clearButton.position(215, rowY);
  copyButton.position(280, rowY);
}

// ---------------------------------------------------------------------------
// Tool actions
// ---------------------------------------------------------------------------
function onToolChanged() {
  currentTool = toolSelect.value();
  isDragging = false;
}

function clearBuffer() {
  gridCells = new Uint8Array(BUF_W * BUF_H);
  isDragging = false;
  logCall('fb.fill(BLACK)');
}

// Record a generated method call in the readout and the history list.
function logCall(callText) {
  lastCall = callText;
  callHistory.unshift(callText);
  if (callHistory.length > MAX_HISTORY) {
    callHistory.pop();
  }
  // Jump back to the top so the call just made is always the one in view.
  scrollOffset = 0;
}

// ---------------------------------------------------------------------------
// Copy Code
// ---------------------------------------------------------------------------

// The history is newest first, so reverse it to get the drawing order the
// student actually worked in. The result is a runnable MicroPython block.
function buildCodeText() {
  const lines = [
    '# Drawing commands from the Pixel Drawing Sandbox',
    'BLACK = 0',
    'WHITE = 1',
    ''
  ];
  for (let i = callHistory.length - 1; i >= 0; i--) {
    lines.push(callHistory[i]);
  }
  lines.push('fb.show()');
  return lines.join('\n');
}

function copyCode() {
  if (callHistory.length === 0) {
    flashCopyLabel('Nothing yet');
    return;
  }
  const codeText = buildCodeText();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(codeText).then(
      function () { flashCopyLabel('Copied!'); },
      function () { fallbackCopy(codeText); }
    );
  } else {
    fallbackCopy(codeText);
  }
}

// Older browsers, and pages not served over https, have no clipboard API.
function fallbackCopy(codeText) {
  const area = document.createElement('textarea');
  area.value = codeText;
  area.style.position = 'fixed';
  area.style.opacity = '0';
  document.body.appendChild(area);
  area.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch (err) {
    ok = false;
  }
  document.body.removeChild(area);
  flashCopyLabel(ok ? 'Copied!' : 'Copy failed');
}

// Briefly swap the button label to confirm what happened.
function flashCopyLabel(message) {
  copyButton.html(message);
  if (copyLabelTimer !== null) clearTimeout(copyLabelTimer);
  copyLabelTimer = setTimeout(function () {
    copyButton.html('Copy Code');
    copyLabelTimer = null;
  }, 1500);
}

// ---------------------------------------------------------------------------
// History scrolling
// ---------------------------------------------------------------------------

// The largest first-visible index, so the last entry can reach the bottom line.
function maxScrollOffset() {
  return max(0, callHistory.length - historyBox.visible);
}

function isOverHistory(px, py) {
  return px >= historyBox.x && px <= historyBox.x + historyBox.w &&
         py >= historyBox.y && py <= historyBox.y + historyBox.h;
}

// Wheel over the list scrolls it; returning false keeps the host page still.
// p5 does not refresh mouseX and mouseY on a wheel event, so read the pointer
// position straight off the event and convert it to canvas coordinates.
function mouseWheel(event) {
  let px = mouseX;
  let py = mouseY;
  if (cnvEl && event && typeof event.clientX === 'number') {
    const box = cnvEl.getBoundingClientRect();
    // Scale in case CSS ever displays the canvas at a different size.
    const scaleX = box.width ? canvasWidth / box.width : 1;
    const scaleY = box.height ? canvasHeight / box.height : 1;
    px = (event.clientX - box.left) * scaleX;
    py = (event.clientY - box.top) * scaleY;
  }
  if (!isOverHistory(px, py)) return true;
  const step = event.delta > 0 ? 1 : -1;
  scrollOffset = constrain(scrollOffset + step, 0, maxScrollOffset());
  return false;
}

// Map a thumb top position back to a first-visible index.
function scrollToThumbY(thumbTopY) {
  const trackY = historyBox.y + 5;
  const trackH = historyBox.h - 10;
  const travel = trackH - scrollThumb.h;
  if (travel <= 0) return 0;
  const frac = constrain((thumbTopY - trackY) / travel, 0, 1);
  return round(frac * maxScrollOffset());
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
  // The scrollbar sits outside the grid, so test it first and stop there.
  if (scrollThumb.active &&
      mouseX >= scrollThumb.x - 4 && mouseX <= scrollThumb.x + scrollThumb.w + 4 &&
      mouseY >= historyBox.y && mouseY <= historyBox.y + historyBox.h) {
    if (mouseY >= scrollThumb.y && mouseY <= scrollThumb.y + scrollThumb.h) {
      // Grabbed the thumb itself: remember where, so it does not jump.
      isScrollDragging = true;
      scrollGrabDy = mouseY - scrollThumb.y;
    } else {
      // Clicked the bare track: center the thumb on the click and drag on.
      isScrollDragging = true;
      scrollGrabDy = scrollThumb.h / 2;
      scrollOffset = scrollToThumbY(mouseY - scrollGrabDy);
    }
    return;
  }

  const cell = cellUnderMouse();
  if (!cell) return;

  if (currentTool === 'pixel') {
    // Toggle the single pixel and log the call that would produce it.
    const idx = cell.row * BUF_W + cell.col;
    const turningOn = gridCells[idx] === 0;
    gridCells[idx] = turningOn ? 1 : 0;
    logCall('fb.pixel(' + cell.col + ', ' + cell.row + ', ' +
            (turningOn ? 'WHITE' : 'BLACK') + ')');
  } else {
    // Both line tools start a drag that is committed on release.
    isDragging = true;
    dragStartCol = cell.col;
    dragStartRow = cell.row;
    dragEndCol = cell.col;
    dragEndRow = cell.row;
  }
}

function mouseDragged() {
  if (isScrollDragging) {
    scrollOffset = scrollToThumbY(mouseY - scrollGrabDy);
    return;
  }
  if (!isDragging) return;
  // Clamp to the grid so a drag that leaves the canvas still behaves.
  dragEndCol = constrain(floor((mouseX - gridX) / cellSize), 0, BUF_W - 1);
  dragEndRow = constrain(floor((mouseY - gridY) / cellSize), 0, BUF_H - 1);
}

function mouseReleased() {
  if (isScrollDragging) {
    isScrollDragging = false;
    return;
  }
  if (!isDragging) return;
  isDragging = false;

  if (currentTool === 'hline') {
    // fb.hline(x, y, width, color): one row, starting at the smaller column.
    const startCol = min(dragStartCol, dragEndCol);
    const runWidth = abs(dragEndCol - dragStartCol) + 1;
    for (let c = startCol; c < startCol + runWidth; c++) {
      gridCells[dragStartRow * BUF_W + c] = 1;
    }
    logCall('fb.hline(' + startCol + ', ' + dragStartRow + ', ' +
            runWidth + ', WHITE)');
  } else if (currentTool === 'vline') {
    // fb.vline(x, y, height, color): one column, starting at the smaller row.
    const startRow = min(dragStartRow, dragEndRow);
    const runHeight = abs(dragEndRow - dragStartRow) + 1;
    for (let r = startRow; r < startRow + runHeight; r++) {
      gridCells[r * BUF_W + dragStartCol] = 1;
    }
    logCall('fb.vline(' + dragStartCol + ', ' + startRow + ', ' +
            runHeight + ', WHITE)');
  }
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
  text('Pixel Drawing Sandbox', canvasWidth / 2, 6);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);

  if (narrow) {
    layoutNarrow();
  } else {
    layoutWide();
  }

  drawControlLabels();
}

// Wide screens: grid on the left, code readouts on the right.
function layoutWide() {
  const panelW = max(215, floor(canvasWidth * 0.30));
  const areaW = canvasWidth - panelW - 3 * margin;
  cellSize = constrain(floor(areaW / BUF_W), 2, 5);
  const gridW = cellSize * BUF_W;

  gridX = margin + floor((areaW - gridW) / 2);
  // Center the screen vertically in the space left over above the controls.
  const availH = drawHeight - 42 - 28;
  gridY = 42 + max(0, floor((availH - cellSize * BUF_H) / 2));
  drawGrid();

  const panelX = canvasWidth - panelW - margin;
  drawReadoutPanel(panelX, 42, panelW, drawHeight - margin, 13, 20, true);
}

// Narrow screens: grid on top, readouts stacked underneath. The pixel scale is
// pinned at 2 so the two readout boxes always fit above the control strip.
function layoutNarrow() {
  const areaW = canvasWidth - 2 * margin;
  cellSize = 2;
  const gridW = cellSize * BUF_W;

  gridX = margin + floor((areaW - gridW) / 2);
  gridY = 30;
  drawGrid();

  // No room for the extra hint line once everything is stacked.
  drawReadoutPanel(margin, gridY + cellSize * BUF_H + 32, areaW,
    drawHeight - margin, 12, 18, false);
}

// The simulated OLED screen plus the hover marker and any drag preview.
function drawGrid() {
  const gridW = cellSize * BUF_W;
  const gridH = cellSize * BUF_H;

  // The unlit screen
  stroke('silver');
  fill('black');
  rect(gridX - 2, gridY - 2, gridW + 4, gridH + 4, 4);

  // Lit pixels
  noStroke();
  fill('white');
  for (let idx = 0; idx < gridCells.length; idx++) {
    if (gridCells[idx] !== 1) continue;
    const col = idx % BUF_W;
    const row = floor(idx / BUF_W);
    rect(gridX + col * cellSize, gridY + row * cellSize, cellSize, cellSize);
  }

  // Faint pixel grid, only when the cells are large enough to see it
  if (cellSize >= 4) {
    stroke(60);
    strokeWeight(1);
    for (let col = 0; col <= BUF_W; col += 8) {
      line(gridX + col * cellSize, gridY, gridX + col * cellSize, gridY + gridH);
    }
    for (let row = 0; row <= BUF_H; row += 8) {
      line(gridX, gridY + row * cellSize, gridX + gridW, gridY + row * cellSize);
    }
    strokeWeight(1);
  }

  // Live preview of the line being dragged
  if (isDragging) {
    noStroke();
    fill(255, 112, 67, 200);          // coral
    if (currentTool === 'hline') {
      const startCol = min(dragStartCol, dragEndCol);
      const runWidth = abs(dragEndCol - dragStartCol) + 1;
      rect(gridX + startCol * cellSize, gridY + dragStartRow * cellSize,
        runWidth * cellSize, cellSize);
    } else if (currentTool === 'vline') {
      const startRow = min(dragStartRow, dragEndRow);
      const runHeight = abs(dragEndRow - dragStartRow) + 1;
      rect(gridX + dragStartCol * cellSize, gridY + startRow * cellSize,
        cellSize, runHeight * cellSize);
    }
  }

  // Hover marker so a small cell is still easy to aim at
  const cell = cellUnderMouse();
  if (cell && !isDragging) {
    noFill();
    stroke('coral');
    strokeWeight(2);
    rect(gridX + cell.col * cellSize - 1, gridY + cell.row * cellSize - 1,
      cellSize + 2, cellSize + 2);
    strokeWeight(1);
  }

  // Coordinate readout under the screen
  noStroke();
  fill('dimgray');
  textSize(13);
  textAlign(LEFT, TOP);
  const coordText = cell
    ? 'Cursor at x = ' + cell.col + ', y = ' + cell.row
    : 'Move the mouse over the screen to see pixel coordinates';
  text(coordText, gridX, gridY + gridH + 8);
  textSize(defaultTextSize);
}

// The live code readout and the scrolling list of generated calls. The list
// grows to fill the space between its header and `bottom`.
function drawReadoutPanel(x, y, w, bottom, fontSize, lineH, showHint) {
  noStroke();
  fill('black');
  textSize(14);
  textAlign(LEFT, TOP);
  text('Last method call:', x, y);

  // Highlighted box holding the most recent generated call
  fill('white');
  stroke('silver');
  rect(x, y + 20, w, 34, 6);
  noStroke();
  textFont('monospace');
  textSize(fontSize);
  if (lastCall.length === 0) {
    fill('gray');
    text('(draw something)', x + 8, y + 30);
  } else {
    fill('darkgreen');
    text(lastCall, x + 8, y + 30);
  }
  textFont('sans-serif');

  // Scrolling history, newest at the top. Snap the box height to a whole
  // number of lines so no entry is ever clipped in half.
  const listY = y + 84;
  const hintH = showHint ? 46 : 0;
  const visible = max(3, floor((bottom - hintH - listY - 10) / lineH));
  const listH = visible * lineH + 10;
  historyBox = { x: x, y: listY, w: w, h: listH, visible: visible };
  scrollOffset = constrain(scrollOffset, 0, maxScrollOffset());

  fill('black');
  textSize(14);
  const heading = callHistory.length > visible
    ? 'Recent calls (scroll for more):'
    : 'Recent calls (newest first):';
  text(heading, x, y + 64);

  fill('white');
  stroke('silver');
  rect(x, listY, w, listH, 6);
  noStroke();
  textFont('monospace');
  textSize(fontSize - 1);
  for (let i = 0; i < visible; i++) {
    const entryY = listY + 6 + i * lineH;
    const idx = scrollOffset + i;
    if (idx < callHistory.length) {
      fill(idx === 0 ? 'black' : 'dimgray');
      text(callHistory[idx], x + 8, entryY);
    } else {
      fill('silver');
      text('-', x + 8, entryY);
    }
  }
  textFont('sans-serif');
  textSize(defaultTextSize);

  drawHistoryScrollbar();

  // A short reminder of what the two color constants mean
  if (showHint) {
    fill('dimgray');
    textSize(12);
    text('WHITE turns a pixel on, BLACK turns it off. Pick a tool below, then ' +
         'click or drag on the screen.',
      x, listY + listH + 8, w, 60);
  }
  textSize(defaultTextSize);
}

// A slim scrollbar down the right edge of the history box, drawn only when
// there are more calls than visible lines.
function drawHistoryScrollbar() {
  if (callHistory.length <= historyBox.visible) {
    scrollThumb.active = false;
    return;
  }

  const trackW = 7;
  const trackX = historyBox.x + historyBox.w - trackW - 5;
  const trackY = historyBox.y + 5;
  const trackH = historyBox.h - 10;

  noStroke();
  fill(235);
  rect(trackX, trackY, trackW, trackH, 3);

  const thumbH = max(20, trackH * historyBox.visible / callHistory.length);
  const travel = trackH - thumbH;
  const frac = maxScrollOffset() === 0 ? 0 : scrollOffset / maxScrollOffset();
  const thumbY = trackY + travel * frac;

  fill(isScrollDragging ? 'coral' : 150);
  rect(trackX, thumbY, trackW, thumbH, 3);

  scrollThumb = { x: trackX, y: thumbY, w: trackW, h: thumbH, active: true };
}

// Labels drawn inside the white control region.
function drawControlLabels() {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('Tool:', 10, drawHeight + 22);

  // The hint only fits once the control strip is wide enough for it, which now
  // means clearing the Copy Code button as well.
  if (canvasWidth < 700) {
    textAlign(LEFT, TOP);
    return;
  }
  fill('dimgray');
  textSize(13);
  const hint = currentTool === 'pixel'
    ? 'Click one square to toggle a single pixel.'
    : (currentTool === 'hline'
      ? 'Drag left or right to set the run length.'
      : 'Drag up or down to set the run length.');
  text(hint, 375, drawHeight + 23);
  textSize(defaultTextSize);
  textAlign(LEFT, TOP);
}
