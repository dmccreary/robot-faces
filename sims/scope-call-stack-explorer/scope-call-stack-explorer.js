// Global vs Local Scope Call Stack Explorer MicroSim
// Chapter 4: MicroPython Fundamentals II - Functions & the FrameBuf Module
// Bloom level: Analyze (L4) - differentiate, examine
// Interaction: step-by-step execution with a version toggle, so the learner can
// compare what an assignment inside a function does with and without `global`.
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

const MAX_CODE_LINES = 8;

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
let versionSelect;
let stepButton;
let resetButton;

// ---------------------------------------------------------------------------
// The two versions of grow_eyes().
//
// Each step records: which source line is executing, what the Global Scope box
// holds, whether the Local Scope box is on screen and what is inside it, what
// the console has printed, which connector to draw, and a plain-language note.
//
// connector values:
//   'none'     - no line drawn
//   'separate' - crossed link showing two different variables share one name
//   'binds'    - dashed arrow: the local name now points at the global variable
//   'writes'   - solid arrow: the assignment writes into the global variable
// ---------------------------------------------------------------------------
const versions = {
  buggy: {
    label: 'Without global',
    code: [
      'eye_size = 10',
      '',
      'def grow_eyes():',
      '    eye_size = 20',
      '',
      'grow_eyes()',
      'print(eye_size)',
      ''
    ],
    steps: [
      {
        codeLine: 0,
        globalValue: '10',
        localVisible: false,
        localEntries: [],
        consoleText: '',
        connector: 'none',
        note: 'Line 1 runs at the top level, so eye_size is created in the ' +
              'global scope holding the value 10.'
      },
      {
        codeLine: 5,
        globalValue: '10',
        localVisible: true,
        localEntries: [],
        consoleText: '',
        connector: 'none',
        note: 'Calling grow_eyes() opens a brand new local scope for that call. ' +
              'It starts out completely empty.'
      },
      {
        codeLine: 3,
        globalValue: '10',
        localVisible: true,
        localEntries: ['eye_size = 20'],
        consoleText: '',
        connector: 'separate',
        note: 'Assigning to eye_size inside the function creates a LOCAL ' +
              'variable. It shadows the global one, so two different variables ' +
              'now share the name eye_size. The global still holds 10.'
      },
      {
        codeLine: 5,
        globalValue: '10',
        localVisible: false,
        localEntries: [],
        consoleText: '',
        connector: 'none',
        note: 'The function ends. Its local scope is thrown away, and the local ' +
              'eye_size disappears with it. Nothing it did survives.'
      },
      {
        codeLine: 6,
        globalValue: '10',
        localVisible: false,
        localEntries: [],
        consoleText: '10',
        connector: 'none',
        note: 'print(eye_size) reads the global variable, which was never ' +
              'touched. The console shows 10, not 20. That is the bug.'
      }
    ]
  },

  fixed: {
    label: 'With global',
    code: [
      'eye_size = 10',
      '',
      'def grow_eyes():',
      '    global eye_size',
      '    eye_size = 20',
      '',
      'grow_eyes()',
      'print(eye_size)'
    ],
    steps: [
      {
        codeLine: 0,
        globalValue: '10',
        localVisible: false,
        localEntries: [],
        consoleText: '',
        connector: 'none',
        note: 'Line 1 runs at the top level, so eye_size is created in the ' +
              'global scope holding the value 10.'
      },
      {
        codeLine: 6,
        globalValue: '10',
        localVisible: true,
        localEntries: [],
        consoleText: '',
        connector: 'none',
        note: 'Calling grow_eyes() opens a local scope, exactly as it did in ' +
              'the other version.'
      },
      {
        codeLine: 3,
        globalValue: '10',
        localVisible: true,
        localEntries: ['eye_size (global)'],
        consoleText: '',
        connector: 'binds',
        note: 'The global statement tells MicroPython that eye_size in this ' +
              'function means the global variable. No local copy will be made.'
      },
      {
        codeLine: 4,
        globalValue: '20',
        localVisible: true,
        localEntries: ['eye_size (global)'],
        consoleText: '',
        connector: 'writes',
        note: 'The assignment writes straight into the Global Scope box. ' +
              'eye_size changes from 10 to 20 in place, with no local copy.'
      },
      {
        codeLine: 6,
        globalValue: '20',
        localVisible: false,
        localEntries: [],
        consoleText: '',
        connector: 'none',
        note: 'The function ends and the local scope disappears, but the change ' +
              'it made to the global variable stays behind.'
      },
      {
        codeLine: 7,
        globalValue: '20',
        localVisible: false,
        localEntries: [],
        consoleText: '20',
        connector: 'none',
        note: 'print(eye_size) now shows 20, because the function really did ' +
              'modify the one and only global eye_size.'
      }
    ]
  }
};

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let currentVersion = 'buggy';
let stepIdx = 0;
let localAnim = 0;               // 0 = box hidden, 1 = box fully shown

// Box geometry, refreshed every frame so the connector can be drawn on top.
let gBoxX = 0, gBoxY = 0, gBoxW = 0, gBoxH = 0, gVarRowY = 0;
let lBoxX = 0, lBoxY = 0, lBoxW = 0, lBoxH = 0, lVarRowY = 0;
let stackedVertically = true;

// Caption for the current connector, reused by the note band on narrow screens.
let connectorLabelText = '';
let connectorLabelColor = 'black';

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
function setup() {
  updateCanvasSize();
  const cnv = createCanvas(canvasWidth, canvasHeight);
  cnv.parent(document.querySelector('main'));

  const parentEl = document.querySelector('main');

  versionSelect = createSelect();
  versionSelect.parent(parentEl);
  versionSelect.option('Without global', 'buggy');
  versionSelect.option('With global', 'fixed');
  versionSelect.selected('buggy');
  versionSelect.changed(onVersionChanged);

  stepButton = createButton('Step');
  stepButton.parent(parentEl);
  stepButton.size(80);
  stepButton.mousePressed(advanceStep);

  resetButton = createButton('Reset');
  resetButton.parent(parentEl);
  resetButton.size(80);
  resetButton.mousePressed(resetRun);

  positionControls();
  resetRun();

  describe(
    'A step-by-step scope explorer for a MicroPython function called ' +
    'grow_eyes. A Global Scope box and a Local Scope box show which variable ' +
    'each assignment actually changes, in a version without the global ' +
    'keyword and a version with it.'
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
  versionSelect.position(85, row1Y);
  stepButton.position(10, row2Y);
  resetButton.position(100, row2Y);
}

// ---------------------------------------------------------------------------
// Execution control
// ---------------------------------------------------------------------------
function onVersionChanged() {
  currentVersion = versionSelect.value();
  resetRun();
}

function resetRun() {
  stepIdx = 0;
  localAnim = 0;
  updateButtonStates();
}

function advanceStep() {
  const steps = versions[currentVersion].steps;
  if (stepIdx >= steps.length - 1) return;
  stepIdx++;
  updateButtonStates();
}

function updateButtonStates() {
  const steps = versions[currentVersion].steps;
  if (stepIdx < steps.length - 1) {
    stepButton.removeAttribute('disabled');
  } else {
    stepButton.attribute('disabled', '');
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

  const narrow = canvasWidth < 600;
  const ver = versions[currentVersion];
  const st = ver.steps[stepIdx];

  // Ease the Local Scope box in and out instead of popping it on screen.
  const target = st.localVisible ? 1 : 0;
  localAnim += (target - localAnim) * 0.18;
  if (abs(target - localAnim) < 0.01) localAnim = target;

  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(narrow ? 18 : 22);
  text('Global vs Local Scope Explorer', canvasWidth / 2, 6);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);

  if (narrow) {
    drawStackedLayout(ver, st);
  } else {
    drawTwoColumnLayout(ver, st);
  }

  drawConnector(st);
  drawNoteBand(st, narrow);
  drawControlLabels(ver);
}

// Wide screens: code on the left 60%, the two scope boxes stacked on the right.
function drawTwoColumnLayout(ver, st) {
  stackedVertically = true;
  const leftX = margin;
  const leftW = canvasWidth * 0.6 - margin;
  const rightX = canvasWidth * 0.62;
  const rightW = canvasWidth - rightX - margin;

  drawCodePanel(leftX, 40, leftW, ver, st, 16, 22);
  drawConsolePanel(leftX, 260, leftW, st, true);

  // A 60px gap between the boxes leaves clear room for the connector caption.
  drawGlobalBox(rightX, 60, rightW, 76, st);
  drawLocalBox(rightX, 216, rightW, 86, st);
}

// Narrow screens: code on top, the two scope boxes side by side beneath it.
function drawStackedLayout(ver, st) {
  stackedVertically = false;
  const x = margin;
  const w = canvasWidth - 2 * margin;

  drawCodePanel(x, 32, w, ver, st, 13, 18);

  // A 40px gutter between the two boxes leaves room for the connector marker.
  const halfW = (w - 40) / 2;
  drawGlobalBox(x, 236, halfW, 68, st);
  drawLocalBox(x + halfW + 40, 236, halfW, 68, st);
  drawConsolePanel(x, 310, w, st, false);
}

// The source listing with the currently executing line highlighted.
function drawCodePanel(x, y, w, ver, st, fontSize, lineH) {
  noStroke();
  fill('black');
  textSize(15);
  textAlign(LEFT, TOP);
  text('grow_eyes() - version: ' + ver.label, x, y);

  const boxY = y + 20;
  const boxH = lineH * MAX_CODE_LINES + 14;
  fill('white');
  stroke('silver');
  rect(x, boxY, w, boxH, 6);

  for (let idx = 0; idx < MAX_CODE_LINES; idx++) {
    const lineY = boxY + 7 + idx * lineH;
    if (idx === st.codeLine) {
      noStroke();
      fill('khaki');
      rect(x + 3, lineY - 2, w - 6, lineH, 3);
    }
    const src = ver.code[idx] || '';
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
}

// The Global Scope box is always on screen.
function drawGlobalBox(x, y, w, h, st) {
  gBoxX = x; gBoxY = y; gBoxW = w; gBoxH = h;

  noStroke();
  fill('teal');
  textSize(15);
  textAlign(LEFT, TOP);
  text('Global Scope', x, y - 20);

  stroke('teal');
  strokeWeight(2);
  fill('white');
  rect(x, y, w, h, 8);
  strokeWeight(1);

  gVarRowY = y + 34;
  noStroke();
  fill('black');
  textFont('monospace');
  textSize(16);
  text('eye_size = ' + st.globalValue, x + 12, gVarRowY - 8);
  textFont('sans-serif');

  fill('dimgray');
  textSize(11);
  text('lives for the whole program', x + 12, y + h - 20, w - 20, 18);
  textSize(defaultTextSize);
}

// The Local Scope box fades in only while grow_eyes() is running.
function drawLocalBox(x, y, w, h, st) {
  lBoxX = x; lBoxY = y; lBoxW = w; lBoxH = h;
  lVarRowY = y + 34;

  if (localAnim <= 0.01) {
    // Show a faint placeholder so the learner knows where the box will appear.
    noStroke();
    fill('silver');
    textSize(13);
    textAlign(LEFT, TOP);
    text('(no function is running, so there is no local scope)', x, y + 6, w, 40);
    textSize(defaultTextSize);
    return;
  }

  push();
  drawingContext.globalAlpha = localAnim;
  // Slide up slightly as it appears
  translate(0, (1 - localAnim) * 12);

  noStroke();
  fill('coral');
  textSize(15);
  textAlign(LEFT, TOP);
  text('Local Scope: grow_eyes()', x, y - 20);

  stroke('coral');
  strokeWeight(2);
  fill('white');
  rect(x, y, w, h, 8);
  strokeWeight(1);

  noStroke();
  if (st.localEntries.length === 0) {
    fill('gray');
    textSize(14);
    text('(empty)', x + 12, y + 26);
  } else {
    fill('black');
    textFont('monospace');
    textSize(stackedVertically ? 15 : 13);
    for (let idx = 0; idx < st.localEntries.length; idx++) {
      text(st.localEntries[idx], x + 12, y + 26 + idx * 20, w - 20, 20);
    }
    textFont('sans-serif');
  }

  fill('dimgray');
  textSize(11);
  text('gone when it returns', x + 12, y + h - 20, w - 20, 18);
  textSize(defaultTextSize);
  pop();
}

// What print() has sent to the console so far.
function drawConsolePanel(x, y, w, st, boxed) {
  noStroke();
  fill('black');
  textSize(15);
  textAlign(LEFT, TOP);
  text('Console output', x, y);

  if (boxed) {
    const boxY = y + 20;
    fill('white');
    stroke('silver');
    rect(x, boxY, w, 44, 6);
    noStroke();
    if (st.consoleText.length === 0) {
      fill('gray');
      textSize(14);
      text('(nothing printed yet)', x + 10, boxY + 13);
    } else {
      fill('black');
      textFont('monospace');
      textSize(18);
      text(st.consoleText, x + 10, boxY + 11);
      textFont('sans-serif');
    }
  } else {
    noStroke();
    fill(st.consoleText.length === 0 ? 'gray' : 'black');
    textFont('monospace');
    textSize(15);
    text(st.consoleText.length === 0 ? '(nothing printed yet)' : st.consoleText,
      x + 130, y);
    textFont('sans-serif');
  }
  textSize(defaultTextSize);
}

// The line that ties the two boxes together, or shows they are unrelated.
// On narrow screens the boxes sit side by side with only a small gutter, so the
// explanatory label moves into the note band instead of floating over a box.
function drawConnector(st) {
  connectorLabelText = '';
  if (st.connector === 'none' || localAnim < 0.6) return;

  // Anchor points on the facing edges of the two boxes
  let x1, y1, x2, y2;
  if (stackedVertically) {
    x1 = lBoxX + 26;
    // Stop short of the local box so the line does not cross its header text.
    y1 = lBoxY - 26;
    x2 = gBoxX + 26;
    y2 = gBoxY + gBoxH;         // bottom edge of the global box
  } else {
    x1 = lBoxX;                 // left edge of the local box
    y1 = lVarRowY;
    x2 = gBoxX + gBoxW;         // right edge of the global box
    y2 = gVarRowY;
  }

  if (st.connector === 'separate') {
    // Two different variables: a crossed-out link in a warning color
    drawConnectorLine(x1, y1, x2, y2, 'firebrick', true, false);
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    stroke('firebrick');
    strokeWeight(3);
    line(mx - 8, my - 8, mx + 8, my + 8);
    line(mx - 8, my + 8, mx + 8, my - 8);
    strokeWeight(1);
    setConnectorLabel(mx, my, 'two different variables, same name', 'firebrick');
  } else if (st.connector === 'binds') {
    drawConnectorLine(x1, y1, x2, y2, 'darkslateblue', true, true);
    setConnectorLabel((x1 + x2) / 2, (y1 + y2) / 2, 'same variable', 'darkslateblue');
  } else if (st.connector === 'writes') {
    drawConnectorLine(x1, y1, x2, y2, 'darkgreen', false, true);
    setConnectorLabel((x1 + x2) / 2, (y1 + y2) / 2, 'writes 20 here', 'darkgreen');
  }
}

function drawConnectorLine(x1, y1, x2, y2, colorName, dashed, arrowHead) {
  stroke(colorName);
  strokeWeight(2);
  noFill();
  if (dashed) drawingContext.setLineDash([6, 5]);
  line(x1, y1, x2, y2);
  drawingContext.setLineDash([]);
  if (arrowHead) {
    const angle = atan2(y2 - y1, x2 - x1);
    push();
    translate(x2, y2);
    rotate(angle);
    noStroke();
    fill(colorName);
    triangle(0, 0, -10, -5, -10, 5);
    pop();
  }
  strokeWeight(1);
}

// Wide layout: the label floats next to the connector line.
// Narrow layout: there is no room, so the label is handed to the note band.
function setConnectorLabel(mx, my, labelText, colorName) {
  connectorLabelText = labelText;
  connectorLabelColor = colorName;
  if (!stackedVertically) return;
  noStroke();
  fill(colorName);
  textSize(13);
  textAlign(LEFT, CENTER);
  text(labelText, mx + 14, my);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}

// The plain-language explanation of the current step.
function drawNoteBand(st, narrow) {
  const x = margin;
  const w = canvasWidth - 2 * margin;
  const y = narrow ? 330 : 332;
  const h = drawHeight - y - 6;

  noStroke();
  fill(255, 255, 255, 230);
  stroke(200);
  rect(x, y, w, h, 10);

  noStroke();
  textAlign(LEFT, TOP);
  let cursorY = y + 7;

  // On narrow screens the connector caption rides at the top of this band.
  if (!stackedVertically && connectorLabelText.length > 0) {
    fill(connectorLabelColor);
    textSize(13);
    text('Connector: ' + connectorLabelText, x + 10, cursorY, w - 20, 18);
    cursorY += 20;
  }

  fill('black');
  textSize(narrow ? 12 : 14);
  text(st.note, x + 10, cursorY, w - 20, y + h - cursorY - 6);
  textSize(defaultTextSize);
}

// Labels drawn inside the white control region.
function drawControlLabels(ver) {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('Version:', 10, drawHeight + 18);

  fill('dimgray');
  textSize(14);
  const total = ver.steps.length;
  const label = (stepIdx >= total - 1)
    ? 'Step ' + (stepIdx + 1) + ' of ' + total + ' - run finished'
    : 'Step ' + (stepIdx + 1) + ' of ' + total;
  text(label, 195, drawHeight + 53);
  textSize(defaultTextSize);
  textAlign(LEFT, TOP);
}
