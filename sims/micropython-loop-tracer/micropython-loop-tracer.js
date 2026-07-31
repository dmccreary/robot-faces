// MicroPython Loop Tracer MicroSim
// Chapter 3: MicroPython Fundamentals I - Syntax, Data & Loops
// Bloom level: Apply (L3) - execute, demonstrate
// Interaction: predict-then-reveal step-through (NOT continuous animation).
// The learner types what the next printed line will be, clicks Check, and only
// then does the variable table and the output log advance by one step.
//
// CANVAS_HEIGHT: 540

// ---------------------------------------------------------------------------
// Layout constants (standard MicroSim pattern)
// ---------------------------------------------------------------------------
let canvasWidth = 800;          // responsive: reset from the container width
let drawHeight = 420;           // top drawing region
let controlHeight = 120;        // three rows of controls, 35px each, plus padding
let canvasHeight = drawHeight + controlHeight;
let margin = 12;
let defaultTextSize = 16;

// Maximum number of source lines any example uses. Keeping this fixed keeps
// the code box the same height when the learner switches examples.
const MAX_CODE_LINES = 6;
// Maximum number of printed lines any example produces.
const MAX_OUTPUT_LINES = 6;

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
let exampleSelect;
let predictInput;
let checkButton;
let nextButton;
let resetButton;

// ---------------------------------------------------------------------------
// The two traced examples.
//
// Each step is one "predictable moment": a single line of output that the
// learner must predict before it is revealed. `vars` holds the confirmed
// variable values *after* that step finishes.
// ---------------------------------------------------------------------------
const examples = {
  forLoop: {
    label: 'For Loop',
    varName: 'i',
    code: [
      'for i in range(5):',
      '    print("Blink", i)',
      '',
      'print("Loop done. i =", i)',
      '',
      ''
    ],
    steps: [
      {
        codeLine: 1,
        output: 'Blink 0',
        vars: { i: '0' },
        note: 'range(5) hands out 0 first, so i starts at 0 and print shows "Blink 0".'
      },
      {
        codeLine: 1,
        output: 'Blink 1',
        vars: { i: '1' },
        note: 'The loop body repeats. range(5) hands out the next value, so i is now 1.'
      },
      {
        codeLine: 1,
        output: 'Blink 2',
        vars: { i: '2' },
        note: 'Third pass through the body. Each pass gives i the next value in the range.'
      },
      {
        codeLine: 1,
        output: 'Blink 3',
        vars: { i: '3' },
        note: 'Fourth pass. Only one value is left in range(5) after this one.'
      },
      {
        codeLine: 1,
        output: 'Blink 4',
        vars: { i: '4' },
        note: 'Fifth and last pass. range(5) stops at 4, so the loop body is done.'
      },
      {
        codeLine: 3,
        output: 'Loop done. i = 4',
        vars: { i: '4' },
        note: 'The loop is over, but i keeps its last value. That is why i is still 4 here.'
      }
    ]
  },

  whileLoop: {
    label: 'While Loop',
    varName: 'count',
    code: [
      'count = 3',
      'while count > 0:',
      '    print("Ready", count)',
      '    count = count - 1',
      '',
      'print("Go!")'
    ],
    steps: [
      {
        codeLine: 2,
        output: 'Ready 3',
        vars: { count: '2' },
        note: 'count is 3, so 3 > 0 is True. The body prints "Ready 3", then subtracts 1.'
      },
      {
        codeLine: 2,
        output: 'Ready 2',
        vars: { count: '1' },
        note: 'The test runs again. 2 > 0 is True, so the body prints and subtracts once more.'
      },
      {
        codeLine: 2,
        output: 'Ready 1',
        vars: { count: '0' },
        note: 'Last pass: 1 > 0 is True. After the subtraction count reaches 0.'
      },
      {
        codeLine: 5,
        output: 'Go!',
        vars: { count: '0' },
        note: 'Now 0 > 0 is False, so the while loop stops and the line after it runs.'
      }
    ]
  }
};

// ---------------------------------------------------------------------------
// Trace state
// ---------------------------------------------------------------------------
let currentKey = 'forLoop';   // which example is selected
let stepIndex = 0;            // index of the step the learner is predicting
let revealedLines = [];       // confirmed output lines, in order
let confirmedVars = null;     // confirmed variable values, or null before step 1
let wasChecked = false;       // has the pending step been revealed?
let traceDone = false;        // has the last step been revealed?
let feedbackText = '';
let feedbackOk = false;
let attempts = 0;
let correctCount = 0;

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
  exampleSelect.option('For Loop', 'forLoop');
  exampleSelect.option('While Loop', 'whileLoop');
  exampleSelect.selected('forLoop');
  exampleSelect.changed(onExampleChanged);

  predictInput = createInput('');
  predictInput.parent(parentEl);
  predictInput.attribute('placeholder', 'Type the next printed line');

  checkButton = createButton('Check');
  checkButton.parent(parentEl);
  checkButton.size(80);
  checkButton.mousePressed(checkPrediction);

  nextButton = createButton('Next Step');
  nextButton.parent(parentEl);
  nextButton.size(100);
  nextButton.mousePressed(advanceStep);

  resetButton = createButton('Reset');
  resetButton.parent(parentEl);
  resetButton.size(80);
  resetButton.mousePressed(resetTrace);

  positionControls();
  resetTrace();

  describe(
    'A step-through tracer for a MicroPython for loop and while loop. ' +
    'The learner types a prediction for the next printed line, clicks Check, ' +
    'and then sees the variable table and the output log advance one step.'
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

  exampleSelect.position(95, row1Y);

  // The prediction box stays full-width-ish at every screen size.
  const inputWidth = constrain(canvasWidth - 120, 140, 340);
  predictInput.size(inputWidth);
  predictInput.position(10, row2Y);
  checkButton.position(10 + inputWidth + 12, row2Y);

  nextButton.position(10, row3Y);
  resetButton.position(120, row3Y);
}

// ---------------------------------------------------------------------------
// Trace logic
// ---------------------------------------------------------------------------
function onExampleChanged() {
  currentKey = exampleSelect.value();
  resetTrace();
}

function resetTrace() {
  stepIndex = 0;
  revealedLines = [];
  confirmedVars = null;
  wasChecked = false;
  traceDone = false;
  feedbackText = '';
  feedbackOk = false;
  attempts = 0;
  correctCount = 0;
  predictInput.value('');
  updateButtonStates();
}

// Compare loosely: ignore case, quotes, and extra spaces so that a learner who
// types Blink 0 or "Blink 0" both count as correct.
function normalizeAnswer(raw) {
  return String(raw)
    .trim()
    .toLowerCase()
    .replace(/["']/g, '')
    .replace(/\s+/g, ' ');
}

function checkPrediction() {
  if (wasChecked || traceDone) return;
  const ex = examples[currentKey];
  const pending = ex.steps[stepIndex];

  const guess = normalizeAnswer(predictInput.value());
  attempts++;
  if (guess.length > 0 && guess === normalizeAnswer(pending.output)) {
    correctCount++;
    feedbackOk = true;
    feedbackText = 'Correct! ' + pending.note;
  } else {
    feedbackOk = false;
    const typed = predictInput.value().trim();
    const yourGuess = typed.length > 0 ? 'You wrote "' + typed + '". ' : '';
    feedbackText = yourGuess + 'The real output is "' + pending.output + '". ' + pending.note;
  }

  // Reveal this step: commit it to the output log and the variable table.
  revealedLines.push(pending.output);
  confirmedVars = pending.vars;
  wasChecked = true;
  if (stepIndex >= ex.steps.length - 1) {
    traceDone = true;
  }
  updateButtonStates();
}

function advanceStep() {
  if (!wasChecked || traceDone) return;
  stepIndex++;
  wasChecked = false;
  feedbackText = '';
  predictInput.value('');
  updateButtonStates();
}

function updateButtonStates() {
  setEnabled(checkButton, !wasChecked && !traceDone);
  setEnabled(nextButton, wasChecked && !traceDone);
}

function setEnabled(btn, enabled) {
  if (enabled) {
    btn.removeAttribute('disabled');
  } else {
    btn.attribute('disabled', '');
  }
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------
function draw() {
  updateCanvasSize();

  // Drawing region and control region backgrounds
  stroke('silver');
  fill('aliceblue');
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  const narrow = canvasWidth < 600;
  const ex = examples[currentKey];

  // Title
  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(narrow ? 18 : 22);
  text('MicroPython Loop Tracer', canvasWidth / 2, 8);

  textAlign(LEFT, TOP);
  textSize(defaultTextSize);

  if (narrow) {
    drawStackedLayout(ex);
  } else {
    drawTwoColumnLayout(ex);
  }

  drawControlLabels();
}

// Wide screens: code on the left 55%, state panel on the right 45%.
function drawTwoColumnLayout(ex) {
  const leftX = margin;
  const leftW = canvasWidth * 0.55 - margin;
  const rightX = canvasWidth * 0.57;
  const rightW = canvasWidth - rightX - margin;

  drawCodePanel(leftX, 44, leftW, ex, 16, 24);
  drawVarsPanel(rightX, 44, rightW, ex, false);
  drawOutputPanel(rightX, 130, rightW, 22);
  drawProgressNote(leftX, 250, leftW, ex);
  // The feedback band runs the full width beneath both columns.
  drawFeedbackPanel(margin, 310, canvasWidth - 2 * margin, 102, 14);
}

// Narrow screens: code on top, state panel underneath.
function drawStackedLayout(ex) {
  const x = margin;
  const w = canvasWidth - 2 * margin;

  drawCodePanel(x, 36, w, ex, 15, 20);
  drawVarsPanel(x, 196, w, ex, true);
  drawOutputPanel(x, 218, w, 18);
  drawFeedbackPanel(x, 362, w, 54, 12);
}

// The source listing with line numbers and a highlighted current line.
function drawCodePanel(x, y, w, ex, fontSize, lineH) {
  noStroke();
  fill('black');
  textSize(15);
  textAlign(LEFT, TOP);
  text('Code', x, y);

  const boxY = y + 20;
  const boxH = lineH * MAX_CODE_LINES + 14;
  fill('white');
  stroke('silver');
  rect(x, boxY, w, boxH, 6);

  // Which line is about to run (or just ran)?
  let activeLine = -1;
  if (!traceDone || wasChecked) {
    const s = ex.steps[min(stepIndex, ex.steps.length - 1)];
    activeLine = s.codeLine;
  }

  for (let idx = 0; idx < MAX_CODE_LINES; idx++) {
    const lineY = boxY + 7 + idx * lineH;
    if (idx === activeLine) {
      // Pale yellow before the reveal, stronger yellow once confirmed.
      noStroke();
      fill(wasChecked ? 'khaki' : 'lightyellow');
      rect(x + 3, lineY - 2, w - 6, lineH, 3);
    }
    const src = ex.code[idx] || '';
    if (src.length === 0) continue;

    textFont('monospace');
    textSize(fontSize);
    noStroke();
    fill('gray');
    text(idx + 1, x + 9, lineY);
    fill('black');
    text(src, x + 32, lineY);
    textFont('sans-serif');
  }
  textSize(defaultTextSize);
}

// The running variable-state table. Values appear only after confirmation.
function drawVarsPanel(x, y, w, ex, inline) {
  noStroke();
  fill('black');
  textSize(15);
  textAlign(LEFT, TOP);
  text('Variable State', x, y);

  const valueText = confirmedVars
    ? ex.varName + ' = ' + confirmedVars[ex.varName]
    : ex.varName + ' = (not defined yet)';

  if (inline) {
    // Narrow layout: one compact line instead of a boxed table.
    noStroke();
    fill(confirmedVars ? 'black' : 'gray');
    textFont('monospace');
    textSize(15);
    text(valueText, x + 130, y);
    textFont('sans-serif');
    textSize(defaultTextSize);
    return;
  }

  const boxY = y + 20;
  fill('white');
  stroke('silver');
  rect(x, boxY, w, 52, 6);

  noStroke();
  fill('dimgray');
  textSize(13);
  text('Variable', x + 10, boxY + 7);
  text('Value', x + w * 0.55, boxY + 7);

  textFont('monospace');
  textSize(16);
  fill('black');
  text(ex.varName, x + 10, boxY + 27);
  fill(confirmedVars ? 'darkgreen' : 'gray');
  text(confirmedVars ? confirmedVars[ex.varName] : 'not defined yet', x + w * 0.55, boxY + 27);
  textFont('sans-serif');
  textSize(defaultTextSize);
}

// The printed-output log, one line per confirmed step.
function drawOutputPanel(x, y, w, lineH) {
  noStroke();
  fill('black');
  textSize(15);
  textAlign(LEFT, TOP);
  text('Output (what print shows)', x, y);

  const boxY = y + 20;
  const boxH = lineH * MAX_OUTPUT_LINES + 14;
  fill('white');
  stroke('silver');
  rect(x, boxY, w, boxH, 6);

  noStroke();
  if (revealedLines.length === 0) {
    fill('gray');
    textSize(14);
    text('(nothing printed yet)', x + 10, boxY + 8);
  } else {
    textFont('monospace');
    textSize(lineH >= 22 ? 16 : 15);
    fill('black');
    for (let idx = 0; idx < revealedLines.length; idx++) {
      text(revealedLines[idx], x + 10, boxY + 8 + idx * lineH);
    }
    textFont('sans-serif');
  }
  textSize(defaultTextSize);
}

// Feedback after a Check, or a prompt before one.
function drawFeedbackPanel(x, y, w, h, fontSize) {
  // A soft panel groups the feedback and separates it from the two columns.
  fill(255, 255, 255, 230);
  stroke(200);
  rect(x, y, w, h, 10);

  noStroke();
  textAlign(LEFT, TOP);
  const innerW = w - 20;
  const innerH = h - 14;

  if (feedbackText.length > 0) {
    fill(feedbackOk ? 'darkgreen' : 'firebrick');
    textSize(fontSize);
    const bodyH = traceDone ? innerH - 20 : innerH;
    text(feedbackText, x + 10, y + 7, innerW, bodyH);
    if (traceDone) {
      fill('black');
      textSize(fontSize);
      text('Trace complete. Score: ' + correctCount + ' of ' + attempts + ' correct.',
        x + 10, y + h - 24, innerW, 20);
    }
  } else {
    fill('dimgray');
    textSize(fontSize);
    text('Type the next printed line, then click Check. Example format: Blink 0',
      x + 10, y + 7, innerW, innerH);
  }
  textSize(defaultTextSize);
}

// A short reminder of where the trace stands, shown in the left column only.
function drawProgressNote(x, y, w, ex) {
  noStroke();
  fill('dimgray');
  textSize(14);
  textAlign(LEFT, TOP);
  const total = ex.steps.length;
  const shown = revealedLines.length;
  text('Printed lines revealed: ' + shown + ' of ' + total, x, y, w, 20);
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
  const ex = examples[currentKey];
  const label = traceDone
    ? 'Trace finished - click Reset to try again'
    : 'Step ' + (stepIndex + 1) + ' of ' + ex.steps.length;
  text(label, 215, drawHeight + 88);
  textSize(defaultTextSize);
  textAlign(LEFT, TOP);
}
