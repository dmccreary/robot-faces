// Capstone Planning Worksheet
// Chapter 16: Computational Thinking & Capstone Design
// Bloom level: Create (L6) - design, plan, formulate, construct
// Interaction: a synthesis canvas. The learner types an original capstone plan
// into a live worksheet and watches five completeness checks turn green, then
// exports the finished plan as plain text for a documentation file.
//
// CANVAS_HEIGHT: 700

// ---------------------------------------------------------------------------
// Fixed layout. The total height never changes, so the iframe never clips.
// The drawing region on top holds the plan summary and the completeness
// panel; every editable field lives in the control strip below it.
// ---------------------------------------------------------------------------
let canvasWidth = 800;
let canvasHeight = 700;          // fixed total: matches CANVAS_HEIGHT above
let drawHeight = 314;
let controlHeight = 386;         // 700 - 314
let margin = 10;
let defaultTextSize = 16;

const MAX_ROWS = 10;             // room to plan past the required eight
const ROW_H = 24;                // height of one expression row
const REQUIRED_EXPRESSIONS = 8;  // the chapter's capstone checklist minimum

// The three display choices offered by the chapter's capstone checklist.
const DISPLAY_CHOICES = [
  { value: '', label: 'Choose a target display' },
  { value: 'OLED 128x64 monochrome', label: 'OLED 128x64 monochrome' },
  { value: 'Color round 240x240', label: 'Color round 240x240' },
  { value: 'Both displays', label: 'Both displays' }
];

// ---------------------------------------------------------------------------
// Controls. Every expression row is built once at startup and then shown or
// hidden, which is simpler and steadier than creating elements on the fly.
// ---------------------------------------------------------------------------
let exprNameInputs = [];
let exprNoteInputs = [];
let exprDropButtons = [];

let addButton;
let exportButton;
let clearButton;
let confirmClearButton;
let cancelClearButton;

let displayTargetSelect;
let buttonCheckbox;
let potCheckbox;
let encoderCheckbox;
let idleInput;

// Export screen controls
let exportArea;
let backButton;
let selectAllButton;

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let rowCount = 1;                // the worksheet opens with one blank row
let clearPending = false;        // true while the clear confirmation is showing
let showingExport = false;       // true while the export screen is on top
let lastWidth = 0;               // re-lay-out only when the width really changes

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
function setup() {
  updateCanvasSize();
  const cnv = createCanvas(canvasWidth, canvasHeight);
  const parentEl = document.querySelector('main');
  cnv.parent(parentEl);

  addButton = createButton('Add Expression');
  addButton.parent(parentEl);
  addButton.mousePressed(addExpressionRow);

  exportButton = createButton('Export Plan');
  exportButton.parent(parentEl);
  exportButton.mousePressed(openExport);

  clearButton = createButton('Clear Worksheet');
  clearButton.parent(parentEl);
  clearButton.mousePressed(askToClear);

  confirmClearButton = createButton('Yes, clear it');
  confirmClearButton.parent(parentEl);
  confirmClearButton.mousePressed(clearWorksheet);

  cancelClearButton = createButton('Cancel');
  cancelClearButton.parent(parentEl);
  cancelClearButton.mousePressed(cancelClear);

  // One name field, one design-note field and one drop control per row.
  for (let i = 0; i < MAX_ROWS; i++) {
    const nameBox = createInput('');
    nameBox.parent(parentEl);
    nameBox.attribute('placeholder', 'Expression name');
    nameBox.style('font-size', '12px');
    nameBox.input(noteEdit);
    exprNameInputs.push(nameBox);

    const noteBox = createInput('');
    noteBox.parent(parentEl);
    noteBox.attribute('placeholder', 'Rough parameter note, e.g. brows +6, mouth +8');
    noteBox.style('font-size', '12px');
    noteBox.input(noteEdit);
    exprNoteInputs.push(noteBox);

    const dropBtn = createButton('x');
    dropBtn.parent(parentEl);
    dropBtn.style('font-size', '11px');
    dropBtn.attribute('title', 'Remove this expression row');
    dropBtn.mousePressed(function () { dropExpressionRow(i); });
    exprDropButtons.push(dropBtn);
  }

  displayTargetSelect = createSelect();
  displayTargetSelect.parent(parentEl);
  for (let i = 0; i < DISPLAY_CHOICES.length; i++) {
    displayTargetSelect.option(DISPLAY_CHOICES[i].label, DISPLAY_CHOICES[i].value);
  }
  displayTargetSelect.selected('');
  displayTargetSelect.style('font-size', '12px');

  buttonCheckbox = createCheckbox('Push Button', false);
  buttonCheckbox.parent(parentEl);
  buttonCheckbox.style('font-size', '11px');

  potCheckbox = createCheckbox('Potentiometer', false);
  potCheckbox.parent(parentEl);
  potCheckbox.style('font-size', '11px');

  encoderCheckbox = createCheckbox('Rotary Encoder', false);
  encoderCheckbox.parent(parentEl);
  encoderCheckbox.style('font-size', '11px');

  // A textarea, because an idle animation needs more than one line to describe.
  idleInput = createElement('textarea');
  idleInput.parent(parentEl);
  idleInput.attribute('placeholder',
    'What plays while no expression is triggered? Blink every 3 s, slow gaze drift...');
  idleInput.style('font-size', '12px');
  idleInput.style('font-family', 'Arial, Helvetica, sans-serif');
  idleInput.style('resize', 'none');
  idleInput.input(noteEdit);

  // The export screen: a read-only text box the learner can select and copy.
  exportArea = createElement('textarea');
  exportArea.parent(parentEl);
  exportArea.attribute('readonly', '');
  exportArea.style('font-size', '12px');
  exportArea.style('font-family', 'monospace');

  backButton = createButton('Back to Worksheet');
  backButton.parent(parentEl);
  backButton.mousePressed(closeExport);

  selectAllButton = createButton('Select All Text');
  selectAllButton.parent(parentEl);
  selectAllButton.mousePressed(selectExportText);

  positionControls();
  refreshControlStates();

  describe(
    'A planning worksheet for the capstone robot face project. The learner ' +
    'types a name and a rough parameter note for each expression they plan to ' +
    'build, adds or removes rows, picks a target display and one or more ' +
    'physical control inputs, and describes an idle animation. A Plan ' +
    'Completeness panel shows five capstone requirements and turns each one ' +
    'green as it is met. An export button assembles everything into plain ' +
    'text that can be pasted into a documentation file.'
  );
}

// A single handler is enough: any keystroke simply redraws the panel.
function noteEdit() {
  refreshControlStates();
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

// True when there is room for the summary and the completeness panel to sit
// side by side. Below this the two stack, requirements first.
function isWideLayout() {
  return canvasWidth >= 700;
}

function positionControls() {
  const top = drawHeight + 6;
  const btnW = min(140, floor((canvasWidth - 32) / 3));

  addButton.size(btnW, 24);
  addButton.position(8, top);
  exportButton.size(btnW, 24);
  exportButton.position(16 + btnW, top);
  clearButton.size(btnW, 24);
  clearButton.position(24 + btnW * 2, top);

  confirmClearButton.size(btnW, 24);
  confirmClearButton.position(8, top);
  cancelClearButton.size(btnW, 24);
  cancelClearButton.position(16 + btnW, top);

  // Expression rows. The note field takes the wider share, because a useful
  // parameter note is longer than an expression name.
  const available = max(120, canvasWidth - 72);
  const nameW = max(84, floor(available * 0.34));
  const noteW = max(90, available - nameW);
  const rowsTop = drawHeight + 36;

  for (let i = 0; i < MAX_ROWS; i++) {
    const y = rowsTop + i * ROW_H;
    exprNameInputs[i].size(nameW, 18);
    exprNameInputs[i].position(30, y + 2);
    exprNoteInputs[i].size(noteW, 18);
    exprNoteInputs[i].position(36 + nameW, y + 2);
    exprDropButtons[i].size(20, 20);
    exprDropButtons[i].position(42 + nameW + noteW, y + 2);
  }

  const fieldX = 112;
  displayTargetSelect.size(min(215, canvasWidth - fieldX - 10), 24);
  displayTargetSelect.position(fieldX, drawHeight + 284);

  // The three checkboxes share one line. On a narrow canvas the canvas label
  // to their left is dropped so all three still fit.
  const cbX = canvasWidth >= 430 ? fieldX : 8;
  buttonCheckbox.position(cbX, drawHeight + 318);
  potCheckbox.position(cbX + 96, drawHeight + 318);
  encoderCheckbox.position(cbX + 192, drawHeight + 318);

  idleInput.size(max(120, canvasWidth - fieldX - 10), 34);
  idleInput.position(fieldX, drawHeight + 344);

  // Export screen
  exportArea.size(canvasWidth - 20, canvasHeight - 118);
  exportArea.position(10, 62);
  backButton.position(10, canvasHeight - 44);
  selectAllButton.position(160, canvasHeight - 44);
}

// ---------------------------------------------------------------------------
// Worksheet data
// ---------------------------------------------------------------------------

// Every visible row that has been given a name, in worksheet order.
function namedExpressions() {
  const list = [];
  for (let i = 0; i < rowCount; i++) {
    const nm = exprNameInputs[i].value().trim();
    if (nm.length > 0) {
      list.push({ name: nm, note: exprNoteInputs[i].value().trim() });
    }
  }
  return list;
}

// The control inputs the learner has ticked, as plain labels.
function chosenSchemes() {
  const picked = [];
  if (buttonCheckbox.checked()) picked.push('Push Button');
  if (potCheckbox.checked()) picked.push('Potentiometer');
  if (encoderCheckbox.checked()) picked.push('Rotary Encoder');
  return picked;
}

// The five capstone requirements, re-evaluated on every frame so the panel is
// always in step with what is typed in the fields below it.
function completenessRows() {
  const named = namedExpressions();
  const withNotes = named.filter(function (e) { return e.note.length > 0; });
  const schemes = chosenSchemes();
  const idleText = idleInput.value().trim();

  return [
    {
      label: REQUIRED_EXPRESSIONS + '+ expressions named',
      detail: named.length + ' of ' + REQUIRED_EXPRESSIONS + ' named',
      done: named.length >= REQUIRED_EXPRESSIONS
    },
    {
      label: 'A design note on every one',
      detail: withNotes.length + ' of ' + max(named.length, 1) + ' have notes',
      done: named.length > 0 && withNotes.length === named.length
    },
    {
      label: 'Target display chosen',
      detail: displayTargetSelect.value() === ''
        ? 'nothing chosen yet'
        : displayTargetSelect.value(),
      done: displayTargetSelect.value() !== ''
    },
    {
      label: 'Control scheme chosen',
      detail: schemes.length === 0 ? 'nothing ticked yet' : schemes.join(', '),
      done: schemes.length > 0
    },
    {
      label: 'Idle animation described',
      detail: idleText.length === 0
        ? 'nothing written yet'
        : idleText.length + ' characters written',
      done: idleText.length > 0
    }
  ];
}

function completeCount() {
  return completenessRows().filter(function (r) { return r.done; }).length;
}

// ---------------------------------------------------------------------------
// Row actions
// ---------------------------------------------------------------------------
function addExpressionRow() {
  if (rowCount < MAX_ROWS) {
    rowCount++;
    refreshControlStates();
  }
}

// Removing a row shifts everything below it up one slot, so the numbering
// stays continuous and no typed text is silently orphaned.
function dropExpressionRow(index) {
  if (rowCount <= 1) {
    // The last row is emptied rather than deleted; a worksheet always shows one.
    exprNameInputs[0].value('');
    exprNoteInputs[0].value('');
    refreshControlStates();
    return;
  }
  for (let i = index; i < rowCount - 1; i++) {
    exprNameInputs[i].value(exprNameInputs[i + 1].value());
    exprNoteInputs[i].value(exprNoteInputs[i + 1].value());
  }
  exprNameInputs[rowCount - 1].value('');
  exprNoteInputs[rowCount - 1].value('');
  rowCount--;
  refreshControlStates();
}

// ---------------------------------------------------------------------------
// Clear, with a confirmation step so one stray click cannot erase the plan
// ---------------------------------------------------------------------------
function askToClear() {
  clearPending = true;
  refreshControlStates();
}

function cancelClear() {
  clearPending = false;
  refreshControlStates();
}

function clearWorksheet() {
  for (let i = 0; i < MAX_ROWS; i++) {
    exprNameInputs[i].value('');
    exprNoteInputs[i].value('');
  }
  rowCount = 1;
  displayTargetSelect.selected('');
  buttonCheckbox.checked(false);
  potCheckbox.checked(false);
  encoderCheckbox.checked(false);
  idleInput.value('');
  clearPending = false;
  refreshControlStates();
}

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

// Assemble every field into a plain-text plan. This is deliberately simple
// string building, the same thing a student would do by hand.
function buildPlanText() {
  const named = namedExpressions();
  const schemes = chosenSchemes();
  const idleText = idleInput.value().trim();
  const rows = completenessRows();
  const out = [];

  out.push('CAPSTONE PROJECT PLAN');
  out.push('=====================');
  out.push('');
  out.push('EXPRESSION SET (' + named.length + ' named)');
  if (named.length === 0) {
    out.push('  (no expressions named yet)');
  } else {
    for (let i = 0; i < named.length; i++) {
      const note = named[i].note.length > 0 ? named[i].note : '(no design note yet)';
      out.push('  ' + (i + 1) + '. ' + named[i].name + ' - ' + note);
    }
  }
  out.push('');
  out.push('TARGET DISPLAY');
  out.push('  ' + (displayTargetSelect.value() === ''
    ? '(not chosen yet)' : displayTargetSelect.value()));
  out.push('');
  out.push('CONTROL SCHEME');
  out.push('  ' + (schemes.length === 0 ? '(not chosen yet)' : schemes.join(', ')));
  out.push('');
  out.push('IDLE ANIMATION');
  out.push('  ' + (idleText.length === 0 ? '(not described yet)' : idleText));
  out.push('');
  out.push('PLAN COMPLETENESS');
  for (let i = 0; i < rows.length; i++) {
    out.push('  [' + (rows[i].done ? 'x' : ' ') + '] ' + rows[i].label +
      ' - ' + rows[i].detail);
  }
  return out.join('\n');
}

function openExport() {
  exportArea.value(buildPlanText());
  showingExport = true;
  refreshControlStates();
}

function closeExport() {
  showingExport = false;
  refreshControlStates();
}

function selectExportText() {
  exportArea.elt.focus();
  exportArea.elt.select();
}

// ---------------------------------------------------------------------------
// Control visibility
// ---------------------------------------------------------------------------
function showEl(el, visible) {
  if (visible) {
    el.show();
  } else {
    el.hide();
  }
}

function refreshControlStates() {
  const editing = !showingExport;

  showEl(addButton, editing && !clearPending);
  showEl(exportButton, editing && !clearPending);
  showEl(clearButton, editing && !clearPending);
  showEl(confirmClearButton, editing && clearPending);
  showEl(cancelClearButton, editing && clearPending);

  for (let i = 0; i < MAX_ROWS; i++) {
    const visible = editing && i < rowCount;
    showEl(exprNameInputs[i], visible);
    showEl(exprNoteInputs[i], visible);
    showEl(exprDropButtons[i], visible);
  }

  showEl(displayTargetSelect, editing);
  showEl(buttonCheckbox, editing);
  showEl(potCheckbox, editing);
  showEl(encoderCheckbox, editing);
  showEl(idleInput, editing);

  showEl(exportArea, showingExport);
  showEl(backButton, showingExport);
  showEl(selectAllButton, showingExport);

  // Once every row exists there is nothing left to add.
  if (rowCount >= MAX_ROWS) {
    addButton.attribute('disabled', '');
  } else {
    addButton.removeAttribute('disabled');
  }
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------
function draw() {
  updateCanvasSize();
  if (canvasWidth !== lastWidth) {
    lastWidth = canvasWidth;
    resizeCanvas(canvasWidth, canvasHeight);
    positionControls();
  }

  if (showingExport) {
    drawExportScreen();
    return;
  }

  stroke('silver');
  fill('aliceblue');
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  drawTitle();
  if (isWideLayout()) {
    const panelW = floor(canvasWidth * 0.4) - margin;
    const panelX = canvasWidth - panelW - margin;
    drawSummary(margin, 38, panelX - margin - 12);
    drawCompletenessPanel(panelX, 38, panelW, drawHeight - 48);
  } else {
    // Narrow: requirements come first so the checklist is what students see.
    const panelH = 152;
    drawCompletenessPanel(margin, 34, canvasWidth - 2 * margin, panelH);
    drawSummary(margin, 34 + panelH + 8, canvasWidth - 2 * margin);
  }

  drawWorksheetLabels();
}

function drawTitle() {
  noStroke();
  fill('black');
  textAlign(LEFT, TOP);
  textSize(isWideLayout() ? 20 : 16);
  text('Capstone Planning Worksheet', margin, 8);
  textSize(defaultTextSize);
}

// A running readout of what the learner has actually typed so far.
function drawSummary(x, y, w) {
  const named = namedExpressions();
  const schemes = chosenSchemes();
  const idleText = idleInput.value().trim();
  let cy = y;

  noStroke();
  textAlign(LEFT, TOP);

  fill('#00695C');
  textSize(13);
  text('Your plan so far', x, cy);
  cy += 19;

  fill('#263238');
  textSize(12);
  const nameList = named.length === 0
    ? 'No expressions named yet. Type a name in the first row below.'
    : named.map(function (e) { return e.name; }).join(', ');
  const nameLine = 'Expressions (' + named.length + '): ' + nameList;
  // Grow the block only as far as the wrapped text actually needs.
  const nameBoxH = constrain(ceil(textWidth(nameLine) / max(60, w)) * 15, 16, 60);
  text(nameLine, x, cy, w, nameBoxH);
  cy += nameBoxH + 6;

  text('Target display: ' + (displayTargetSelect.value() === ''
    ? 'not chosen' : displayTargetSelect.value()), x, cy, w, 16);
  cy += 18;

  text('Control input: ' + (schemes.length === 0
    ? 'not chosen' : schemes.join(', ')), x, cy, w, 16);
  cy += 18;

  const idleShown = idleText.length === 0 ? 'not described yet' : idleText;
  text('Idle animation: ' + idleShown, x, cy, w, isWideLayout() ? 56 : 30);
  cy += isWideLayout() ? 58 : 32;

  if (isWideLayout()) {
    fill('#546E7A');
    textSize(11);
    text('Plan the smallest version that would still count as finished, then ' +
      'add stretch goals. Nothing here is locked in - a plan is meant to be ' +
      'edited.', x, cy, w, 40);
  }
  textSize(defaultTextSize);
}

// Five requirement rows. An open circle means not yet; a green check means done.
function drawCompletenessPanel(x, y, w, h) {
  const rows = completenessRows();
  const done = rows.filter(function (r) { return r.done; }).length;

  fill(255, 255, 255, 235);
  stroke(200);
  rect(x, y, w, h, 8);
  noStroke();

  textAlign(LEFT, TOP);
  fill('black');
  textSize(13);
  text('Plan Completeness  (' + done + ' of 5)', x + 10, y + 8);

  const rowTop = y + 30;
  const rowH = 23;
  for (let i = 0; i < rows.length; i++) {
    const ry = rowTop + i * rowH;
    const cx = x + 19;
    const cy = ry + 8;

    if (rows[i].done) {
      // Filled green circle with a check mark drawn inside it.
      noStroke();
      fill('#2E7D32');
      ellipse(cx, cy, 14, 14);
      stroke('white');
      strokeWeight(2);
      noFill();
      beginShape();
      vertex(cx - 4, cy);
      vertex(cx - 1, cy + 3);
      vertex(cx + 4, cy - 4);
      endShape();
      strokeWeight(1);
    } else {
      noFill();
      stroke('#90A4AE');
      strokeWeight(2);
      ellipse(cx, cy, 14, 14);
      strokeWeight(1);
    }

    noStroke();
    fill(rows[i].done ? '#1B5E20' : '#37474F');
    textSize(12);
    text(rows[i].label, x + 32, ry + 1, w - 42, 14);

    fill('#78909C');
    textSize(10);
    text(rows[i].detail, x + 32, ry + 13, w - 42, 12);
  }

  // A closing line of guidance, only where the panel is tall enough for it.
  const noteY = rowTop + rows.length * rowH + 4;
  if (noteY + 30 < y + h) {
    noStroke();
    fill(done === 5 ? '#1B5E20' : '#546E7A');
    textSize(11);
    text(done === 5
      ? 'Every requirement is met. Export the plan and start building.'
      : 'Fill in the worksheet below and these checks turn green as you type.',
      x + 10, noteY, w - 20, y + h - noteY - 6);
  }
  textSize(defaultTextSize);
}

// The static labels drawn behind the form fields in the control strip.
function drawWorksheetLabels() {
  noStroke();
  textAlign(LEFT, TOP);

  // The clear confirmation replaces the usual hint line.
  fill(clearPending ? '#B71C1C' : 'dimgray');
  textSize(12);
  const hintX = 32 + min(140, floor((canvasWidth - 32) / 3)) * 3;
  if (clearPending) {
    text('Erase every field?', hintX, drawHeight + 11, canvasWidth - hintX - 8, 16);
  } else if (canvasWidth >= 620) {
    text('Row ' + rowCount + ' of ' + MAX_ROWS, hintX, drawHeight + 11,
      canvasWidth - hintX - 8, 16);
  }

  // Numbered expression rows, plus a hint in the empty space below them.
  const rowsTop = drawHeight + 36;
  textAlign(RIGHT, TOP);
  fill('#455A64');
  textSize(11);
  for (let i = 0; i < rowCount; i++) {
    text(String(i + 1) + '.', 8, rowsTop + i * ROW_H + 6, 16, 14);
  }
  textAlign(LEFT, TOP);

  if (rowCount < MAX_ROWS) {
    const emptyTop = rowsTop + rowCount * ROW_H;
    const emptyBottom = rowsTop + MAX_ROWS * ROW_H;
    noFill();
    stroke('#CFD8DC');
    rect(8, emptyTop + 4, canvasWidth - 16, emptyBottom - emptyTop - 8, 6);
    noStroke();
    fill('#90A4AE');
    textSize(12);
    const need = max(0, REQUIRED_EXPRESSIONS - namedExpressions().length);
    text(need > 0
      ? 'Press Add Expression for another row. ' + need +
        ' more named expression' + (need === 1 ? '' : 's') + ' to go.'
      : 'You have the required eight. Add more rows here for stretch goals.',
      16, emptyTop + 12, canvasWidth - 32, 32);
  }

  // Field labels for the three lower controls.
  fill('#263238');
  textSize(12);
  text('Target Display', 8, drawHeight + 290, 100, 16);
  if (canvasWidth >= 430) {
    text('Control Scheme', 8, drawHeight + 322, 100, 16);
  }
  text('Idle Animation', 8, drawHeight + 348, 100, 16);
  textSize(defaultTextSize);
}

// A full-canvas screen holding the exported plan as copyable plain text.
function drawExportScreen() {
  stroke('silver');
  fill('white');
  rect(0, 0, canvasWidth, canvasHeight);
  noStroke();

  const done = completeCount();

  textAlign(LEFT, TOP);
  fill('black');
  textSize(17);
  text('Your Capstone Plan as Plain Text', margin, 10);

  textSize(12);
  fill(done === 5 ? '#1B5E20' : '#E65100');
  text(done === 5
    ? 'All five requirements are met. Copy this into your project documentation.'
    : 'Warning: only ' + done + ' of the 5 requirements are met so far. This is ' +
      'a work-in-progress plan, which is fine - just come back and finish it.',
    margin, 36, canvasWidth - 2 * margin, 24);

  textSize(defaultTextSize);
}
