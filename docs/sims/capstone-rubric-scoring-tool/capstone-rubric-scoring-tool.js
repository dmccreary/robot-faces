// Capstone Rubric Scoring Tool
// Chapter 16: Computational Thinking & Capstone Design
// Bloom level: Evaluate (L5) - judge, assess, justify, critique
// Interaction: a rubric rater. The learner reads a classmate's capstone plan,
// rates it against all twelve criteria, writes a justification for every one,
// then composes those justifications into a peer-review summary to hand over.
//
// CANVAS_HEIGHT: 720

// ---------------------------------------------------------------------------
// Layout. The total height is fixed so the iframe never clips. The rubric
// rows need more vertical room on a narrow screen, so drawHeight and
// controlHeight are recomputed by layoutControls() whenever the width changes.
// ---------------------------------------------------------------------------
let canvasWidth = 800;
let canvasHeight = 720;          // fixed total: matches CANVAS_HEIGHT above
let drawHeight = 466;            // recomputed by layoutControls()
let controlHeight = 254;         // recomputed by layoutControls()
let margin = 10;
let defaultTextSize = 16;

// ---------------------------------------------------------------------------
// The extended capstone rubric: Chapter 11's original seven criteria, then
// five that only make sense once a whole project is under review.
// ---------------------------------------------------------------------------
const CRITERIA = [
  { name: 'Immediate identifiability',
    question: 'Would a classmate name each emotion in about two seconds?' },
  { name: 'Confusable-neighbor distance',
    question: 'Is every expression clearly distinct from its nearest neighbor?' },
  { name: 'Classroom-distance readability',
    question: 'Would these faces still read from the back of the room?' },
  { name: 'Lighting robustness',
    question: 'Would the design survive bright, flat classroom lighting?' },
  { name: 'Appropriate intensity',
    question: 'Does each expression match its moment instead of maxing out?' },
  { name: 'Deliberate symmetry',
    question: 'Where the plan is asymmetric, does that look intentional?' },
  { name: 'Face-only clarity',
    question: 'Does it work with no voice, sound, or motion to help?' },
  { name: 'Expression set completeness',
    question: 'Does the plan reach the required eight distinct expressions?' },
  { name: 'Idle animation naturalness',
    question: 'Is the idle animation described well enough to look natural?' },
  { name: 'Control responsiveness',
    question: 'Will the chosen input respond promptly and predictably?' },
  { name: 'Documentation clarity',
    question: 'Could a reviewer who has never seen the code follow this plan?' },
  { name: 'Original personality',
    question: 'Does the plan read as the designer\'s own, not a copy?' }
];

const RATINGS = ['Needs Work', 'Developing', 'Solid', 'Excellent'];

// Rating colors, chosen so the four steps are distinguishable by lightness as
// well as hue for readers who do not separate red from green.
const RATING_COLORS = ['#EF9A9A', '#FFE082', '#A5D6A7', '#4DB6AC'];

// ---------------------------------------------------------------------------
// Four pre-authored capstone plans of very different quality. These are the
// object under review, so each one is written the way a real classmate's
// planning worksheet export would look.
// ---------------------------------------------------------------------------
const PLANS = [
  {
    label: 'Plan A - Rowan (rough draft)',
    author: 'Rowan',
    expressions: [
      { name: 'happy', note: 'big smile' },
      { name: 'sad', note: 'mouth curve down' },
      { name: 'angry', note: 'brows down' },
      { name: 'surprised', note: 'brows up, eyes big' },
      { name: 'afraid', note: 'brows up, eyes big' },
      { name: 'neutral', note: 'flat everything' }
    ],
    display: 'OLED 128x64 monochrome',
    control: 'Push Button',
    idle: 'The face does something when nothing else is happening. Probably a ' +
      'blink. I will figure out the timing once the expressions are working.'
  },
  {
    label: 'Plan B - Priya (complete)',
    author: 'Priya',
    expressions: [
      { name: 'happy', note: 'brows +6, eyes 12, mouth +8' },
      { name: 'content', note: 'brows +2, eyes 9, mouth +3, lower intensity than happy' },
      { name: 'sad', note: 'brows +4 inner raise, eyes 10, mouth -7' },
      { name: 'angry', note: 'brows -9, eyes 9, mouth -4, narrow eyes' },
      { name: 'surprised', note: 'brows +11, eyes 18, mouth open' },
      { name: 'afraid', note: 'brows +9, eyes 17, mouth -2 pulled, not open' },
      { name: 'tired', note: 'eyelid cover 0.5, brows 0, mouth -2' },
      { name: 'curious', note: 'brows (+8, -2) asymmetric, eyes 12, mouth +1' },
      { name: 'smug', note: 'brows (+5, +1), eyes 10, one-sided mouth +5' }
    ],
    display: 'Both displays',
    control: 'Push Button, Potentiometer',
    idle: 'A blink every 3 to 5 seconds, 4 frames closing and 4 opening on ' +
      'ticks_ms() timing, plus a slow gaze drift of 3 pixels left and right ' +
      'over about 6 seconds. The blink pauses while a button press is being ' +
      'handled so the two never fight over the frame buffer.'
  },
  {
    label: 'Plan C - Dev (very ambitious)',
    author: 'Dev',
    expressions: [
      { name: 'happy', note: 'smile' },
      { name: 'joyful', note: 'bigger smile' },
      { name: 'delighted', note: 'biggest smile' },
      { name: 'sad', note: 'frown' },
      { name: 'miserable', note: 'bigger frown' },
      { name: 'angry', note: 'brows down' },
      { name: 'furious', note: 'brows way down' },
      { name: 'surprised', note: 'eyes big' },
      { name: 'shocked', note: 'eyes bigger' },
      { name: 'afraid', note: 'eyes big, brows up' },
      { name: 'confused', note: 'one brow up' },
      { name: 'sleepy', note: 'eyes half closed' },
      { name: 'bored', note: 'eyes half closed' },
      { name: 'excited', note: 'everything moving' }
    ],
    display: 'Both displays',
    control: 'Rotary Encoder',
    idle: 'Blink, gaze drift, eyebrow twitch, a pulsing glow behind the eyes, ' +
      'and an occasional head-shake wobble, all layered and running at once ' +
      'on both displays at 30 frames per second.'
  },
  {
    label: 'Plan D - Maya (minimum viable)',
    author: 'Maya',
    expressions: [
      { name: 'happy', note: 'brows +6, eyes 12, mouth +8' },
      { name: 'sad', note: 'brows +4 inner, eyes 10, mouth -7' },
      { name: 'angry', note: 'brows -9, eyes 9, mouth -4' },
      { name: 'surprised', note: 'brows +11, eyes 18, mouth open' },
      { name: 'afraid', note: 'brows +9, eyes 16, mouth -2 pulled' },
      { name: 'neutral', note: 'brows 0, eyes 11, mouth 0' },
      { name: 'tired', note: 'eyelid cover 0.5, brows -1, mouth -2' },
      { name: 'disgust', note: 'brows -5, eyes 8, mouth -6 one-sided' }
    ],
    display: 'OLED 128x64 monochrome',
    control: 'Push Button',
    idle: 'A blink every 4 seconds using ticks_ms(), 3 frames to close and 3 ' +
      'to open. Nothing else moves, so the triggered expression is always the ' +
      'thing the viewer notices first.'
  }
];

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
let planSelect;
let composeButton;
let newReviewButton;
let prevPageButton;
let nextPageButton;
let ratingButtons = [];          // 12 rows of 4
let reasonInputs = [];           // 12 short-text justification fields

// Feedback screen
let feedbackArea;
let backButton;
let selectAllButton;

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let planIndex = 0;
let ratings = [];                // one rating string per criterion, '' = unrated
let page = 0;
let showingFeedback = false;
let lastWidth = 0;

// Control geometry, refreshed by layoutControls()
let rowMode = 'wide';            // 'wide' | 'medium' | 'narrow'
let rowH = 30;
let headerH = 34;
let perPage = 6;

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
function setup() {
  updateCanvasSize();
  const cnv = createCanvas(canvasWidth, canvasHeight);
  const parentEl = document.querySelector('main');
  cnv.parent(parentEl);

  planSelect = createSelect();
  planSelect.parent(parentEl);
  for (let i = 0; i < PLANS.length; i++) {
    planSelect.option(PLANS[i].label, String(i));
  }
  planSelect.selected('0');
  planSelect.style('font-size', '12px');
  planSelect.changed(loadPlan);

  composeButton = createButton('Compose Peer Feedback');
  composeButton.parent(parentEl);
  composeButton.style('font-size', '12px');
  composeButton.mousePressed(composeFeedback);

  newReviewButton = createButton('Start New Review');
  newReviewButton.parent(parentEl);
  newReviewButton.style('font-size', '12px');
  newReviewButton.mousePressed(startNewReview);

  prevPageButton = createButton('Previous');
  prevPageButton.parent(parentEl);
  prevPageButton.style('font-size', '11px');
  prevPageButton.mousePressed(previousPage);

  nextPageButton = createButton('Next Criteria');
  nextPageButton.parent(parentEl);
  nextPageButton.style('font-size', '11px');
  nextPageButton.mousePressed(nextPage);

  // One row of controls per rubric criterion.
  for (let row = 0; row < CRITERIA.length; row++) {
    ratings.push('');
    const quartet = [];
    for (let k = 0; k < RATINGS.length; k++) {
      const btn = createButton(RATINGS[k]);
      btn.parent(parentEl);
      btn.style('font-size', '11px');
      btn.style('padding', '2px 4px');
      btn.style('white-space', 'nowrap');   // keep "Needs Work" on one line
      btn.style('box-sizing', 'border-box');  // so size() means the real width
      btn.mousePressed(function () { setRating(row, RATINGS[k]); });
      quartet.push(btn);
    }
    ratingButtons.push(quartet);

    const box = createInput('');
    box.parent(parentEl);
    box.attribute('placeholder', 'Why this rating? (required)');
    box.style('font-size', '11px');
    box.style('box-sizing', 'border-box');
    box.input(refreshControlStates);
    reasonInputs.push(box);
  }

  feedbackArea = createElement('textarea');
  feedbackArea.parent(parentEl);
  feedbackArea.attribute('readonly', '');
  feedbackArea.style('font-size', '12px');
  feedbackArea.style('font-family', 'monospace');

  backButton = createButton('Back to Review');
  backButton.parent(parentEl);
  backButton.mousePressed(closeFeedback);

  selectAllButton = createButton('Select All Text');
  selectAllButton.parent(parentEl);
  selectAllButton.mousePressed(selectFeedbackText);

  layoutControls();
  positionControls();
  refreshControlStates();

  describe(
    'A peer-review tool for capstone project plans. A dropdown loads one of ' +
    'four sample classmate plans, each showing its planned expression list ' +
    'with parameter notes, its target display, its control scheme, and its ' +
    'idle-animation description. The learner rates the plan against twelve ' +
    'rubric criteria, choosing Needs Work, Developing, Solid, or Excellent ' +
    'and typing a written justification for each. Once every criterion has ' +
    'both, a compose button assembles the learner\'s own justifications into ' +
    'a single written peer-review summary to hand to the plan\'s author.'
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
  refreshControlStates();
}

// A wide strip fits a whole rubric row on one line. A medium one needs the
// criterion name on its own line. A narrow one needs three lines per row.
function layoutControls() {
  if (canvasWidth >= 640) {
    rowMode = 'wide';
    rowH = 30;
    perPage = 6;
    headerH = 34;
  } else if (canvasWidth >= 460) {
    rowMode = 'medium';
    rowH = 52;
    perPage = 5;
    headerH = 64;
  } else {
    rowMode = 'narrow';
    rowH = 74;
    perPage = 4;
    headerH = 64;
  }
  page = min(page, pageCount() - 1);
  controlHeight = headerH + perPage * rowH + 34 + 8;
  drawHeight = canvasHeight - controlHeight;
}

function pageCount() {
  return ceil(CRITERIA.length / perPage);
}

function positionControls() {
  const top = drawHeight + 5;
  const selW = min(230, canvasWidth - 20);

  planSelect.size(selW, 24);
  planSelect.position(10, top);
  if (headerH === 34) {
    composeButton.position(selW + 20, top);
    newReviewButton.position(selW + 190, top);
  } else {
    composeButton.position(10, top + 30);
    newReviewButton.position(180, top + 30);
  }

  // Rating-button widths, sized to their labels at an 11px font.
  const bw = [80, 80, 52, 70];
  const buttonStripW = bw[0] + bw[1] + bw[2] + bw[3] + 6;   // 6 = three 2px gaps
  const rowTop = drawHeight + headerH;

  for (let row = 0; row < CRITERIA.length; row++) {
    const slot = row % perPage;
    const y = rowTop + slot * rowH;
    const quartet = ratingButtons[row];

    let bx = 8;
    let by = y + 4;
    let inputX = 0;
    let inputY = 0;
    let inputW = 0;

    if (rowMode === 'wide') {
      bx = 158;                       // clear of the criterion name on the left
      by = y + 4;
      inputX = bx + buttonStripW + 8;
      inputY = y + 4;
      inputW = max(90, canvasWidth - inputX - 12);
    } else if (rowMode === 'medium') {
      bx = 8;
      by = y + 26;                    // the name occupies the line above
      inputX = bx + buttonStripW + 8;
      inputY = y + 26;
      inputW = max(90, canvasWidth - inputX - 12);
    } else {
      bx = 8;
      by = y + 22;
      inputX = 8;
      inputY = y + 48;                // the justification gets its own line
      inputW = max(90, canvasWidth - 20);
    }

    let cursor = bx;
    for (let k = 0; k < RATINGS.length; k++) {
      quartet[k].size(bw[k], 21);
      quartet[k].position(cursor, by);
      cursor += bw[k] + 2;
    }

    reasonInputs[row].size(inputW, 19);
    reasonInputs[row].position(inputX, inputY);
  }

  // Page navigation sits on the last line of the control strip.
  const navY = drawHeight + headerH + perPage * rowH + 4;
  prevPageButton.size(78, 22);
  prevPageButton.position(10, navY);
  nextPageButton.size(96, 22);
  nextPageButton.position(94, navY);

  // Feedback screen
  feedbackArea.size(canvasWidth - 20, canvasHeight - 112);
  feedbackArea.position(10, 58);
  backButton.position(10, canvasHeight - 44);
  selectAllButton.position(160, canvasHeight - 44);
}

// ---------------------------------------------------------------------------
// Review logic
// ---------------------------------------------------------------------------
function setRating(row, value) {
  ratings[row] = value;
  refreshControlStates();
}

// Loading a different plan resets every rating and justification, because a
// judgment written about one project says nothing about another.
function loadPlan() {
  planIndex = int(planSelect.value());
  startNewReview();
}

function startNewReview() {
  for (let row = 0; row < CRITERIA.length; row++) {
    ratings[row] = '';
    reasonInputs[row].value('');
  }
  page = 0;
  showingFeedback = false;
  positionControls();
  refreshControlStates();
}

// A row counts as finished only with both a rating and a written reason.
function rowIsComplete(row) {
  return ratings[row] !== '' && reasonInputs[row].value().trim().length >= 3;
}

function completedRows() {
  let done = 0;
  for (let row = 0; row < CRITERIA.length; row++) {
    if (rowIsComplete(row)) done++;
  }
  return done;
}

function previousPage() {
  page = (page + pageCount() - 1) % pageCount();
  positionControls();
  refreshControlStates();
}

function nextPage() {
  page = (page + 1) % pageCount();
  positionControls();
  refreshControlStates();
}

// ---------------------------------------------------------------------------
// Composing the peer feedback. Every sentence in the output comes from the
// learner's own justification text - nothing here is generated for them.
// ---------------------------------------------------------------------------
function buildFeedbackText() {
  const plan = PLANS[planIndex];
  const out = [];
  const tally = [0, 0, 0, 0];

  out.push('PEER REVIEW OF ' + plan.label.toUpperCase());
  out.push('Reviewed against the extended capstone rubric, criterion by criterion.');
  out.push('');

  for (let row = 0; row < CRITERIA.length; row++) {
    const k = RATINGS.indexOf(ratings[row]);
    if (k >= 0) tally[k]++;
    out.push(padNumber(row + 1) + '. ' + CRITERIA[row].name + ' - ' + ratings[row]);
    out.push('    ' + reasonInputs[row].value().trim());
    out.push('');
  }

  out.push('RATING TALLY');
  for (let k = RATINGS.length - 1; k >= 0; k--) {
    out.push('  ' + RATINGS[k] + ': ' + tally[k]);
  }
  out.push('');
  out.push('Handed to ' + plan.author + ' before the final capstone demonstration.');
  return out.join('\n');
}

// Right-align single-digit criterion numbers so the list reads as a column.
function padNumber(n) {
  return n < 10 ? ' ' + n : String(n);
}

function composeFeedback() {
  if (completedRows() < CRITERIA.length) return;
  feedbackArea.value(buildFeedbackText());
  showingFeedback = true;
  refreshControlStates();
}

function closeFeedback() {
  showingFeedback = false;
  refreshControlStates();
}

function selectFeedbackText() {
  feedbackArea.elt.focus();
  feedbackArea.elt.select();
}

// ---------------------------------------------------------------------------
// Control visibility and enabled state
// ---------------------------------------------------------------------------
function setEnabled(el, enabled) {
  if (enabled) {
    el.removeAttribute('disabled');
  } else {
    el.attribute('disabled', '');
  }
}

function showEl(el, visible) {
  if (visible) {
    el.show();
  } else {
    el.hide();
  }
}

function refreshControlStates() {
  const reviewing = !showingFeedback;
  const first = page * perPage;
  const last = min(first + perPage, CRITERIA.length);

  showEl(planSelect, reviewing);
  showEl(composeButton, reviewing);
  showEl(newReviewButton, reviewing);
  showEl(prevPageButton, reviewing && pageCount() > 1);
  showEl(nextPageButton, reviewing && pageCount() > 1);

  for (let row = 0; row < CRITERIA.length; row++) {
    const onPage = reviewing && row >= first && row < last;
    for (let k = 0; k < RATINGS.length; k++) {
      const btn = ratingButtons[row][k];
      showEl(btn, onPage);
      // The chosen rating keeps its color, so a row's verdict reads at a glance.
      if (ratings[row] === RATINGS[k]) {
        btn.style('background-color', RATING_COLORS[k]);
        btn.style('font-weight', 'bold');
      } else {
        btn.style('background-color', '');
        btn.style('font-weight', 'normal');
      }
    }
    showEl(reasonInputs[row], onPage);
  }

  showEl(feedbackArea, showingFeedback);
  showEl(backButton, showingFeedback);
  showEl(selectAllButton, showingFeedback);

  setEnabled(composeButton, completedRows() === CRITERIA.length);
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------
function draw() {
  updateCanvasSize();
  if (canvasWidth !== lastWidth) {
    lastWidth = canvasWidth;
    resizeCanvas(canvasWidth, canvasHeight);
    layoutControls();
    positionControls();
    refreshControlStates();
  }

  if (showingFeedback) {
    drawFeedbackScreen();
    return;
  }

  stroke('silver');
  fill('aliceblue');
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  drawPlanCard();
  drawRubricRows();
  drawControlLabels();
}

// The plan under review, plus the guiding questions for the current page.
function drawPlanCard() {
  const plan = PLANS[planIndex];
  const wide = canvasWidth >= 700;

  noStroke();
  fill('black');
  textAlign(LEFT, TOP);
  textSize(wide ? 19 : 15);
  text('Peer Review: ' + plan.label, margin, 7, canvasWidth - 2 * margin, 24);
  textSize(defaultTextSize);

  const top = wide ? 36 : 30;
  const cardW = wide ? floor(canvasWidth * 0.52) - margin
                     : canvasWidth - 2 * margin;
  const cardH = drawHeight - top - 8;

  // The plan summary card, styled like a filled-in worksheet.
  fill(255, 255, 255, 240);
  stroke(200);
  rect(margin, top, cardW, cardH, 8);
  noStroke();

  const innerX = margin + 10;
  const wrapW = cardW - 20;
  let cy = top + 8;

  fill('#00695C');
  textSize(13);
  text('Planned expressions (' + plan.expressions.length + ')', innerX, cy);
  cy += 18;

  // On a short card the list is trimmed rather than allowed to overflow.
  const lineH = 14;
  const listRoom = floor((cardH - (cy - top) - 132) / lineH);
  const shown = min(plan.expressions.length, max(3, listRoom));
  textSize(11);
  for (let i = 0; i < shown; i++) {
    fill('#1A237E');
    text(plan.expressions[i].name, innerX + 4, cy, 78, lineH);
    fill('#37474F');
    text(plan.expressions[i].note, innerX + 84, cy, wrapW - 88, lineH);
    cy += lineH;
  }
  if (shown < plan.expressions.length) {
    fill('#78909C');
    text('... and ' + (plan.expressions.length - shown) + ' more',
      innerX + 4, cy, wrapW - 8, lineH);
    cy += lineH;
  }
  cy += 6;

  textSize(12);
  fill('#263238');
  text('Target display: ' + plan.display, innerX, cy, wrapW, 16);
  cy += 18;
  text('Control scheme: ' + plan.control, innerX, cy, wrapW, 16);
  cy += 20;

  fill('#00695C');
  textSize(13);
  text('Idle animation', innerX, cy);
  cy += 17;
  fill('#37474F');
  textSize(11);
  text(plan.idle, innerX, cy, wrapW, top + cardH - cy - 8);
  textSize(defaultTextSize);

  if (!wide) return;

  // Right-hand panel: the guiding questions for the criteria showing below.
  const panelX = margin + cardW + 10;
  const panelW = canvasWidth - panelX - margin;
  drawGuidingPanel(panelX, top, panelW, cardH);
}

function drawGuidingPanel(x, y, w, h) {
  const first = page * perPage;
  const last = min(first + perPage, CRITERIA.length);
  const done = completedRows();

  fill(255, 255, 255, 240);
  stroke(200);
  rect(x, y, w, h, 8);
  noStroke();
  textAlign(LEFT, TOP);

  let cy = y + 8;
  fill('#00695C');
  textSize(13);
  text('What each criterion asks', x + 10, cy);
  cy += 19;

  for (let row = first; row < last; row++) {
    fill(rowIsComplete(row) ? '#1B5E20' : '#263238');
    textSize(11.5);
    text((row + 1) + '. ' + CRITERIA[row].name +
      (rowIsComplete(row) ? '  (done)' : ''), x + 10, cy, w - 20, 15);
    cy += 15;
    fill('#607D8B');
    textSize(11);
    text(CRITERIA[row].question, x + 20, cy, w - 30, 28);
    cy += 30;
  }

  cy += 4;
  fill(done === CRITERIA.length ? '#1B5E20' : '#37474F');
  textSize(12);
  text(done === CRITERIA.length
    ? 'All 12 criteria rated and justified. Compose the peer feedback.'
    : done + ' of ' + CRITERIA.length + ' criteria rated and justified.',
    x + 10, cy, w - 20, 32);
  cy += 34;

  if (cy + 40 < y + h) {
    fill('#546E7A');
    textSize(11);
    text('A useful critique names the criterion, points at specific evidence ' +
      'in the plan, and suggests a next step. "Something feels off" gives the ' +
      'designer nothing to act on.', x + 10, cy, w - 20, y + h - cy - 8);
  }
  textSize(defaultTextSize);
}

// The criterion names drawn behind the rating buttons in the control strip.
function drawRubricRows() {
  const first = page * perPage;
  const last = min(first + perPage, CRITERIA.length);
  const rowTop = drawHeight + headerH;

  noStroke();
  textAlign(LEFT, TOP);
  for (let row = first; row < last; row++) {
    const slot = row % perPage;
    const y = rowTop + slot * rowH;

    if (slot % 2 === 1) {
      fill(245, 247, 250);
      rect(0, y, canvasWidth, rowH);
    }
    if (rowIsComplete(row)) {
      fill('#2E7D32');
      rect(0, y, 4, rowH);
    }

    fill('#263238');
    textSize(11);
    if (rowMode === 'wide') {
      text((row + 1) + '. ' + CRITERIA[row].name, 10, y + 6, 142, 24);
    } else {
      text((row + 1) + '. ' + CRITERIA[row].name, 10, y + 4, canvasWidth - 20, 18);
    }
  }
  textSize(defaultTextSize);
}

function drawControlLabels() {
  const first = page * perPage;
  const last = min(first + perPage, CRITERIA.length);
  const done = completedRows();
  const navY = drawHeight + headerH + perPage * rowH + 4;

  noStroke();
  textAlign(LEFT, TOP);

  // Header hint, next to the plan dropdown.
  fill('dimgray');
  textSize(11);
  if (headerH === 34) {
    text('Rate all 12, then compose feedback.',
      min(230, canvasWidth - 20) + 340, drawHeight + 11,
      max(40, canvasWidth - min(230, canvasWidth - 20) - 350), 16);
  }

  // Page indicator and progress, on the navigation line.
  fill('#37474F');
  textSize(11);
  const navX = pageCount() > 1 ? 200 : 10;
  const navLabel = canvasWidth >= 520
    ? 'Criteria ' + (first + 1) + '-' + last + ' of ' + CRITERIA.length +
      '   |   ' + done + ' of ' + CRITERIA.length + ' complete'
    : 'Criteria ' + (first + 1) + '-' + last + '/' + CRITERIA.length +
      '  |  ' + done + '/' + CRITERIA.length + ' done';
  text(navLabel, navX, navY + 5, max(40, canvasWidth - navX - 10), 16);

  textSize(defaultTextSize);
}

// The composed peer-review summary, ready to copy and hand over.
function drawFeedbackScreen() {
  stroke('silver');
  fill('white');
  rect(0, 0, canvasWidth, canvasHeight);
  noStroke();

  textAlign(LEFT, TOP);
  fill('black');
  textSize(17);
  text('Peer Feedback for ' + PLANS[planIndex].author, margin, 10);

  fill('#546E7A');
  textSize(12);
  text('Every line below is your own justification text, ordered by rubric ' +
    'criterion. Copy it and hand it to the presenter.',
    margin, 34, canvasWidth - 2 * margin, 20);
  textSize(defaultTextSize);
}
