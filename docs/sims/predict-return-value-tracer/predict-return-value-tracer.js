// Predict the Return Value Tracer MicroSim
// Chapter 4: MicroPython Fundamentals II - Functions & the FrameBuf Module
// Bloom level: Apply (L3) - execute, demonstrate
// Interaction: predict-then-reveal step-through (NOT continuous animation).
// The learner reads a function, types the value they think it returns, and the
// result panel stays hidden until they click Check Prediction.
//
// CANVAS_HEIGHT: 530

// ---------------------------------------------------------------------------
// Layout constants (standard MicroSim pattern)
// ---------------------------------------------------------------------------
let canvasWidth = 800;
let drawHeight = 410;
let controlHeight = 120;        // three rows of controls
let canvasHeight = drawHeight + controlHeight;
let margin = 12;
let defaultTextSize = 16;

// Every example is padded to this many source lines so the code box keeps a
// constant height when the learner switches examples.
const MAX_CODE_LINES = 10;

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
let exampleSelect;
let predictInput;
let checkButton;
let nextButton;
let resetButton;

// ---------------------------------------------------------------------------
// The four examples.
//
// `accepted` holds every normalized spelling that counts as correct.
// `explanation` says how the function reached that result.
// ---------------------------------------------------------------------------
const examples = [
  {
    menuLabel: '1. battery_status(45)',
    code: [
      'def battery_status(level):',
      '    if level > 60:',
      '        return "Full"',
      '    elif level > 20:',
      '        return "Low"',
      '    else:',
      '        return "Critical"',
      '',
      'status = battery_status(45)',
      ''
    ],
    callLine: 8,
    argsText: 'level = 45',
    shownAnswer: '"Low"',
    accepted: ['low'],
    unpackText: '',
    explanation:
      '45 is not greater than 60, so the if branch is skipped. 45 IS greater ' +
      'than 20, so the elif branch runs and returns "Low". A return statement ' +
      'ends the function immediately, so the else branch never runs.'
  },
  {
    menuLabel: '2. set_brightness()  (uses the default)',
    code: [
      'def set_brightness(level=80):',
      '    return level * 2',
      '',
      'result = set_brightness()',
      '', '', '', '', '', ''
    ],
    callLine: 3,
    argsText: 'no argument passed, so level = 80 (the default)',
    shownAnswer: '160',
    accepted: ['160'],
    unpackText: '',
    explanation:
      'The call passes no argument, so level falls back to its default value ' +
      'of 80. A default parameter value is the value used when the caller ' +
      'leaves that argument out. The function returns 80 * 2, which is 160.'
  },
  {
    menuLabel: '3. screen_center(128, 64)  (two values)',
    code: [
      'def screen_center(width, height):',
      '    return width // 2, height // 2',
      '',
      'x, y = screen_center(128, 64)',
      '', '', '', '', '', ''
    ],
    callLine: 3,
    argsText: 'width = 128, height = 64',
    shownAnswer: '(64, 32)',
    accepted: ['64,32', '(64,32)'],
    unpackText: 'Returned tuple: (64, 32)   ->   after unpacking: x = 64, y = 32',
    explanation:
      'The // operator divides and throws away the remainder, so 128 // 2 is ' +
      '64 and 64 // 2 is 32. Listing two values after return packs them into ' +
      'one tuple, and the line x, y = ... unpacks that tuple into two names.'
  },
  {
    menuLabel: '4. set_brightness(30)  (override)',
    code: [
      'def set_brightness(level=80):',
      '    return level * 2',
      '',
      'result = set_brightness(30)',
      '', '', '', '', '', ''
    ],
    callLine: 3,
    argsText: 'level = 30 (the default of 80 is replaced)',
    shownAnswer: '60',
    accepted: ['60'],
    unpackText: '',
    explanation:
      'This time the caller supplies 30, so the default value of 80 is never ' +
      'used. The function returns 30 * 2, which is 60. A default is only a ' +
      'fallback, not a fixed value.'
  }
];

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let currentIndex = 0;
let isRevealed = false;
let feedbackOk = false;
let feedbackHeadline = '';
let attemptedFlags = [false, false, false, false];
let correctFlags = [false, false, false, false];

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
function setup() {
  updateCanvasSize();
  const cnv = createCanvas(canvasWidth, canvasHeight);
  cnv.parent(document.querySelector('main'));

  const parentEl = document.querySelector('main');

  exampleSelect = createSelect();
  exampleSelect.parent(parentEl);
  for (let idx = 0; idx < examples.length; idx++) {
    exampleSelect.option(examples[idx].menuLabel, String(idx));
  }
  exampleSelect.selected('0');
  exampleSelect.changed(onExampleChanged);

  predictInput = createInput('');
  predictInput.parent(parentEl);
  predictInput.attribute('placeholder', 'Type the value you think is returned');

  checkButton = createButton('Check Prediction');
  checkButton.parent(parentEl);
  checkButton.size(130);
  checkButton.mousePressed(checkPrediction);

  nextButton = createButton('Next Example');
  nextButton.parent(parentEl);
  nextButton.size(120);
  nextButton.mousePressed(nextExample);

  resetButton = createButton('Reset');
  resetButton.parent(parentEl);
  resetButton.size(80);
  resetButton.mousePressed(resetAll);

  positionControls();
  resetAll();

  describe(
    'A predict-then-reveal tracer for four short MicroPython functions. ' +
    'The learner reads a function definition and one call, types the return ' +
    'value they expect, and the result panel reveals the actual return value ' +
    'with an explanation. A running score tracks correct predictions.'
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
  const row3Y = drawHeight + 78;

  // The dropdown stays fully visible at every width.
  exampleSelect.position(90, row1Y);
  exampleSelect.size(max(160, min(canvasWidth - 100, 300)));

  const inputWidth = constrain(canvasWidth - 170, 130, 320);
  predictInput.size(inputWidth);
  predictInput.position(10, row2Y);
  checkButton.position(10 + inputWidth + 12, row2Y);

  nextButton.position(10, row3Y);
  resetButton.position(142, row3Y);
}

// ---------------------------------------------------------------------------
// Prediction logic
// ---------------------------------------------------------------------------
function onExampleChanged() {
  currentIndex = int(exampleSelect.value());
  clearPrediction();
}

function clearPrediction() {
  isRevealed = false;
  feedbackHeadline = '';
  feedbackOk = false;
  predictInput.value('');
  updateButtonStates();
}

function resetAll() {
  currentIndex = 0;
  exampleSelect.selected('0');
  attemptedFlags = [false, false, false, false];
  correctFlags = [false, false, false, false];
  clearPrediction();
}

// Ignore case, quotes, spaces, and surrounding parentheses so that a learner
// who types (64, 32) or 64,32 both count as correct.
function normalizeAnswer(raw) {
  return String(raw)
    .trim()
    .toLowerCase()
    .replace(/["']/g, '')
    .replace(/\s+/g, '');
}

function checkPrediction() {
  if (isRevealed) return;
  const ex = examples[currentIndex];
  const guess = normalizeAnswer(predictInput.value());

  let matched = false;
  for (let idx = 0; idx < ex.accepted.length; idx++) {
    if (guess.length > 0 && guess === normalizeAnswer(ex.accepted[idx])) {
      matched = true;
    }
  }

  attemptedFlags[currentIndex] = true;
  correctFlags[currentIndex] = matched;
  feedbackOk = matched;
  feedbackHeadline = matched
    ? 'Correct!'
    : (predictInput.value().trim().length > 0
      ? 'Not quite - you wrote "' + predictInput.value().trim() + '".'
      : 'No prediction typed.');

  isRevealed = true;
  updateButtonStates();
}

function nextExample() {
  if (currentIndex >= examples.length - 1) return;
  currentIndex++;
  exampleSelect.selected(String(currentIndex));
  clearPrediction();
}

function updateButtonStates() {
  setEnabled(checkButton, !isRevealed);
  setEnabled(nextButton, currentIndex < examples.length - 1);
}

function setEnabled(btn, enabled) {
  if (enabled) {
    btn.removeAttribute('disabled');
  } else {
    btn.attribute('disabled', '');
  }
}

function attemptedCount() {
  let n = 0;
  for (let idx = 0; idx < attemptedFlags.length; idx++) {
    if (attemptedFlags[idx]) n++;
  }
  return n;
}

function correctScore() {
  let n = 0;
  for (let idx = 0; idx < correctFlags.length; idx++) {
    if (correctFlags[idx]) n++;
  }
  return n;
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

  const narrow = canvasWidth < 600;
  const ex = examples[currentIndex];

  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(narrow ? 18 : 22);
  text('Predict the Return Value', canvasWidth / 2, 6);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);

  if (narrow) {
    drawStackedLayout(ex);
  } else {
    drawTwoColumnLayout(ex);
  }

  drawControlLabels();
}

function drawTwoColumnLayout(ex) {
  const leftX = margin;
  const leftW = canvasWidth * 0.55 - margin;
  const rightX = canvasWidth * 0.57;
  const rightW = canvasWidth - rightX - margin;

  const codeBottom = drawCodePanel(leftX, 40, leftW, ex, 16, 6);
  drawScoreLine(leftX, codeBottom + 12, leftW);

  drawCallPanel(rightX, 40, rightW, ex);
  drawRevealPanel(rightX, 132, rightW, 250, ex);
}

function drawStackedLayout(ex) {
  const x = margin;
  const w = canvasWidth - 2 * margin;

  const codeBottom = drawCodePanel(x, 34, w, ex, 13, 3);
  noStroke();
  fill('dimgray');
  textSize(13);
  text('Arguments: ' + ex.argsText, x, codeBottom + 6, w, 18);
  textSize(defaultTextSize);

  drawRevealPanel(x, codeBottom + 28, w, drawHeight - (codeBottom + 28) - 26, ex);
  drawScoreLine(x, drawHeight - 22, w);
}

// The function definition plus the one call being made. Returns the y value of
// the bottom of the code box so callers can stack content beneath it.
function drawCodePanel(x, y, w, ex, maxFont, lineGap) {
  noStroke();
  fill('black');
  textSize(15);
  textAlign(LEFT, TOP);
  text('MicroPython code', x, y);

  // Shrink the monospace font until the longest line fits the column.
  const fontSize = constrain(floor((w - 36) / 21.6), 11, maxFont);
  const lineH = fontSize + lineGap;
  const boxY = y + 20;
  const boxH = lineH * MAX_CODE_LINES + 14;

  fill('white');
  stroke('silver');
  rect(x, boxY, w, boxH, 6);

  for (let idx = 0; idx < MAX_CODE_LINES; idx++) {
    const lineY = boxY + 7 + idx * lineH;
    // The call line is highlighted because its argument values drive the answer.
    if (idx === ex.callLine) {
      noStroke();
      fill('khaki');
      rect(x + 3, lineY - 2, w - 6, lineH, 3);
    }
    const src = ex.code[idx] || '';
    if (src.length === 0) continue;
    noStroke();
    textFont('monospace');
    textSize(fontSize);
    fill('gray');
    text(idx + 1, x + 8, lineY);
    fill('black');
    text(src, x + 30, lineY);
    textFont('sans-serif');
  }
  textSize(defaultTextSize);
  return boxY + boxH;
}

// A readout of exactly which argument values this call supplies.
function drawCallPanel(x, y, w, ex) {
  noStroke();
  fill('black');
  textSize(15);
  textAlign(LEFT, TOP);
  text('The call being made', x, y);

  const boxY = y + 20;
  fill('white');
  stroke('silver');
  rect(x, boxY, w, 62, 6);

  noStroke();
  fill('dimgray');
  textSize(13);
  text('Argument values', x + 10, boxY + 8);
  fill('black');
  textFont('monospace');
  textSize(14);
  text(ex.argsText, x + 10, boxY + 28, w - 20, 30);
  textFont('sans-serif');
  textSize(defaultTextSize);
}

// Hidden until the learner submits a prediction, then shows the real answer.
function drawRevealPanel(x, y, w, h, ex) {
  noStroke();
  fill('black');
  textSize(15);
  textAlign(LEFT, TOP);
  text('Result', x, y);

  const boxY = y + 20;
  const boxH = max(60, h - 20);
  fill('white');
  stroke('silver');
  rect(x, boxY, w, boxH, 6);

  noStroke();
  if (!isRevealed) {
    fill('dimgray');
    textSize(14);
    text('Read the code, decide what this call returns, type it in the box ' +
      'below, then click Check Prediction.', x + 10, boxY + 10, w - 20, boxH - 20);
    textSize(defaultTextSize);
    return;
  }

  let cursorY = boxY + 8;
  fill(feedbackOk ? 'darkgreen' : 'firebrick');
  textSize(15);
  text(feedbackHeadline, x + 10, cursorY, w - 20, 20);
  cursorY += 22;

  fill('black');
  textSize(14);
  text('Returned value:', x + 10, cursorY);
  textFont('monospace');
  textSize(16);
  fill('darkgreen');
  text(ex.shownAnswer, x + 118, cursorY - 1);
  textFont('sans-serif');
  cursorY += 24;

  if (ex.unpackText.length > 0) {
    fill('darkslateblue');
    textSize(13);
    text(ex.unpackText, x + 10, cursorY, w - 20, 34);
    cursorY += 34;
  }

  fill('black');
  textSize(13);
  text(ex.explanation, x + 10, cursorY, w - 20, boxY + boxH - cursorY - 8);
  textSize(defaultTextSize);
}

// The running score, shown once more than one example has been tried.
function drawScoreLine(x, y, w) {
  const tried = attemptedCount();
  if (tried < 2) return;
  noStroke();
  fill('black');
  textSize(15);
  textAlign(LEFT, TOP);
  text('Score: ' + correctScore() + ' of ' + tried + ' correct', x, y, w, 20);
  textSize(defaultTextSize);
}

// Labels drawn inside the white control region.
function drawControlLabels() {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('Example:', 10, drawHeight + 18);

  fill('dimgray');
  textSize(14);
  text('Example ' + (currentIndex + 1) + ' of ' + examples.length,
    240, drawHeight + 88);
  textSize(defaultTextSize);
  textAlign(LEFT, TOP);
}
