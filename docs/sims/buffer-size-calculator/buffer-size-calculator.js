// Frame Buffer Size Calculator MicroSim
// Chapter 5: Display & Coordinate Systems
// Bloom level: Apply (L3) - calculate, demonstrate
// Interaction: live calculator. Every slider move, bit-depth change, and preset
// click re-evaluates the byte formula and redraws the RAM comparison bar.
//
// CANVAS_HEIGHT: 490

// ---------------------------------------------------------------------------
// Layout constants (standard MicroSim pattern)
// ---------------------------------------------------------------------------
let canvasWidth = 800;
let drawHeight = 340;
let controlHeight = 150;          // four rows of controls
let canvasHeight = drawHeight + controlHeight;
let margin = 20;
let sliderLeftMargin = 175;
let defaultTextSize = 16;

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
let bitDepthSelect;
let oledPresetButton;
let lcdPresetButton;
let resetButton;
let widthSlider;
let heightSlider;

// ---------------------------------------------------------------------------
// Model state
// bufWidth and bufHeight are named to avoid the p5.js globals width and height.
// ---------------------------------------------------------------------------
let bufWidth = 128;               // pixels across
let bufHeight = 64;               // pixels down
let bitDepth = 1;                 // bits per pixel: 1 (mono) or 16 (RGB565)

// The RP2040 microcontroller on a Raspberry Pi Pico has 264 KB of RAM.
const RP2040_RAM_KB = 264;
const RP2040_RAM_BYTES = RP2040_RAM_KB * 1024;

// A buffer above this share of RAM is drawn in coral instead of teal.
// The largest buffer this MicroSim can build (240 x 240 at 16 bits) reaches
// about 43% of RAM, so the alert threshold sits below that.
const ALERT_FRACTION = 0.40;

// Preset animation state. Clicking a preset walks the sliders to the target
// values a step at a time so the change is visible.
let targetWidth = null;
let targetHeight = null;
const ANIM_STEP = 16;             // two slider steps per frame

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
function setup() {
  updateCanvasSize();
  const cnv = createCanvas(canvasWidth, canvasHeight);
  cnv.parent(document.querySelector('main'));

  const parentEl = document.querySelector('main');

  bitDepthSelect = createSelect();
  bitDepthSelect.parent(parentEl);
  bitDepthSelect.option('1-bit monochrome', '1');
  bitDepthSelect.option('16-bit color (RGB565)', '16');
  bitDepthSelect.selected('1');
  bitDepthSelect.changed(onBitDepthChanged);

  oledPresetButton = createButton('128x64 mono OLED');
  oledPresetButton.parent(parentEl);
  oledPresetButton.size(150);
  oledPresetButton.mousePressed(applyOledPreset);

  lcdPresetButton = createButton('240x240 color LCD');
  lcdPresetButton.parent(parentEl);
  lcdPresetButton.size(160);
  lcdPresetButton.mousePressed(applyLcdPreset);

  resetButton = createButton('Reset');
  resetButton.parent(parentEl);
  resetButton.size(70);
  resetButton.mousePressed(resetAll);

  widthSlider = createSlider(8, 240, bufWidth, 8);
  widthSlider.parent(parentEl);
  widthSlider.input(onWidthChanged);

  heightSlider = createSlider(8, 240, bufHeight, 8);
  heightSlider.parent(parentEl);
  heightSlider.input(onHeightChanged);

  positionControls();

  describe(
    'A frame buffer size calculator. Width and height sliders and a bit-depth ' +
    'selector feed a live formula that shows the byte total for one frame ' +
    'buffer, together with a bar comparing that total to the 264 kilobytes ' +
    'of RAM on an RP2040 microcontroller.'
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
  resizeSliders();
}

function resizeSliders() {
  const w = max(90, canvasWidth - sliderLeftMargin - margin);
  if (typeof widthSlider !== 'undefined' && widthSlider) widthSlider.size(w);
  if (typeof heightSlider !== 'undefined' && heightSlider) heightSlider.size(w);
}

function windowResized() {
  updateCanvasSize();
  resizeCanvas(canvasWidth, canvasHeight);
  positionControls();
}

function positionControls() {
  const row1Y = drawHeight + 8;
  const row2Y = drawHeight + 43;
  const row3Y = drawHeight + 78;
  const row4Y = drawHeight + 113;

  bitDepthSelect.position(100, row1Y);
  resetButton.position(max(280, canvasWidth - 70 - margin), row1Y);
  oledPresetButton.position(10, row2Y);
  lcdPresetButton.position(170, row2Y);
  widthSlider.position(sliderLeftMargin, row3Y);
  heightSlider.position(sliderLeftMargin, row4Y);
  resizeSliders();
}

// ---------------------------------------------------------------------------
// Control callbacks
// ---------------------------------------------------------------------------
function onWidthChanged() {
  bufWidth = widthSlider.value();
  cancelPresetAnimation();
}

function onHeightChanged() {
  bufHeight = heightSlider.value();
  cancelPresetAnimation();
}

function onBitDepthChanged() {
  bitDepth = int(bitDepthSelect.value());
}

function cancelPresetAnimation() {
  targetWidth = null;
  targetHeight = null;
}

function applyOledPreset() {
  targetWidth = 128;
  targetHeight = 64;
  bitDepth = 1;
  bitDepthSelect.selected('1');
}

function applyLcdPreset() {
  targetWidth = 240;
  targetHeight = 240;
  bitDepth = 16;
  bitDepthSelect.selected('16');
}

function resetAll() {
  cancelPresetAnimation();
  bufWidth = 128;
  bufHeight = 64;
  bitDepth = 1;
  widthSlider.value(bufWidth);
  heightSlider.value(bufHeight);
  bitDepthSelect.selected('1');
}

// Walk the sliders toward a preset a few pixels per frame. The step is clamped
// to whatever distance is left so the value lands exactly on the target.
function stepToward(current, target) {
  const diff = target - current;
  if (diff === 0) return current;
  const move = min(abs(diff), ANIM_STEP);
  return current + (diff > 0 ? move : -move);
}

function advancePresetAnimation() {
  if (targetWidth === null && targetHeight === null) return;
  let stillMoving = false;

  if (targetWidth !== null && bufWidth !== targetWidth) {
    bufWidth = stepToward(bufWidth, targetWidth);
    widthSlider.value(bufWidth);
    stillMoving = true;
  }
  if (targetHeight !== null && bufHeight !== targetHeight) {
    bufHeight = stepToward(bufHeight, targetHeight);
    heightSlider.value(bufHeight);
    stillMoving = true;
  }
  if (!stillMoving) cancelPresetAnimation();
}

// ---------------------------------------------------------------------------
// The calculation itself
// bytes = width x height x bit depth / 8
// The result is rounded up because a partly used byte still costs a whole byte.
// ---------------------------------------------------------------------------
function bufferBytes() {
  return ceil((bufWidth * bufHeight * bitDepth) / 8);
}

// Insert thousands separators, e.g. 115200 becomes "115,200".
function withCommas(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function kilobytes(bytes) {
  return bytes / 1024;
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------
function draw() {
  updateCanvasSize();
  advancePresetAnimation();

  stroke('silver');
  fill('aliceblue');
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  const bytes = bufferBytes();
  const kb = kilobytes(bytes);
  const fraction = bytes / RP2040_RAM_BYTES;
  const overAlert = fraction > ALERT_FRACTION;
  const barColor = overAlert ? 'coral' : 'teal';

  drawTitle();
  drawFormulaBlock(bytes);
  drawBigReadout(bytes, kb);
  drawRamBar(fraction, barColor, overAlert);
  drawControlLabels();
}

function drawTitle() {
  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(canvasWidth < 520 ? 18 : 22);
  text('Frame Buffer Size Calculator', canvasWidth / 2, 8);

  fill('dimgray');
  textSize(14);
  text('How much memory does one screen of pixels need?', canvasWidth / 2, 42);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}

// Three stacked lines: the general rule, the numbers plugged in, the answer.
function drawFormulaBlock(bytes) {
  const centerX = canvasWidth / 2;
  const bigText = canvasWidth < 520 ? 15 : 18;

  noStroke();
  textAlign(CENTER, TOP);

  fill('dimgray');
  textSize(15);
  text('bytes = width x height x bit depth / 8', centerX, 74);

  fill('black');
  textFont('monospace');
  textSize(bigText);
  text('bytes = ' + bufWidth + ' x ' + bufHeight + ' x ' + bitDepth + ' / 8',
    centerX, 104);
  text('bytes = ' + withCommas(bytes), centerX, 134);
  textFont('sans-serif');

  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}

// The headline number, repeated in kilobytes so both units stay familiar.
function drawBigReadout(bytes, kb) {
  noStroke();
  fill('teal');
  textAlign(CENTER, TOP);
  textSize(canvasWidth < 520 ? 22 : 28);
  text(withCommas(bytes) + ' bytes  =  ' + kb.toFixed(1) + ' KB',
    canvasWidth / 2, 172);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}

// A full-width bar showing this buffer as a share of the RP2040's 264 KB.
function drawRamBar(fraction, barColor, overAlert) {
  const barX = margin;
  const barW = canvasWidth - 2 * margin;
  const barY = 240;
  const barH = 32;

  noStroke();
  fill('black');
  textAlign(LEFT, TOP);
  textSize(15);
  text('RP2040 total RAM: ' + RP2040_RAM_KB + ' KB', barX, 216);

  // Empty track
  stroke('silver');
  fill('white');
  rect(barX, barY, barW, barH, 6);

  // Filled portion. Very small buffers still get a sliver so they stay visible.
  const filledW = max(3, barW * min(1, fraction));
  noStroke();
  fill(barColor);
  rect(barX, barY, filledW, barH, 6);

  // Percentage caption below the bar
  noStroke();
  fill(overAlert ? 'coral' : 'black');
  textAlign(CENTER, TOP);
  textSize(16);
  text('This frame buffer uses ' + (fraction * 100).toFixed(1) +
    '% of the RP2040 RAM', canvasWidth / 2, barY + barH + 12);

  fill('dimgray');
  textSize(14);
  const note = overAlert
    ? 'That is a large share of RAM for one buffer. Color displays are hungry.'
    : 'Plenty of RAM is left for your code, variables, and other buffers.';
  text(note, margin, barY + barH + 40, barW, 40);

  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}

// Labels drawn inside the white control region.
function drawControlLabels() {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('Bit depth:', 10, drawHeight + 18);
  text('Width: ' + bufWidth + ' px', 10, drawHeight + 88);
  text('Height: ' + bufHeight + ' px', 10, drawHeight + 123);
  textAlign(LEFT, TOP);
}
