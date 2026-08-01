// Draw Order and Overdraw Stepper MicroSim
// Chapter 6: Basic Drawing Primitives
// Bloom level: Analyze (L4) - examine, differentiate
// Interaction: learner-paced Step Forward / Step Back through a fixed list of
// FrameBuf draw calls, plus an order toggle so two orderings can be compared.
//
// CANVAS_HEIGHT: 500

// ---------------------------------------------------------------------------
// Layout constants (standard MicroSim pattern)
// ---------------------------------------------------------------------------
let canvasWidth = 800;
let drawHeight = 420;
let controlHeight = 80;          // two rows of controls
let canvasHeight = drawHeight + controlHeight;
let margin = 12;
let defaultTextSize = 16;

// The simulated OLED frame buffer is 128 pixels wide by 64 pixels tall.
const BUF_W = 128;
const BUF_H = 64;

// How long an overdraw flash stays on screen, in milliseconds.
const FLASH_MS = 900;

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
let stepForwardButton;
let stepBackButton;
let resetButton;
let orderSelect;

// ---------------------------------------------------------------------------
// Pixel-list helpers. Each draw call knows exactly which buffer pixels it
// writes to, which is what lets us count overdraw one call at a time.
// ---------------------------------------------------------------------------

// Every pixel inside a solid rectangle (what fb.fill_rect touches).
function solidRectPixels(x, y, w, h) {
  const out = [];
  for (let py = y; py < y + h; py++) {
    for (let px = x; px < x + w; px++) {
      out.push(py * BUF_W + px);
    }
  }
  return out;
}

// Only the border pixels of a rectangle (what fb.rect touches).
function outlineRectPixels(x, y, w, h) {
  const out = [];
  for (let px = x; px < x + w; px++) {
    out.push(y * BUF_W + px);
    out.push((y + h - 1) * BUF_W + px);
  }
  for (let py = y + 1; py < y + h - 1; py++) {
    out.push(py * BUF_W + x);
    out.push(py * BUF_W + x + w - 1);
  }
  return out;
}

// A single horizontal run of pixels (what fb.hline touches).
function hlinePixels(x, y, w) {
  const out = [];
  for (let px = x; px < x + w; px++) {
    out.push(y * BUF_W + px);
  }
  return out;
}

// ---------------------------------------------------------------------------
// The five draw calls that build a simple robot face.
//   value 1 = pixel on (white)   value 0 = pixel off (black)
// ---------------------------------------------------------------------------
const calls = {
  bg: {
    code: 'fb.fill(0)',
    name: 'background fill',
    value: 0,
    pixels: solidRectPixels(0, 0, BUF_W, BUF_H),
    note: 'fb.fill(0) writes a value to every one of the 8,192 pixels in the ' +
          'buffer. It is by far the most expensive call in the list.'
  },
  face: {
    code: 'fb.rect(14, 6, 100, 52, 1)',
    name: 'face outline',
    value: 1,
    pixels: outlineRectPixels(14, 6, 100, 52),
    note: 'fb.rect() lights only the border of the rectangle, not its inside, ' +
          'so it turns on 300 pixels around the edge of the face.'
  },
  leftEye: {
    code: 'fb.fill_rect(40, 20, 14, 10, 1)',
    name: 'left eye',
    value: 1,
    pixels: solidRectPixels(40, 20, 14, 10),
    note: 'fb.fill_rect() lights every pixel inside the rectangle, so the left ' +
          'eye turns on 14 x 10 = 140 pixels.'
  },
  rightEye: {
    code: 'fb.fill_rect(74, 20, 14, 10, 1)',
    name: 'right eye',
    value: 1,
    pixels: solidRectPixels(74, 20, 14, 10),
    note: 'The right eye is the same size as the left one, so it also turns on ' +
          '140 pixels. Neither eye touches the face outline.'
  },
  mouth: {
    code: 'fb.hline(46, 44, 36, 1)',
    name: 'mouth line',
    value: 1,
    pixels: hlinePixels(46, 44, 36),
    note: 'fb.hline() lights a single row of 36 pixels. It is the cheapest ' +
          'call in the whole sequence.'
  }
};

// ---------------------------------------------------------------------------
// The two orderings the learner can compare. Same five calls, different order.
// ---------------------------------------------------------------------------
const orders = {
  original: {
    label: 'Original (background last)',
    seq: ['face', 'leftEye', 'rightEye', 'mouth', 'bg'],
    verdict: 'Every face pixel was drawn and then erased by the last call. ' +
             'The screen is blank, and all 616 pixels of work were wasted.'
  },
  optimized: {
    label: 'Optimized (background first)',
    seq: ['bg', 'face', 'leftEye', 'rightEye', 'mouth'],
    verdict: 'Zero overdraw. The background was already black, so clearing it ' +
             'first changed nothing, and every face pixel survives to the end.'
  }
};

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let currentOrder = 'original';
let stepIdx = 0;                 // 0 = nothing drawn yet, 5 = sequence finished
let history = [];                // one snapshot per step, index 0..5
let flashStartMs = -1;           // when the current coral flash began

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
function setup() {
  updateCanvasSize();
  const cnv = createCanvas(canvasWidth, canvasHeight);
  const parentEl = document.querySelector('main');
  cnv.parent(parentEl);

  stepForwardButton = createButton('Step Forward');
  stepForwardButton.parent(parentEl);
  stepForwardButton.mousePressed(stepForward);

  stepBackButton = createButton('Step Back');
  stepBackButton.parent(parentEl);
  stepBackButton.mousePressed(stepBack);

  resetButton = createButton('Reset');
  resetButton.parent(parentEl);
  resetButton.mousePressed(resetRun);

  orderSelect = createSelect();
  orderSelect.parent(parentEl);
  orderSelect.option('Original (background last)', 'original');
  orderSelect.option('Optimized (background first)', 'optimized');
  orderSelect.selected('original');
  orderSelect.changed(onOrderChanged);

  rebuildHistory();
  resetRun();
  positionControls();

  describe(
    'A step-through of five MicroPython FrameBuf draw calls that build a robot ' +
    'face on a 128 by 64 pixel buffer. A code listing highlights the call being ' +
    'applied, the buffer view shows the result, and a counter reports how many ' +
    'pixels an earlier call drew that a later call overwrote.'
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
  const row1Y = drawHeight + 8;
  const row2Y = drawHeight + 43;
  stepForwardButton.position(10, row1Y);
  stepBackButton.position(120, row1Y);
  resetButton.position(215, row1Y);
  orderSelect.position(100, row2Y);
}

// ---------------------------------------------------------------------------
// Replay the whole sequence once and store a snapshot after every call.
//
// A pixel counts as OVERDRAWN when a call changes a pixel that an earlier call
// in this same sequence had already changed. Writing the value a pixel already
// holds costs nothing visible, so it is not counted.
// ---------------------------------------------------------------------------
function rebuildHistory() {
  const seq = orders[currentOrder].seq;
  const buf = new Uint8Array(BUF_W * BUF_H);      // current pixel values
  const touched = new Uint8Array(BUF_W * BUF_H);  // set by an earlier call?
  let overdrawTotal = 0;

  history = [{
    buf: buf.slice(),
    overdrawTotal: 0,
    stepOverdraw: 0,
    stepChanged: 0,
    flash: [],
    lit: 0
  }];

  for (let i = 0; i < seq.length; i++) {
    const c = calls[seq[i]];
    const flash = [];
    let stepChanged = 0;
    let stepOverdraw = 0;

    for (let n = 0; n < c.pixels.length; n++) {
      const idx = c.pixels[n];
      if (buf[idx] === c.value) continue;   // nothing actually changes
      if (touched[idx]) {
        stepOverdraw++;
        flash.push(idx);
      }
      buf[idx] = c.value;
      touched[idx] = 1;
      stepChanged++;
    }

    overdrawTotal += stepOverdraw;
    history.push({
      buf: buf.slice(),
      overdrawTotal: overdrawTotal,
      stepOverdraw: stepOverdraw,
      stepChanged: stepChanged,
      flash: flash,
      lit: countLit(buf)
    });
  }
}

function countLit(buf) {
  let total = 0;
  for (let n = 0; n < buf.length; n++) {
    if (buf[n] === 1) total++;
  }
  return total;
}

// ---------------------------------------------------------------------------
// Step controls
// ---------------------------------------------------------------------------
function onOrderChanged() {
  currentOrder = orderSelect.value();
  rebuildHistory();
  resetRun();
}

function resetRun() {
  stepIdx = 0;
  flashStartMs = -1;
  updateButtonStates();
}

function stepForward() {
  if (stepIdx >= history.length - 1) return;
  stepIdx++;
  // Only a forward step flashes the pixels it just overwrote.
  flashStartMs = history[stepIdx].flash.length > 0 ? millis() : -1;
  updateButtonStates();
}

function stepBack() {
  if (stepIdx <= 0) return;
  stepIdx--;
  flashStartMs = -1;
  updateButtonStates();
}

function updateButtonStates() {
  if (stepIdx < history.length - 1) {
    stepForwardButton.removeAttribute('disabled');
  } else {
    stepForwardButton.attribute('disabled', '');
  }
  if (stepIdx > 0) {
    stepBackButton.removeAttribute('disabled');
  } else {
    stepBackButton.attribute('disabled', '');
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
  text('Draw Order and Overdraw Stepper', canvasWidth / 2, 6);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);

  if (narrow) {
    drawNarrowLayout();
  } else {
    drawWideLayout();
  }

  drawControlLabels();
}

// Wide screens: buffer plus notes on the left, code listing and counter right.
function drawWideLayout() {
  const leftX = margin;
  const leftW = floor(canvasWidth * 0.58) - margin * 2;

  // The note band gets a fixed slot at the bottom, so the buffer has to fit in
  // whatever is left. Scale is limited by width AND height, never larger than 5.
  const noteH = 92;
  const noteY = drawHeight - noteH - 8;
  const slotTop = 44;
  const slotH = noteY - slotTop - 26;          // 26 leaves room for the caption
  const pxSize = constrain(
    min(floor(leftW / BUF_W), floor(slotH / BUF_H)), 2, 5);
  const bufW = pxSize * BUF_W;
  const bufH = pxSize * BUF_H;
  const bufX = leftX + floor((leftW - bufW) / 2);
  const bufY = slotTop + floor((slotH - bufH) / 2);

  drawBufferView(bufX, bufY, pxSize);
  drawNoteBand(leftX, noteY, leftW, noteH, 14, false);

  const rightX = floor(canvasWidth * 0.60);
  const rightW = canvasWidth - rightX - margin;
  drawCodeListing(rightX, 40, rightW, 14, 26);
  drawCounterPanel(rightX, 220, rightW, 84, false);
  drawVerdict(rightX, 316, rightW, drawHeight - 316 - 8, 13);
}

// Narrow screens: everything stacks in one column at a fixed 2x pixel scale.
function drawNarrowLayout() {
  const x = margin;
  const w = canvasWidth - 2 * margin;
  const pxSize = 2;
  const bufW = pxSize * BUF_W;
  const bufX = x + floor((w - bufW) / 2);
  const bufY = 32;

  drawBufferView(bufX, bufY, pxSize);

  drawCodeListing(x, 186, w, 12, 20);
  drawCounterPanel(x, 324, w, 18, true);
  // The narrow layout has no room for a separate verdict panel, so the final
  // summary is folded into the note band instead.
  drawNoteBand(x, 344, w, drawHeight - 344 - 6, 11, true);
}

// The simulated OLED. Unlit pixels are black, lit pixels are white, and
// pixels the current call just overwrote flash coral before settling.
function drawBufferView(x, y, pxSize) {
  const snap = history[stepIdx];

  // The unlit screen
  stroke('silver');
  fill('black');
  rect(x - 2, y - 2, pxSize * BUF_W + 4, pxSize * BUF_H + 4, 4);

  // Lit pixels
  noStroke();
  fill('white');
  for (let idx = 0; idx < snap.buf.length; idx++) {
    if (snap.buf[idx] !== 1) continue;
    const px = idx % BUF_W;
    const py = floor(idx / BUF_W);
    rect(x + px * pxSize, y + py * pxSize, pxSize, pxSize);
  }

  // Coral overdraw flash, fading out over FLASH_MS
  if (flashStartMs > 0) {
    const age = millis() - flashStartMs;
    if (age > FLASH_MS) {
      flashStartMs = -1;
    } else {
      const alpha = 255 * (1 - age / FLASH_MS);
      fill(255, 112, 67, alpha);        // coral
      for (let n = 0; n < snap.flash.length; n++) {
        const idx = snap.flash[n];
        const px = idx % BUF_W;
        const py = floor(idx / BUF_W);
        rect(x + px * pxSize, y + py * pxSize, pxSize, pxSize);
      }
    }
  }

  noStroke();
  fill('dimgray');
  textSize(12);
  textAlign(LEFT, TOP);
  text('Frame buffer: 128 x 64 pixels', x, y + pxSize * BUF_H + 6);
  textSize(defaultTextSize);
}

// The ordered list of draw calls, with the call just applied highlighted.
function drawCodeListing(x, y, w, fontSize, lineH) {
  const seq = orders[currentOrder].seq;

  noStroke();
  fill('black');
  textSize(14);
  textAlign(LEFT, TOP);
  text('Draw calls in order:', x, y);

  const boxY = y + 20;
  const boxH = lineH * seq.length + 12;
  fill('white');
  stroke('silver');
  rect(x, boxY, w, boxH, 6);

  for (let i = 0; i < seq.length; i++) {
    const lineY = boxY + 6 + i * lineH;
    const isCurrent = (i === stepIdx - 1);
    if (isCurrent) {
      noStroke();
      fill('khaki');
      rect(x + 3, lineY, w - 6, lineH, 3);
    }
    noStroke();
    textSize(fontSize);
    // Calls not yet applied stay gray so the learner can see what is coming.
    // Pending lines use a slate gray, not silver: silver on white is far
    // below the readable contrast floor, and the learner has to read ahead.
    const applied = (i < stepIdx);
    fill(applied ? 'gray' : '#546E7A');
    text(i + 1, x + 8, lineY + 3);
    fill(applied ? 'black' : '#546E7A');
    textFont('monospace');
    text(calls[seq[i]].code, x + 28, lineY + 3);
    textFont('sans-serif');
  }
  textSize(defaultTextSize);
}

// The running overdraw counter and the count of pixels still lit.
// In compact mode this collapses to a single unboxed line of text.
function drawCounterPanel(x, y, w, h, compact) {
  const snap = history[stepIdx];

  if (compact) {
    noStroke();
    textAlign(LEFT, TOP);
    fill(snap.overdrawTotal > 0 ? 'coral' : 'black');
    textSize(14);
    text('Overdrawn so far: ' + snap.overdrawTotal, x + 2, y);
    fill('black');
    text('Lit now: ' + snap.lit, x + 2 + w * 0.55, y);
    textSize(defaultTextSize);
    return;
  }

  fill(255, 255, 255, 230);
  stroke(200);
  rect(x, y, w, h, 10);

  noStroke();
  textAlign(LEFT, TOP);
  fill(snap.overdrawTotal > 0 ? 'coral' : 'black');
  textSize(17);
  text('Overdrawn pixels so far: ' + snap.overdrawTotal, x + 10, y + 8);

  fill('black');
  textSize(15);
  text('Pixels lit right now: ' + snap.lit, x + 10, y + 30);

  if (h > 60) {
    fill('dimgray');
    textSize(12);
    text('A pixel is overdrawn when a call changes a pixel an earlier call ' +
         'had already set.', x + 10, y + 52, w - 20, h - 56);
  }
  textSize(defaultTextSize);
}

// Plain-language explanation of the step the learner is looking at.
function drawNoteBand(x, y, w, h, fontSize, includeVerdict) {
  fill(255, 255, 255, 230);
  stroke(200);
  rect(x, y, w, h, 10);

  noStroke();
  textAlign(LEFT, TOP);
  const seq = orders[currentOrder].seq;

  let heading;
  let body;
  if (stepIdx === 0) {
    heading = 'Step 0 of ' + seq.length + ': nothing drawn yet';
    body = 'The buffer starts completely black. Click Step Forward to apply ' +
           'call 1 and watch which pixels change.';
  } else {
    const c = calls[seq[stepIdx - 1]];
    const snap = history[stepIdx];
    heading = 'Step ' + stepIdx + ' of ' + seq.length + ': ' + c.name;
    if (snap.stepChanged === 0) {
      // Writing the value a pixel already holds does no visible work at all.
      body = c.note + '  Here it changed nothing, because every pixel was ' +
             'already black. A call that changes no pixels also wastes none.';
    } else {
      body = c.note + '  This call changed ' + snap.stepChanged +
             ' pixels, and ' + snap.stepOverdraw + ' of them were pixels an ' +
             'earlier call had already set.';
    }
    if (includeVerdict && stepIdx === seq.length) {
      body += '  Result: ' + orders[currentOrder].verdict;
    }
  }

  fill('black');
  textSize(fontSize + 1);
  text(heading, x + 10, y + 7, w - 20, 20);
  textSize(fontSize);
  fill('dimgray');
  text(body, x + 10, y + 29, w - 20, h - 34);
  textSize(defaultTextSize);
}

// After the last call, sum up what this ordering cost.
function drawVerdict(x, y, w, h, fontSize) {
  const seq = orders[currentOrder].seq;
  noStroke();
  textAlign(LEFT, TOP);
  textSize(fontSize);
  if (stepIdx < seq.length) {
    fill('gray');
    text('Finish the sequence to compare this order with the other one.',
      x, y, w, h);
  } else {
    fill('black');
    text('Result: ' + orders[currentOrder].verdict, x, y, w, h);
  }
  textSize(defaultTextSize);
}

// Labels drawn inside the white control region.
function drawControlLabels() {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('Reorder:', 10, drawHeight + 53);

  fill('dimgray');
  textSize(14);
  text('Step ' + stepIdx + ' of ' + orders[currentOrder].seq.length,
    300, drawHeight + 18);
  textSize(defaultTextSize);
  textAlign(LEFT, TOP);
}
