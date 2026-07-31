// Rubric Rater - Score This Expression MicroSim
// Chapter 11: Expression Design, Readability & Human-Robot Interaction
// Bloom level: Evaluate (L5) - judge, assess, rate, justify
// Interaction: rubric scoring. The learner rates a sample face design against
// all seven Emotional Design Rubric criteria, writes a reason for every
// rating, then compares those judgments with the chapter's reference ratings.
//
// CANVAS_HEIGHT: 700

// ---------------------------------------------------------------------------
// Layout constants. The total height never changes. The rubric rows need more
// vertical room on a narrow screen, so drawHeight is recomputed every frame.
// ---------------------------------------------------------------------------
let canvasWidth = 800;
let canvasHeight = 700;          // fixed total: matches CANVAS_HEIGHT above
let drawHeight = 408;            // recomputed by layoutControls()
let controlHeight = 292;         // recomputed by layoutControls()
let margin = 10;
let defaultTextSize = 16;

// ---------------------------------------------------------------------------
// The seven criteria of the chapter's Emotional Design Rubric.
// ---------------------------------------------------------------------------
const CRITERIA = [
  { short: '1. Immediate identifiability',
    question: 'Is the emotion identifiable in about two seconds?', brief: '1. Identifiable in ~2 seconds?' },
  { short: '2. Confusable-neighbor distance',
    question: 'Is it distinguishable from its nearest confusable neighbor?', brief: '2. Distinct from its neighbor?' },
  { short: '3. Classroom-distance readability',
    question: 'Does it still read from across a room, not just close up?', brief: '3. Reads from across the room?' },
  { short: '4. Lighting robustness',
    question: 'Does it survive bright, flat classroom lighting?', brief: '4. Survives bright lighting?' },
  { short: '5. Appropriate intensity',
    question: 'Does the intensity match the moment instead of maxing out?', brief: '5. Intensity fits the moment?' },
  { short: '6. Deliberate symmetry',
    question: 'If it is asymmetric, does that look intentional?', brief: '6. Asymmetry looks deliberate?' },
  { short: '7. Face-only clarity',
    question: 'Does it work with no voice, motion, or sound to help?',
    brief: '7. Works with no voice or sound?' }
];

const RATINGS = ['Fails', 'Borderline', 'Passes'];

// ---------------------------------------------------------------------------
// Six sample designs of varying quality, each with the chapter's reference
// rating and reason for every criterion.
// ---------------------------------------------------------------------------
const SAMPLES = [
  {
    name: 'A. Whisper Smile (happy)',
    intent: 'Intended emotion: happy, for a robot acknowledging a right answer.',
    st: { eye_size: 8, eye_spacing: 44, gaze_offset_x: 0, eyebrow_angle: 1,
          mouth_curvature: 2 },
    ref: [
      { r: 'Borderline', why: 'A viewer sees a face right away but has to hunt for the smile, which costs more than two seconds.' },
      { r: 'Fails', why: 'Its nearest neighbor is neutral, and a curvature of 2 is not far enough from 0 to separate them.' },
      { r: 'Fails', why: 'The thumbnail loses the two-pixel curve completely, so the face reads as neutral from the back row.' },
      { r: 'Fails', why: 'A thin curve is the first thing flat, bright light washes out on a small display.' },
      { r: 'Borderline', why: 'Subtlety suits a quiet moment, but this sits below the smallest change the display can show.' },
      { r: 'Passes', why: 'The face is cleanly mirrored, and nothing here looks like an accidental slip.' },
      { r: 'Fails', why: 'With no voice or motion to help, a smile this faint carries no emotion on its own.' }
    ]
  },
  {
    name: 'B. Bold Grin (happy)',
    intent: 'Intended emotion: happy, for a robot celebrating a finished project.',
    st: { eye_size: 9, eye_spacing: 44, gaze_offset_x: 0, eyebrow_angle: 7,
          mouth_curvature: 9 },
    ref: [
      { r: 'Passes', why: 'The wide upward curve names the emotion instantly, which is why happy scores so well in the research.' },
      { r: 'Passes', why: 'Nothing else in the set pairs a strong smile with relaxed brows, so it stands well apart.' },
      { r: 'Passes', why: 'The mouth curve survives the shrunk thumbnail and still bends clearly upward.' },
      { r: 'Passes', why: 'A thick, high-contrast curve keeps its shape under bright, flat light.' },
      { r: 'Passes', why: 'A big moment gets a big expression, which is exactly the match this criterion asks for.' },
      { r: 'Passes', why: 'Symmetric by design, with both brows mirrored around the centerline.' },
      { r: 'Passes', why: 'The face alone communicates delight with no voice or motion needed.' }
    ]
  },
  {
    name: 'C. Afraid, borrowed from surprised',
    intent: 'Intended emotion: afraid, for a robot warning about a low battery.',
    st: { eye_size: 14, eye_spacing: 44, gaze_offset_x: 0, eyebrow_angle: 24,
          mouth_curvature: 8, mouth_open: true },
    ref: [
      { r: 'Borderline', why: 'Viewers read high alarm immediately, but many will name the wrong emotion.' },
      { r: 'Fails', why: 'These values are the surprised recipe. Afraid needs its own mouth shape to break the tie.' },
      { r: 'Passes', why: 'Every feature is large and bold, so the shape holds up at classroom distance.' },
      { r: 'Passes', why: 'Thick strokes and wide eyes keep their contrast under bright light.' },
      { r: 'Borderline', why: 'Maximum intensity fits an alarm, but leaves no room to show a stronger warning later.' },
      { r: 'Passes', why: 'The face is symmetric, and nothing looks like an accident.' },
      { r: 'Fails', why: 'Without a warning sound, the face alone reads as surprised rather than afraid.' }
    ]
  },
  {
    name: 'D. Anger at maximum',
    intent: 'Intended emotion: mild annoyance, for a robot asked the same question twice.',
    st: { eye_size: 5, eye_spacing: 44, gaze_offset_x: 0, eyebrow_angle: -30,
          mouth_curvature: -9 },
    ref: [
      { r: 'Passes', why: 'Nobody will miss this one: heavy low brows and narrow eyes read as anger at a glance.' },
      { r: 'Passes', why: 'It sits far from stern, its closest neighbor, because every value is pushed much further.' },
      { r: 'Passes', why: 'Steep brows and a deep frown stay legible in the shrunk thumbnail.' },
      { r: 'Passes', why: 'Large, high-contrast shapes hold up under flat classroom light.' },
      { r: 'Fails', why: 'The moment called for mild annoyance and the design answered with full rage.' },
      { r: 'Passes', why: 'Symmetric by design, with both brows mirrored.' },
      { r: 'Passes', why: 'The face alone carries the emotion, arguably far more than intended.' }
    ]
  },
  {
    name: 'E. Confused, or a coding slip?',
    intent: 'Intended emotion: confused, for a robot that did not understand a command.',
    st: { eye_size: 8, eye_spacing: 44, gaze_offset_x: 0,
          eyebrow_angle_left: 5, eyebrow_angle_right: 2, mouth_curvature: 0 },
    ref: [
      { r: 'Fails', why: 'A three-degree brow difference reads as a nearly neutral face, not as confusion.' },
      { r: 'Fails', why: 'Its neighbor is neutral, and almost nothing separates the two designs.' },
      { r: 'Fails', why: 'The tiny brow difference disappears entirely in the classroom-distance thumbnail.' },
      { r: 'Fails', why: 'A difference this small is lost to glare and low contrast before anything else is.' },
      { r: 'Fails', why: 'Confusion needs a visible mismatch, and this intensity is far below that floor.' },
      { r: 'Fails', why: 'The asymmetry is real but so small that it reads as a coding slip, not a decision.' },
      { r: 'Fails', why: 'With no other channel to lean on, the face alone says nothing clear.' }
    ]
  },
  {
    name: 'F. Sleepy at a sliver',
    intent: 'Intended emotion: sleepy, for a robot about to enter power-save mode.',
    st: { eye_size: 8, eye_spacing: 44, gaze_offset_x: 0, eyebrow_angle: -1,
          mouth_curvature: -1, eyelid: 0.86 },
    ref: [
      { r: 'Borderline', why: 'Close up the nearly closed eyes read as sleepy, but the cue is a very thin sliver.' },
      { r: 'Passes', why: 'Tired is the nearest neighbor, and this eyelid is clearly heavier than tired\'s half cover.' },
      { r: 'Fails', why: 'A one-pixel sliver of eye vanishes in the thumbnail, leaving a face with no eyes at all.' },
      { r: 'Fails', why: 'Glare on the glass swallows a sliver that thin before it swallows anything else.' },
      { r: 'Borderline', why: 'Deep sleepiness suits power-save mode, but the design pushed past what the display can show.' },
      { r: 'Passes', why: 'Both eyelids match, so the face is deliberately symmetric.' },
      { r: 'Borderline', why: 'The face carries the idea up close, but needs a dimming screen or a sound to be sure.' }
    ]
  }
];

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let sampleIndex = 0;
let ratings = [];                 // one of '', 'Fails', 'Borderline', 'Passes'
let submitted = false;
let comparing = false;
let comparePage = 0;

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
let sampleSelect;
let submitButton;
let compareButton;
let backButton;
let pageButton;
let ratingButtons = [];           // 7 rows of 3
let reasonInputs = [];            // 7 short-text fields

// Control geometry, refreshed by layoutControls()
let wideRows = true;
let rowH = 34;
let headerH = 42;

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
function setup() {
  updateCanvasSize();
  const cnv = createCanvas(canvasWidth, canvasHeight);
  const parentEl = document.querySelector('main');
  cnv.parent(parentEl);

  sampleSelect = createSelect();
  sampleSelect.parent(parentEl);
  for (let i = 0; i < SAMPLES.length; i++) {
    sampleSelect.option(SAMPLES[i].name, String(i));
  }
  sampleSelect.selected('0');
  sampleSelect.changed(loadSample);

  submitButton = createButton('Submit Assessment');
  submitButton.parent(parentEl);
  submitButton.mousePressed(submitAssessment);

  compareButton = createButton('Compare to Reference Rating');
  compareButton.parent(parentEl);
  compareButton.mousePressed(openCompare);

  backButton = createButton('Back to My Ratings');
  backButton.parent(parentEl);
  backButton.mousePressed(closeCompare);

  pageButton = createButton('Next Criteria');
  pageButton.parent(parentEl);
  pageButton.mousePressed(nextComparePage);

  // One row of controls per rubric criterion.
  for (let row = 0; row < CRITERIA.length; row++) {
    ratings.push('');
    const trio = [];
    for (let k = 0; k < RATINGS.length; k++) {
      const btn = createButton(RATINGS[k]);
      btn.parent(parentEl);
      btn.style('font-size', '11px');
      btn.mousePressed(function () { setRating(row, RATINGS[k]); });
      trio.push(btn);
    }
    ratingButtons.push(trio);

    const box = createInput('');
    box.parent(parentEl);
    box.attribute('placeholder', 'Why? (required)');
    box.style('font-size', '11px');
    box.input(refreshControlStates);      // typing can unlock Submit
    reasonInputs.push(box);
  }

  layoutControls();
  positionControls();
  refreshControlStates();

  describe(
    'A design critique tool. A sample robot face is rendered twice: once close ' +
    'up, and once as a small, low-contrast thumbnail that imitates viewing the ' +
    'display from across a lit classroom. The face_state parameters are listed ' +
    'below both. The learner rates the design against seven rubric criteria, ' +
    'choosing Fails, Borderline, or Passes and typing a reason for each, then ' +
    'compares every judgment with the chapter\'s own reference rating.'
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

// A wide strip fits a whole rubric row on one line. A narrow one needs two.
function layoutControls() {
  wideRows = canvasWidth >= 560;
  rowH = wideRows ? 34 : 56;
  headerH = canvasWidth >= 620 ? 42 : 78;
  controlHeight = headerH + CRITERIA.length * rowH + 12;
  drawHeight = canvasHeight - controlHeight;
}

function positionControls() {
  const top = drawHeight + 6;

  sampleSelect.size(min(250, canvasWidth - 20), 26);
  sampleSelect.position(10, top);
  if (canvasWidth >= 620) {
    submitButton.position(min(250, canvasWidth - 20) + 20, top);
    compareButton.position(min(250, canvasWidth - 20) + 155, top);
  } else {
    submitButton.position(10, top + 34);
    compareButton.position(145, top + 34);
  }

  const rowTop = drawHeight + headerH;
  for (let row = 0; row < CRITERIA.length; row++) {
    const y = rowTop + row * rowH;
    const trio = ratingButtons[row];
    if (wideRows) {
      trio[0].size(46, 22); trio[0].position(190, y + 4);
      trio[1].size(72, 22); trio[1].position(240, y + 4);
      trio[2].size(52, 22); trio[2].position(316, y + 4);
      reasonInputs[row].size(max(90, canvasWidth - 385), 20);
      reasonInputs[row].position(374, y + 4);
    } else {
      trio[0].size(46, 22); trio[0].position(8, y + 22);
      trio[1].size(72, 22); trio[1].position(58, y + 22);
      trio[2].size(52, 22); trio[2].position(134, y + 22);
      reasonInputs[row].size(max(80, canvasWidth - 202), 20);
      reasonInputs[row].position(192, y + 22);
    }
  }

  // The comparison screen replaces everything with its own two buttons.
  backButton.position(10, canvasHeight - 34);
  pageButton.position(170, canvasHeight - 34);
}

// ---------------------------------------------------------------------------
// Assessment logic
// ---------------------------------------------------------------------------
function setRating(row, value) {
  if (submitted) return;
  ratings[row] = value;
  refreshControlStates();
}

function loadSample() {
  sampleIndex = int(sampleSelect.value());
  for (let row = 0; row < CRITERIA.length; row++) {
    ratings[row] = '';
    reasonInputs[row].value('');
  }
  submitted = false;
  comparing = false;
  comparePage = 0;
  refreshControlStates();
}

// Every row needs both a rating and a written reason before this counts.
function rowsComplete() {
  let done = 0;
  for (let row = 0; row < CRITERIA.length; row++) {
    if (ratings[row] !== '' && reasonInputs[row].value().trim().length >= 3) {
      done++;
    }
  }
  return done;
}

function submitAssessment() {
  if (submitted || rowsComplete() < CRITERIA.length) return;
  submitted = true;
  refreshControlStates();
}

function openCompare() {
  if (!submitted) return;
  comparing = true;
  comparePage = 0;
  refreshControlStates();
}

function closeCompare() {
  comparing = false;
  refreshControlStates();
}

function comparePageCount() {
  return ceil(CRITERIA.length / comparePageSize());
}

function comparePageSize() {
  return canvasWidth >= 560 ? CRITERIA.length : 3;
}

function nextComparePage() {
  comparePage = (comparePage + 1) % comparePageCount();
}

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

// Keep every control's enabled and visible state in step with the mode.
function refreshControlStates() {
  const rating = !submitted && !comparing;

  showEl(sampleSelect, !comparing);
  showEl(submitButton, !comparing);
  showEl(compareButton, !comparing);
  showEl(backButton, comparing);
  showEl(pageButton, comparing && comparePageCount() > 1);

  for (let row = 0; row < CRITERIA.length; row++) {
    for (let k = 0; k < RATINGS.length; k++) {
      const btn = ratingButtons[row][k];
      showEl(btn, !comparing);
      setEnabled(btn, rating);
      // The chosen rating keeps a color so the row reads at a glance.
      if (ratings[row] === RATINGS[k]) {
        btn.style('background-color',
          k === 0 ? 'lightcoral' : (k === 1 ? 'khaki' : 'lightgreen'));
      } else {
        btn.style('background-color', '');
      }
    }
    showEl(reasonInputs[row], !comparing);
    setEnabled(reasonInputs[row], rating);
  }

  setEnabled(submitButton, !submitted && rowsComplete() === CRITERIA.length);
  setEnabled(compareButton, submitted);
}

// ---------------------------------------------------------------------------
// Face rendering. Every measurement is written in the 128 x 64 display's own
// pixel units and then scaled. The dim option fades the lit pixels toward gray
// to imitate a washed-out screen seen from across a lit room.
// ---------------------------------------------------------------------------
function drawFaceOn(x, y, w, h, st, opts) {
  const dim = (opts && opts.dim) ? opts.dim : 0;
  const inkC = lerpColor(color(255), color(150), dim);
  const bgC = lerpColor(color(12), color(88), dim);
  const sx = w / 128;
  const sy = h / 64;
  const px = function (dx) { return x + dx * sx; };
  const py = function (dy) { return y + dy * sy; };

  push();
  noStroke();
  fill(bgC);
  rect(x, y, w, h, 5);

  const eyeR = st.eye_size;
  const spacing = st.eye_spacing === undefined ? 44 : st.eye_spacing;
  const eyeCy = 27;
  const gaze = st.gaze_offset_x || 0;
  const eyes = [
    { cx: 64 - spacing / 2, side: -1 },
    { cx: 64 + spacing / 2, side: 1 }
  ];

  for (let i = 0; i < eyes.length; i++) {
    const cx = eyes[i].cx;

    noStroke();
    fill(inkC);
    ellipse(px(cx), py(eyeCy), eyeR * 2 * sx, eyeR * 2 * sy);

    fill(bgC);
    ellipse(px(cx + gaze), py(eyeCy), eyeR * 0.7 * sx, eyeR * 0.7 * sy);

    const lid = st.eyelid || 0;
    if (lid > 0) {
      rect(px(cx - eyeR - 1), py(eyeCy - eyeR - 1),
        (eyeR * 2 + 2) * sx, (eyeR * 2 * lid + 1) * sy);
    }

    // Eyebrow. A positive angle tilts the outer end up and lifts the whole
    // brow away from the eye; a negative angle drops the outer end and presses
    // the brow down onto the eye.
    const angle = eyes[i].side < 0
      ? (st.eyebrow_angle_left === undefined ? st.eyebrow_angle : st.eyebrow_angle_left)
      : (st.eyebrow_angle_right === undefined ? st.eyebrow_angle : st.eyebrow_angle_right);
    const a = angle || 0;
    const tilt = constrain(a * 0.13, -3.5, 3.5);
    const browY = constrain(eyeCy - eyeR - 4.5 - a * 0.26,
      3.5 + abs(tilt), eyeCy - eyeR - 0.5);
    stroke(inkC);
    strokeWeight(max(1.5, 3 * sy));
    if (eyes[i].side < 0) {
      line(px(cx - 11), py(browY - tilt), px(cx + 11), py(browY + tilt));
    } else {
      line(px(cx - 11), py(browY + tilt), px(cx + 11), py(browY - tilt));
    }
  }

  // Mouth
  const my = 49;
  const curv = st.mouth_curvature || 0;
  const shift = st.mouth_offset_x || 0;
  const oneSide = st.mouth_one_side || 0;

  if (st.mouth_open) {
    noStroke();
    fill(inkC);
    ellipse(px(64 + shift), py(my), (20 + abs(curv)) * sx, (11 + abs(curv) * 0.5) * sy);
  } else {
    noFill();
    stroke(inkC);
    strokeWeight(max(1.5, 3 * sy));
    beginShape();
    vertex(px(64 - 16 + shift), py(my));
    quadraticVertex(px(64 + shift), py(my + curv * 1.1),
      px(64 + 16 + shift), py(my - oneSide));
    endShape();
  }
  pop();
}

// The face_state parameters, written the way they appear in Python.
function stateLines(st) {
  const out = [];
  if (st.eyebrow_angle_left !== undefined) {
    out.push('"eyebrow_angle_left": ' + st.eyebrow_angle_left + ',');
    out.push('"eyebrow_angle_right": ' + st.eyebrow_angle_right + ',');
  } else {
    out.push('"eyebrow_angle": ' + st.eyebrow_angle + ',');
  }
  out.push('"eye_size": ' + st.eye_size + ',');
  out.push('"eye_spacing": ' + st.eye_spacing + ',');
  if (st.eyelid) out.push('"eyelid_cover": ' + st.eyelid + ',');
  out.push('"gaze_offset_x": ' + (st.gaze_offset_x || 0) + ',');
  out.push('"mouth_curvature": ' + (st.mouth_curvature || 0) +
    (st.mouth_open ? ',' : ''));
  if (st.mouth_open) out.push('"mouth_open": True');
  return out;
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------
let lastWidth = 0;                // used to re-lay-out only when width changes

function draw() {
  updateCanvasSize();
  if (canvasWidth !== lastWidth) {
    lastWidth = canvasWidth;
    resizeCanvas(canvasWidth, canvasHeight);
    layoutControls();
    positionControls();
    refreshControlStates();
  }

  if (comparing) {
    drawCompareScreen();
    return;
  }

  stroke('silver');
  fill('aliceblue');
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  drawDesignPanel();
  drawRubricRows();
  drawControlLabels();
}

// The two renderings, the parameter readout, and the design's stated intent.
function drawDesignPanel() {
  const sample = SAMPLES[sampleIndex];
  const narrow = canvasWidth < 620;

  noStroke();
  fill('black');
  textAlign(LEFT, TOP);
  textSize(narrow ? 15 : 19);
  text('Rubric Rater: ' + sample.name, 10, 6, canvasWidth - 20, 26);
  textSize(defaultTextSize);

  const top = narrow ? 28 : 36;
  const leftW = narrow ? canvasWidth - 2 * margin
                       : floor(canvasWidth * 0.55) - margin;

  // Close-up rendering, with room to its right for the thumbnail
  const bigW = narrow ? min(canvasWidth - 120, 170)
                      : min((leftW - 22) / 1.4, 300);
  const bigH = bigW / 2;
  drawFaceOn(margin, top, bigW, bigH, sample.st, { dim: 0 });

  // Classroom-distance thumbnail: smaller and lower contrast
  const thumbW = bigW * 0.4;
  const thumbX = margin + bigW + 12;
  drawFaceOn(thumbX, top + bigH - thumbW / 2, thumbW, thumbW / 2, sample.st,
    { dim: 0.62 });

  noStroke();
  fill('#546E7A');
  textSize(11);
  textAlign(CENTER, TOP);
  text('Close up', margin, top + bigH + 4, bigW, 16);
  text('At classroom distance', thumbX - 14, top + bigH + 4, thumbW + 90, 16);
  textAlign(LEFT, TOP);

  const done = rowsComplete();
  const progress = submitted
    ? 'Assessment locked in. Open Compare to Reference Rating.'
    : done + ' of ' + CRITERIA.length + ' rows rated and explained';

  if (narrow) {
    // Too little height for the full dictionary, so print one summary line.
    let y = top + bigH + 22;
    fill('#1A237E');
    textSize(11);
    text('face_state: ' + stateLines(sample.st).join(' ').replace(/"/g, ''),
      margin, y, canvasWidth - 2 * margin, 32);
    y += 32;
    fill('#37474F');
    text(sample.intent, margin, y, canvasWidth - 2 * margin, 18);
    y += 18;
    fill(done === CRITERIA.length ? 'darkgreen' : '#37474F');
    textSize(12);
    text(progress, margin, y, canvasWidth - 2 * margin, 18);
    textSize(defaultTextSize);
    return;
  }

  // Parameter readout
  const lines = stateLines(sample.st);
  let y = top + bigH + 26;
  fill('black');
  textSize(12);
  text('face_state = {', margin, y);
  y += 15;
  fill('#1A237E');
  for (let i = 0; i < lines.length; i++) {
    text('    ' + lines[i], margin, y);
    y += 14;
  }
  fill('black');
  text('}', margin, y);

  // Intent and status panel
  const panelX = margin + leftW + 6;
  const panelW = canvasWidth - panelX - margin;
  const panelH = drawHeight - top - 10;

  fill(255, 255, 255, 235);
  stroke(200);
  rect(panelX, top, panelW, panelH, 8);
  noStroke();

  const innerX = panelX + 9;
  const wrapW = panelW - 18;
  let cy = top + 8;

  fill('#37474F');
  textSize(12);
  text(sample.intent, innerX, cy, wrapW, 40);
  cy += 40;

  fill(done === CRITERIA.length ? 'darkgreen' : '#37474F');
  textSize(13);
  text(progress, innerX, cy, wrapW, 34);
  cy += 34;

  fill('#546E7A');
  textSize(12);
  text('Judge the close-up and the thumbnail together. A design that only ' +
    'works close up has already failed two of the seven criteria. Give every ' +
    'row a rating and a short reason, then submit and compare.',
    innerX, cy, wrapW, top + panelH - cy - 8);
  textSize(defaultTextSize);
}

// The criterion name and its guiding question, drawn behind the DOM controls.
function drawRubricRows() {
  const rowTop = drawHeight + headerH;
  noStroke();
  textAlign(LEFT, TOP);
  for (let row = 0; row < CRITERIA.length; row++) {
    const y = rowTop + row * rowH;
    if (row % 2 === 1) {
      fill(245, 247, 250);
      rect(0, y, canvasWidth, rowH);
    }
    fill('#263238');
    textSize(11);
    if (wideRows) {
      text(CRITERIA[row].short, 8, y + 6, 176, 26);
    } else {
      text(CRITERIA[row].brief, 8, y + 4, canvasWidth - 16, 18);
    }
  }
  textSize(defaultTextSize);
  textAlign(LEFT, TOP);
}

// Your rating next to the chapter's, one row per criterion.
function drawCompareScreen() {
  stroke('silver');
  fill('white');
  rect(0, 0, canvasWidth, canvasHeight);
  noStroke();

  const sample = SAMPLES[sampleIndex];
  fill('black');
  textAlign(LEFT, TOP);
  textSize(16);
  text('Your rating vs the reference rating: ' + sample.name, 10, 8,
    canvasWidth - 20, 24);

  const perPage = comparePageSize();
  const first = comparePage * perPage;
  const last = min(first + perPage, CRITERIA.length);
  const areaTop = 36;
  const areaBottom = canvasHeight - 76;      // leave room for the note and buttons
  const slotH = min((areaBottom - areaTop) / (last - first), 92);

  for (let row = first; row < last; row++) {
    const y = areaTop + (row - first) * slotH;
    if (row % 2 === 1) {
      fill(245, 247, 250);
      rect(0, y, canvasWidth, slotH);
    }
    const mine = ratings[row];
    const ref = sample.ref[row];
    const agree = mine === ref.r;

    fill('#263238');
    textSize(13);
    text(CRITERIA[row].short, 10, y + 4, canvasWidth - 120, 18);

    fill(agree ? 'darkgreen' : '#E65100');
    textSize(12);
    textAlign(RIGHT, TOP);
    text(agree ? 'same rating' : 'different rating', 10, y + 5,
      canvasWidth - 20, 18);
    textAlign(LEFT, TOP);

    const halfH = (slotH - 26) / 2;
    fill('#0D47A1');
    textSize(12);
    text('You said ' + mine + ': ' + reasonInputs[row].value(),
      14, y + 22, canvasWidth - 28, halfH);

    fill('#4E342E');
    text('Reference says ' + ref.r + ': ' + ref.why,
      14, y + 24 + halfH, canvasWidth - 28, halfH);
  }

  fill('#546E7A');
  textSize(11);
  text('Criteria ' + (first + 1) + ' to ' + last + ' of ' + CRITERIA.length +
    '.  A different rating is not automatically a wrong one - your reason is ' +
    'what matters.', 10, canvasHeight - 70, canvasWidth - 20, 30);
  textSize(defaultTextSize);
}

// Labels drawn inside the white control region.
function drawControlLabels() {
  noStroke();
  fill('dimgray');
  textAlign(LEFT, CENTER);
  textSize(11);
  text(submitted
    ? 'Ratings are locked. Compare them with the chapter\'s reference.'
    : 'Rate every criterion and give a reason to unlock Submit Assessment.',
    10, drawHeight + headerH + CRITERIA.length * rowH + 6);
  textSize(defaultTextSize);
  textAlign(LEFT, TOP);
}
