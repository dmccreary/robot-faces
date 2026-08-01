// RGB565 Bit-Packing Visualizer MicroSim
// Chapter 15: Porting Faces to a Color Display
// Bloom level: Apply (L3) - calculate, demonstrate, apply
// Interaction: direct manipulation. Every slider move recalculates the whole
// color565() pipeline, from three 0-255 channel values to one packed 16-bit
// number shown in binary, hexadecimal, and decimal.
//
// CANVAS_HEIGHT: 580

// ---------------------------------------------------------------------------
// Layout constants. Total height is fixed; the control strip grows one row
// taller on narrow screens, so drawHeight is recomputed every frame.
// ---------------------------------------------------------------------------
let canvasWidth = 800;
let canvasHeight = 580;      // fixed total: matches CANVAS_HEIGHT above
let drawHeight = 425;        // recomputed by layoutControls()
let controlHeight = 155;     // recomputed by layoutControls()
let margin = 14;
let defaultTextSize = 16;
let sliderLeftMargin = 150;

// Controls
let redSlider;
let greenSlider;
let blueSlider;
let presetSelect;
let resetButton;

// The chapter's own named colors, plus a few more for exploring.
const PRESETS = {
  'Red':    [255, 0, 0],
  'Orange': [255, 165, 0],
  'Yellow': [255, 255, 0],
  'Green':  [0, 200, 80],
  'Cyan':   [0, 200, 220],
  'Blue':   [30, 120, 255],
  'Purple': [150, 0, 200],
  'White':  [255, 255, 255],
  'Black':  [0, 0, 0]
};

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
function setup() {
  updateCanvasSize();
  const cnv = createCanvas(canvasWidth, canvasHeight);
  const parentEl = document.querySelector('main');
  cnv.parent(parentEl);

  // Default is the chapter's worked example: orange, color565(255, 165, 0).
  redSlider = createSlider(0, 255, 255, 1);
  greenSlider = createSlider(0, 255, 165, 1);
  blueSlider = createSlider(0, 255, 0, 1);

  const sliders = [redSlider, greenSlider, blueSlider];
  const tints = ['#D32F2F', '#2E7D32', '#1565C0'];
  for (let i = 0; i < sliders.length; i++) {
    sliders[i].parent(parentEl);
    sliders[i].style('accent-color', tints[i]);  // tint each track its channel
  }

  presetSelect = createSelect();
  presetSelect.parent(parentEl);
  presetSelect.option('Try a Named Color', '');
  for (const colorName in PRESETS) presetSelect.option(colorName);
  presetSelect.selected('');
  presetSelect.changed(applyPreset);

  resetButton = createButton('Reset to Black');
  resetButton.parent(parentEl);
  resetButton.mousePressed(resetChannels);

  layoutControls();
  positionControls();

  describe(
    'A live calculator for the color565() function. Three sliders set red, ' +
    'green, and blue from 0 to 255. The sim shows the true mixed color beside ' +
    'the quantized color an RGB565 display can actually produce, then the ' +
    'right shift that shrinks each channel to five or six bits, then those ' +
    'bits placed into a sixteen-box bit strip, and finally the packed value ' +
    'in binary, hexadecimal, and decimal.'
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
  controlHeight = canvasWidth < 520 ? 190 : 155;
  drawHeight = canvasHeight - controlHeight;
}

function positionControls() {
  const sliderWidth = max(80, canvasWidth - sliderLeftMargin - margin);
  const rowY = drawHeight + 10;

  redSlider.position(sliderLeftMargin, rowY);
  redSlider.size(sliderWidth);
  greenSlider.position(sliderLeftMargin, rowY + 35);
  greenSlider.size(sliderWidth);
  blueSlider.position(sliderLeftMargin, rowY + 70);
  blueSlider.size(sliderWidth);

  presetSelect.position(10, rowY + 105);
  presetSelect.size(180, 26);
  if (canvasWidth < 520) {
    resetButton.position(10, rowY + 140);
  } else {
    resetButton.position(204, rowY + 105);
  }
}

// ---------------------------------------------------------------------------
// The packing math, mirroring the chapter's MicroPython color565()
// ---------------------------------------------------------------------------
function color565(r, g, b) {
  const r5 = (r >> 3) & 0x1F;   // keep the top 5 bits of red
  const g6 = (g >> 2) & 0x3F;   // keep the top 6 bits of green
  const b5 = (b >> 3) & 0x1F;   // keep the top 5 bits of blue
  return (r5 << 11) | (g6 << 5) | b5;
}

// Stretch a shrunken channel back to 0-255 so the swatch shows what the
// display really produces after those low bits were thrown away.
function expand5(v) { return (v << 3) | (v >> 2); }
function expand6(v) { return (v << 2) | (v >> 4); }

function binaryString(value, width) {
  let s = value.toString(2);
  while (s.length < width) s = '0' + s;
  return s;
}

function hexWord(value) {
  let s = value.toString(16).toUpperCase();
  while (s.length < 4) s = '0' + s;
  return '0x' + s;
}

function applyPreset() {
  const choice = presetSelect.value();
  if (choice === '' || !PRESETS[choice]) return;
  redSlider.value(PRESETS[choice][0]);
  greenSlider.value(PRESETS[choice][1]);
  blueSlider.value(PRESETS[choice][2]);
}

function resetChannels() {
  redSlider.value(0);
  greenSlider.value(0);
  blueSlider.value(0);
  presetSelect.selected('');
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------
function draw() {
  updateCanvasSize();
  layoutControls();
  positionControls();

  const r = redSlider.value();
  const g = greenSlider.value();
  const b = blueSlider.value();
  const r5 = (r >> 3) & 0x1F;
  const g6 = (g >> 2) & 0x3F;
  const b5 = (b >> 3) & 0x1F;
  const packed = color565(r, g, b);

  stroke('silver');
  fill('aliceblue');
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  const narrow = canvasWidth < 560;

  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(narrow ? 18 : 22);
  text('RGB565 Bit-Packing Visualizer', canvasWidth / 2, 6);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);

  let y = 36;
  y = drawStageOne(y, r, g, b, r5, g6, b5, narrow);
  y = drawStageTwo(y, r, g, b, r5, g6, b5, narrow);
  y = drawStageThree(y, r5, g6, b5, narrow);
  drawStageFour(y, packed, narrow);

  drawControlLabels(r, g, b);
}

// Stage 1: the raw channel values and the color they mix to, next to the
// quantized color the display can really show.
function drawStageOne(y, r, g, b, r5, g6, b5, narrow) {
  noStroke();
  fill('black');
  textSize(14);
  text('Stage 1: mix the three raw 0-255 channel values', margin, y);
  y += 20;

  const swatchW = narrow ? 74 : 96;
  const swatchH = narrow ? 54 : 66;

  stroke(120);
  fill(r, g, b);
  rect(margin, y, swatchW, swatchH, 6);
  fill(expand5(r5), expand6(g6), expand5(b5));
  rect(margin + swatchW + 14, y, swatchW, swatchH, 6);

  noStroke();
  fill('dimgray');
  textSize(11);
  textAlign(CENTER, TOP);
  text('true color', margin + swatchW / 2, y + swatchH + 3);
  text('as RGB565 shows it', margin + swatchW * 1.5 + 14, y + swatchH + 3);
  textAlign(LEFT, TOP);

  if (narrow) {
    // Not enough width beside the swatches, so the values go underneath.
    fill('black');
    textSize(13);
    text('red ' + r + '   green ' + g + '   blue ' + b,
      margin, y + swatchH + 19);
    textSize(defaultTextSize);
    return y + swatchH + 40;
  }

  const textX = margin + swatchW * 2 + 34;
  fill('black');
  textSize(14);
  text('red ' + r + '   green ' + g + '   blue ' + b, textX, y,
    canvasWidth - textX - margin, 20);
  fill('#37474F');
  textSize(12);
  text('The second swatch throws away the low bits of every channel, which ' +
    'is the real cost of spending only 16 bits per pixel.',
    textX, y + 22, canvasWidth - textX - margin, 44);
  textSize(defaultTextSize);

  return y + swatchH + 26;
}

// Stage 2: one "shrink" row per channel, showing the shift and its result.
function drawStageTwo(y, r, g, b, r5, g6, b5, narrow) {
  noStroke();
  fill('black');
  textSize(14);
  text('Stage 2: shift each channel right so it fits its slot', margin, y);
  y += 20;

  const rows = [
    { label: 'Red',   raw: r, shift: 3, out: r5, bits: 5, tint: '#D32F2F' },
    { label: 'Green', raw: g, shift: 2, out: g6, bits: 6, tint: '#2E7D32' },
    { label: 'Blue',  raw: b, shift: 3, out: b5, bits: 5, tint: '#1565C0' }
  ];

  textSize(narrow ? 12 : 14);
  const colValue = margin + 54;
  const colShift = margin + (narrow ? 100 : 112);
  const colBits = margin + (narrow ? 176 : 210);
  const colOut = colBits + (narrow ? 62 : 76);

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    noStroke();
    fill(row.tint);
    text(row.label, margin, y);
    fill('black');
    text(row.raw, colValue, y);
    fill('dimgray');
    text('>> ' + row.shift + '  ->', colShift, y);
    fill(row.tint);
    text(binaryString(row.out, row.bits), colBits, y);
    fill('black');
    text('(' + row.out + ' of ' + (pow(2, row.bits) - 1) + ')', colOut, y);
    y += 21;
  }
  textSize(defaultTextSize);
  return y + 8;
}

// Stage 3: the shrunken values sitting in their bit positions.
function drawStageThree(y, r5, g6, b5, narrow) {
  noStroke();
  fill('black');
  textSize(14);
  text('Stage 3: drop those bits into the 16-bit word', margin, y);
  y += 20;

  const bits = binaryString(r5, 5) + binaryString(g6, 6) + binaryString(b5, 5);
  const usable = canvasWidth - 2 * margin;
  const boxW = min(34, floor(usable / 16));
  const boxH = narrow ? 24 : 28;
  const startX = margin + (usable - boxW * 16) / 2;

  for (let i = 0; i < 16; i++) {
    const tint = i < 5 ? '#EF9A9A' : (i < 11 ? '#A5D6A7' : '#90CAF9');
    stroke(90);
    fill(tint);
    rect(startX + i * boxW, y, boxW, boxH);
    noStroke();
    fill('black');
    textAlign(CENTER, CENTER);
    textSize(min(15, boxW - 6));
    text(bits.charAt(i), startX + i * boxW + boxW / 2, y + boxH / 2);
    // Bit numbers run 15 down to 0, left to right.
    if (boxW >= 22) {
      fill('dimgray');
      textSize(9);
      text(15 - i, startX + i * boxW + boxW / 2, y + boxH + 7);
    }
  }
  textAlign(LEFT, TOP);

  const labelY = y + boxH + (boxW >= 22 ? 16 : 6);
  textAlign(CENTER, TOP);
  textSize(11);
  fill('#C62828');
  text('5 bits red', startX + boxW * 2.5, labelY);
  fill('#2E7D32');
  text('6 bits green', startX + boxW * 8, labelY);
  fill('#1565C0');
  text('5 bits blue', startX + boxW * 13.5, labelY);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);

  return labelY + 22;
}

// Stage 4: the single packed number, in all three notations.
function drawStageFour(y, packed, narrow) {
  noStroke();
  fill('black');
  textSize(14);
  text('Stage 4: one packed value the display driver can use', margin, y);
  y += 20;

  const bin = binaryString(packed, 16);
  const grouped = bin.substring(0, 5) + ' ' + bin.substring(5, 11) + ' ' +
    bin.substring(11);

  fill('#1A237E');
  textSize(narrow ? 13 : 15);
  text('binary   ' + grouped, margin, y);
  y += 21;
  text('hex  ' + hexWord(packed) + '     decimal  ' + packed, margin, y);
  textSize(defaultTextSize);
}

// Slider labels and values live in the white control strip.
function drawControlLabels(r, g, b) {
  noStroke();
  textAlign(LEFT, CENTER);
  textSize(15);
  const rowY = drawHeight + 22;
  fill('#C62828');
  text('Red: ' + r, 10, rowY);
  fill('#2E7D32');
  text('Green: ' + g, 10, rowY + 35);
  fill('#1565C0');
  text('Blue: ' + b, 10, rowY + 70);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}
