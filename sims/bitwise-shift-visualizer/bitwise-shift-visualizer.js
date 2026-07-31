// Bitwise Operator and Shift Visualizer MicroSim
// Chapter 4: MicroPython Fundamentals II - Functions & the FrameBuf Module
// Bloom level: Apply (L3) - calculate, demonstrate
// Interaction: direct manipulation. Every bit toggle, operator change, and
// shift-amount change recalculates the result row immediately.
//
// CANVAS_HEIGHT: 470

// ---------------------------------------------------------------------------
// Layout constants (standard MicroSim pattern)
// ---------------------------------------------------------------------------
let canvasWidth = 800;
let drawHeight = 390;
let controlHeight = 80;          // two rows of controls
let canvasHeight = drawHeight + controlHeight;
let margin = 12;
let sliderLeftMargin = 170;
let defaultTextSize = 16;

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
let operatorSelect;
let shiftSlider;
let resetButton;

// ---------------------------------------------------------------------------
// Model state
// Bit arrays are stored most-significant-bit first, so index 0 draws on the
// left and holds bit 7. That matches how a binary literal like 0b00000101 reads.
// ---------------------------------------------------------------------------
let bitsA = [0, 0, 0, 0, 0, 1, 0, 1];   // 0b00000101 = 5
let bitsB = [0, 0, 0, 0, 0, 0, 1, 1];   // 0b00000011 = 3
let operatorName = 'AND';
let shiftAmount = 1;

// Slide animation state for the shift operators
let slideProgress = 1;           // 1 means the animation has finished
const SLIDE_SPEED = 0.05;

// Computed layout values, refreshed every frame
let bitSize = 40;
let bitGap = 6;
let gridX = 0;
let gridW = 0;
let yBitIndex = 60;
let yRowA = 76;
let yRowB = 154;
let yRowResult = 244;
let yExpression = 302;
let yHint = 330;

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
function setup() {
  updateCanvasSize();
  const cnv = createCanvas(canvasWidth, canvasHeight);
  cnv.parent(document.querySelector('main'));

  const parentEl = document.querySelector('main');

  operatorSelect = createSelect();
  operatorSelect.parent(parentEl);
  operatorSelect.option('AND  (&)', 'AND');
  operatorSelect.option('OR  (|)', 'OR');
  operatorSelect.option('XOR  (^)', 'XOR');
  operatorSelect.option('Left Shift  (<<)', 'LSHIFT');
  operatorSelect.option('Right Shift  (>>)', 'RSHIFT');
  operatorSelect.selected('AND');
  operatorSelect.changed(onOperatorChanged);

  shiftSlider = createSlider(0, 7, 1, 1);
  shiftSlider.parent(parentEl);
  shiftSlider.input(onShiftChanged);

  resetButton = createButton('Reset');
  resetButton.parent(parentEl);
  resetButton.size(80);
  resetButton.mousePressed(resetAll);

  positionControls();
  updateShiftVisibility();

  describe(
    'An eight-bit calculator. Two rows of clickable bit squares set operand A ' +
    'and operand B. Choosing AND, OR, XOR, left shift, or right shift ' +
    'immediately recalculates the eight result bits and their decimal value.'
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
  if (typeof shiftSlider !== 'undefined' && shiftSlider) {
    shiftSlider.size(max(80, canvasWidth - sliderLeftMargin - margin));
  }
}

function windowResized() {
  updateCanvasSize();
  resizeCanvas(canvasWidth, canvasHeight);
  positionControls();
}

function positionControls() {
  const row1Y = drawHeight + 8;
  const row2Y = drawHeight + 43;
  operatorSelect.position(90, row1Y);
  resetButton.position(canvasWidth - 80 - margin, row1Y);
  shiftSlider.position(sliderLeftMargin, row2Y);
  shiftSlider.size(max(80, canvasWidth - sliderLeftMargin - margin));
}

// ---------------------------------------------------------------------------
// Control callbacks
// ---------------------------------------------------------------------------
function onOperatorChanged() {
  operatorName = operatorSelect.value();
  updateShiftVisibility();
  if (isShiftOperator()) {
    slideProgress = 0;   // restart the slide animation
  }
}

function onShiftChanged() {
  shiftAmount = shiftSlider.value();
  slideProgress = 0;
}

function resetAll() {
  bitsA = [0, 0, 0, 0, 0, 1, 0, 1];
  bitsB = [0, 0, 0, 0, 0, 0, 1, 1];
  operatorName = 'AND';
  operatorSelect.selected('AND');
  shiftAmount = 1;
  shiftSlider.value(1);
  slideProgress = 1;
  updateShiftVisibility();
}

function isShiftOperator() {
  return operatorName === 'LSHIFT' || operatorName === 'RSHIFT';
}

// The shift stepper only makes sense for the two shift operators.
function updateShiftVisibility() {
  if (isShiftOperator()) {
    shiftSlider.show();
  } else {
    shiftSlider.hide();
  }
}

// ---------------------------------------------------------------------------
// Bit math
// ---------------------------------------------------------------------------
function bitsToValue(arr) {
  let v = 0;
  for (let idx = 0; idx < 8; idx++) {
    v = (v << 1) | arr[idx];
  }
  return v;
}

function valueToBits(v) {
  const arr = [];
  for (let idx = 7; idx >= 0; idx--) {
    arr.push((v >> idx) & 1);
  }
  return arr;
}

// Results are masked to 8 bits so the display matches an 8-bit MicroPython
// value such as one byte of a frame buffer.
function computeResultValue() {
  const a = bitsToValue(bitsA);
  const b = bitsToValue(bitsB);
  if (operatorName === 'AND') return (a & b) & 0xFF;
  if (operatorName === 'OR') return (a | b) & 0xFF;
  if (operatorName === 'XOR') return (a ^ b) & 0xFF;
  if (operatorName === 'LSHIFT') return (a << shiftAmount) & 0xFF;
  return (a >> shiftAmount) & 0xFF;
}

function operatorSymbol() {
  if (operatorName === 'AND') return '&';
  if (operatorName === 'OR') return '|';
  if (operatorName === 'XOR') return '^';
  if (operatorName === 'LSHIFT') return '<<';
  return '>>';
}

function binaryLiteral(v) {
  let s = '';
  for (let idx = 7; idx >= 0; idx--) {
    s += ((v >> idx) & 1);
  }
  return '0b' + s;
}

// ---------------------------------------------------------------------------
// Layout helpers
// ---------------------------------------------------------------------------
function computeLayout() {
  // Bit squares shrink on narrow screens but stay large enough to tap.
  const avail = canvasWidth - 2 * margin - 20;
  bitGap = 6;
  bitSize = constrain(floor((avail - 7 * bitGap) / 8), 22, 46);
  gridW = 8 * bitSize + 7 * bitGap;
  gridX = (canvasWidth - gridW) / 2;

  yBitIndex = 58;
  yRowA = 74;
  yRowB = yRowA + bitSize + 30;
  yRowResult = yRowB + bitSize + 52;
  yExpression = yRowResult + bitSize + 10;
  yHint = yExpression + 24;
}

function columnX(col) {
  return gridX + col * (bitSize + bitGap);
}

// Which column, if any, is the mouse over? Returns -1 when it is outside.
function hoveredColumn() {
  if (mouseX < gridX || mouseX > gridX + gridW) return -1;
  if (mouseY < yRowA || mouseY > yRowResult + bitSize) return -1;
  const col = floor((mouseX - gridX) / (bitSize + bitGap));
  return (col >= 0 && col <= 7) ? col : -1;
}

// ---------------------------------------------------------------------------
// Interaction: clicking a bit square flips it
// ---------------------------------------------------------------------------
function mousePressed() {
  computeLayout();
  for (let col = 0; col < 8; col++) {
    const x = columnX(col);
    if (mouseX >= x && mouseX <= x + bitSize) {
      if (mouseY >= yRowA && mouseY <= yRowA + bitSize) {
        bitsA[col] = bitsA[col] ? 0 : 1;
        if (isShiftOperator()) slideProgress = 0;
        return;
      }
      if (!isShiftOperator() && mouseY >= yRowB && mouseY <= yRowB + bitSize) {
        bitsB[col] = bitsB[col] ? 0 : 1;
        return;
      }
    }
  }
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

  const valueA = bitsToValue(bitsA);
  const valueB = bitsToValue(bitsB);
  const resultValue = computeResultValue();
  const resultBits = valueToBits(resultValue);

  // Title
  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(canvasWidth < 500 ? 18 : 22);
  text('Bitwise Operator and Shift Visualizer', canvasWidth / 2, 6);

  const hoverCol = isShiftOperator() ? -1 : hoveredColumn();

  drawColumnHighlight(hoverCol);
  drawBitIndexRow();

  // Operand A. Its label sits above the shared bit-number row.
  drawRowLabel('Operand A', valueA, 36, 'teal');
  drawBitRow(bitsA, yRowA, 'teal', true);

  if (isShiftOperator()) {
    drawShiftBand();
  } else {
    drawRowLabel('Operand B', valueB, yRowB - 20, 'coral');
    drawBitRow(bitsB, yRowB, 'coral', true);
    drawOperatorBar();
  }

  // Result
  drawRowLabel('Result', resultValue, yRowResult - 20, 'mediumpurple');
  drawBitRow(resultBits, yRowResult, 'mediumpurple', false);

  drawExpressionLine(valueA, valueB, resultValue);
  drawHintLine(hoverCol, resultBits);
  drawControlLabels();
}

// A soft vertical band behind one column, tying the two inputs to the output.
function drawColumnHighlight(col) {
  if (col < 0) return;
  noStroke();
  fill(255, 235, 140, 170);
  rect(columnX(col) - 3, yBitIndex - 4, bitSize + 6,
    yRowResult + bitSize - yBitIndex + 10, 6);
}

// Small gray bit numbers, 7 on the left down to 0 on the right.
function drawBitIndexRow() {
  noStroke();
  fill('dimgray');
  textAlign(CENTER, TOP);
  textSize(13);
  for (let col = 0; col < 8; col++) {
    text('bit ' + (7 - col), columnX(col) + bitSize / 2, yBitIndex);
  }
  textSize(defaultTextSize);
}

// One labelled row header, e.g. "Operand A = 5".
function drawRowLabel(labelText, value, y, colorName) {
  noStroke();
  fill(colorName);
  textAlign(LEFT, TOP);
  textSize(16);
  text(labelText + '  =  ' + value + ' (decimal)', max(margin, gridX), y);
  textSize(defaultTextSize);
}

// Eight bit squares. Filled squares are 1, outlined squares are 0.
function drawBitRow(arr, y, colorName, clickable) {
  textAlign(CENTER, CENTER);
  for (let col = 0; col < 8; col++) {
    const x = columnX(col);
    stroke(colorName);
    strokeWeight(2);
    fill(arr[col] ? colorName : 'white');
    rect(x, y, bitSize, bitSize, 5);
    noStroke();
    strokeWeight(1);
    fill(arr[col] ? 'white' : colorName);
    textSize(bitSize > 32 ? 20 : 16);
    text(arr[col], x + bitSize / 2, y + bitSize / 2 + 1);
  }
  strokeWeight(1);
  textSize(defaultTextSize);
  textAlign(LEFT, TOP);

  // A quiet reminder that these squares respond to clicks
  if (clickable) {
    noStroke();
    fill('gray');
    textSize(12);
    textAlign(RIGHT, TOP);
    text('click to flip', gridX + gridW, y + bitSize + 2);
    textAlign(LEFT, TOP);
    textSize(defaultTextSize);
  }
}

// The operator symbol drawn between the operand rows and the result row.
function drawOperatorBar() {
  noStroke();
  fill('black');
  textAlign(CENTER, CENTER);
  textSize(24);
  text(operatorSymbol(), canvasWidth / 2, yRowB + bitSize + 20);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}

// For << and >>: bits slide sideways into their new columns and zeros fill in.
function drawShiftBand() {
  const y = yRowB;
  const direction = (operatorName === 'LSHIFT') ? -1 : 1;   // -1 slides left
  const delta = direction * shiftAmount;

  // Advance the animation until it settles
  if (slideProgress < 1) {
    slideProgress = min(1, slideProgress + SLIDE_SPEED);
  }

  noStroke();
  fill('dimgray');
  textAlign(CENTER, TOP);
  textSize(13);
  const word = (operatorName === 'LSHIFT') ? 'left' : 'right';
  text('Each bit slides ' + word + ' by ' + shiftAmount + '. Zeros fill the empty side.',
    canvasWidth / 2, y - 19);
  textSize(defaultTextSize);

  // The sliding copies of operand A
  textAlign(CENTER, CENTER);
  for (let col = 0; col < 8; col++) {
    const destCol = col + delta;
    const x = lerp(columnX(col), columnX(destCol), slideProgress);
    const fallsOff = (destCol < 0 || destCol > 7);
    // Bits leaving the byte fade away as they slide
    const alpha = fallsOff ? 255 * (1 - slideProgress) : 255;
    push();
    drawingContext.globalAlpha = alpha / 255;
    stroke('teal');
    strokeWeight(2);
    fill(bitsA[col] ? 'teal' : 'white');
    rect(x, y, bitSize, bitSize, 5);
    noStroke();
    fill(bitsA[col] ? 'white' : 'teal');
    textSize(bitSize > 32 ? 20 : 16);
    text(bitsA[col], x + bitSize / 2, y + bitSize / 2 + 1);
    pop();
  }

  // The brand new zero bits arriving on the vacated side
  for (let col = 0; col < 8; col++) {
    const sourceCol = col - delta;
    if (sourceCol >= 0 && sourceCol <= 7) continue;   // this column was filled by a slide
    push();
    drawingContext.globalAlpha = slideProgress;
    stroke('gray');
    strokeWeight(2);
    fill('white');
    rect(columnX(col), y, bitSize, bitSize, 5);
    noStroke();
    fill('gray');
    textSize(bitSize > 32 ? 20 : 16);
    text('0', columnX(col) + bitSize / 2, y + bitSize / 2 + 1);
    pop();
  }
  strokeWeight(1);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}

// The whole calculation written the way you would type it in MicroPython.
function drawExpressionLine(valueA, valueB, resultValue) {
  const rightSide = isShiftOperator() ? String(shiftAmount) : binaryLiteral(valueB);
  const plainRight = isShiftOperator() ? String(shiftAmount) : String(valueB);
  const expr = binaryLiteral(valueA) + ' ' + operatorSymbol() + ' ' + rightSide +
    '  =  ' + binaryLiteral(resultValue);
  const plain = valueA + ' ' + operatorSymbol() + ' ' + plainRight + ' = ' + resultValue;

  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textFont('monospace');
  textSize(canvasWidth < 500 ? 13 : 16);
  text(expr, canvasWidth / 2, yExpression);
  textFont('sans-serif');
  textSize(14);
  fill('dimgray');
  text('in decimal:  ' + plain, canvasWidth / 2, yExpression + 22);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}

// Either a per-column explanation on hover, or a prompt to hover.
// Text boxes take the box's top-left corner as x, so the box starts at the
// margin and textAlign(CENTER) centers the words inside it.
function drawHintLine(hoverCol, resultBits) {
  noStroke();
  textAlign(CENTER, TOP);
  textSize(14);
  const boxX = margin;
  const boxW = canvasWidth - 2 * margin;
  if (isShiftOperator()) {
    fill('dimgray');
    text('Click any Operand A bit, then drag the Shift amount slider to watch the bits move.',
      boxX, yHint + 20, boxW, 36);
  } else if (hoverCol >= 0) {
    fill('black');
    text('Column bit ' + (7 - hoverCol) + ':   ' + bitsA[hoverCol] + ' ' +
      operatorSymbol() + ' ' + bitsB[hoverCol] + ' = ' + resultBits[hoverCol],
      boxX, yHint + 20, boxW, 36);
  } else {
    fill('dimgray');
    text('Hover over a column to see how its two input bits make one result bit.',
      boxX, yHint + 20, boxW, 36);
  }
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}

// Labels drawn inside the white control region.
function drawControlLabels() {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('Operator:', 10, drawHeight + 18);

  if (isShiftOperator()) {
    text('Shift amount: ' + shiftAmount, 10, drawHeight + 53);
  } else {
    fill('dimgray');
    textSize(14);
    text('Shift amount applies to << and >> only', 10, drawHeight + 53);
    textSize(defaultTextSize);
  }
  textAlign(LEFT, TOP);
}
