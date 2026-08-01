// Ambiguous Expression Confusability Sorter MicroSim
// Chapter 11: Expression Design, Readability & Human-Robot Interaction
// Bloom level: Evaluate (L5) - judge, critique, justify
// Interaction: classification sorter with mandatory justification feedback.
// The learner names the two emotions a deliberately ambiguous face could be
// read as, then always sees the parameter-level reasoning behind the pair.
//
// CANVAS_HEIGHT: 540

// ---------------------------------------------------------------------------
// Layout constants (standard MicroSim pattern)
// ---------------------------------------------------------------------------
let canvasWidth = 800;
let drawHeight = 470;
let controlHeight = 70;           // one row of buttons plus a hint line
let canvasHeight = drawHeight + controlHeight;
let margin = 10;
let defaultTextSize = 16;

// ---------------------------------------------------------------------------
// The chip bank: the thirteen named expressions plus an escape hatch for a
// face that does not clearly land on any of them.
// ---------------------------------------------------------------------------
const CHIP_NAMES = [
  'Neutral', 'Happy', 'Sad', 'Angry', 'Afraid', 'Surprised', 'Disgusted',
  'Contempt', 'Tired', 'Stern', 'Sleepy', 'Confused', 'Excited',
  'No clear emotion'
];

// ---------------------------------------------------------------------------
// Five deliberately ambiguous faces. Each one sits between two named
// expressions, and each carries the parameter-level reason why.
// ---------------------------------------------------------------------------
const CASES = [
  {
    label: 'Case 1',
    st: { eye_size: 13, eye_spacing: 44, gaze_offset_x: 0, eyebrow_angle: 20,
          mouth_curvature: 3, mouth_open: true },
    answer: ['Afraid', 'Surprised'],
    why: 'Both readings share very raised eyebrows and wide eyes, so arousal ' +
         'is high either way. The open mouth is the only tie-breaker, and here ' +
         'it neither smiles nor pulls down far enough to settle the question.'
  },
  {
    label: 'Case 2',
    st: { eye_size: 6, eye_spacing: 44, gaze_offset_x: 0,
          eyebrow_angle_left: -15, eyebrow_angle_right: -9,
          mouth_curvature: -4, mouth_one_side: 3, mouth_offset_x: -3 },
    answer: ['Angry', 'Disgusted'],
    why: 'Narrowed eyes and low, heavy eyebrows belong to both. Only the ' +
         'slight one-sided curl of the mouth argues for disgust, and a small ' +
         'asymmetry like that is easy to miss on a 128 by 64 display.'
  },
  {
    label: 'Case 3',
    st: { eye_size: 7, eye_spacing: 44, gaze_offset_x: 0, eyebrow_angle: -6,
          mouth_curvature: -3, eyelid: 0.34 },
    answer: ['Sad', 'Tired'],
    why: 'Half-covered eyes and gently lowered eyebrows read as low energy, ' +
         'which fits both. The mouth curves down only slightly, so it never ' +
         'commits to the clear frown that would make this sad instead of tired.'
  },
  {
    label: 'Case 4',
    st: { eye_size: 7, eye_spacing: 44, gaze_offset_x: 0, eyebrow_angle: -13,
          mouth_curvature: -1 },
    answer: ['Angry', 'Stern'],
    why: 'Stern and angry share the same eyebrow direction and differ mainly ' +
         'in magnitude. This eyebrow_angle sits between the two recipes, and ' +
         'the eyes are only slightly narrowed, so neither reading wins.'
  },
  {
    label: 'Case 5',
    st: { eye_size: 8, eye_spacing: 44, gaze_offset_x: 0, eyebrow_angle: 0,
          mouth_curvature: 0, mouth_one_side: 3 },
    answer: ['Contempt', 'Neutral'],
    why: 'Every parameter matches neutral except one mouth corner lifted by ' +
         'three pixels. Contempt lives entirely in that tiny asymmetry, which ' +
         'is exactly why the chapter calls it an advanced, optional expression.'
  }
];

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let caseIndex = 0;
let chosen = [];                  // up to two chip names, in click order
let submitted = false;
let matchCount = 0;               // how many of the reference pair were named
let hoverChip = -1;

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
let submitButton;
let nextButton;
let clearButton;

// ---------------------------------------------------------------------------
// Computed layout, refreshed every frame
// ---------------------------------------------------------------------------
let isNarrow = false;
let faceBox = { x: 0, y: 0, w: 0, h: 0 };
let answerBox = { x: 0, y: 0, w: 0, h: 0 };
let slotRects = [];
let chipRects = [];
let feedbackBox = { x: 0, y: 0, w: 0, h: 0 };

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
function setup() {
  updateCanvasSize();
  const cnv = createCanvas(canvasWidth, canvasHeight);
  const parentEl = document.querySelector('main');
  cnv.parent(parentEl);

  submitButton = createButton('Submit');
  submitButton.parent(parentEl);
  submitButton.mousePressed(submitAnswer);

  clearButton = createButton('Clear Answer');
  clearButton.parent(parentEl);
  clearButton.mousePressed(clearAnswer);

  nextButton = createButton('New Ambiguous Face');
  nextButton.parent(parentEl);
  nextButton.mousePressed(nextCase);

  positionControls();
  updateButtonStates();

  describe(
    'A judgment exercise built on five deliberately ambiguous robot faces. ' +
    'Each face is rendered from a parameter set that sits between two named ' +
    'expressions, such as afraid and surprised. The learner clicks two ' +
    'expression-name chips into an answer zone and submits them. The feedback ' +
    'panel reports whether the pair matched the reference answer and always ' +
    'explains, in terms of eyebrow, eye, and mouth parameters, why the face ' +
    'supports both readings.'
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
  const rowY = drawHeight + 8;
  submitButton.position(10, rowY);
  clearButton.position(85, rowY);
  nextButton.position(190, rowY);
}

// ---------------------------------------------------------------------------
// Layout. The face sits on the left on wide screens and on top when narrow;
// the chip bank, answer zone, and feedback panel fill the rest.
// ---------------------------------------------------------------------------
function computeLayout() {
  isNarrow = canvasWidth < 620;
  const titleH = 30;

  let panelX, panelY, panelW, panelH;

  if (isNarrow) {
    const faceW = min(canvasWidth - 2 * margin, 260);
    faceBox = { x: (canvasWidth - faceW) / 2, y: titleH, w: faceW, h: faceW / 2 };
    panelX = margin;
    panelY = titleH + faceBox.h + 32;      // room for the parameter caption
    panelW = canvasWidth - 2 * margin;
    panelH = drawHeight - panelY - 8;
  } else {
    const leftW = floor(canvasWidth * 0.55) - margin;
    const faceW = min(leftW - margin, (drawHeight - titleH - 40) * 2);
    const faceH = faceW / 2;
    faceBox = {
      x: margin + (leftW - margin - faceW) / 2,
      y: titleH + max(10, (drawHeight - titleH - faceH - 34) / 2),
      w: faceW,
      h: faceH
    };
    panelX = margin + leftW;
    panelY = titleH;
    panelW = canvasWidth - panelX - margin;
    panelH = drawHeight - titleH - 10;
  }

  // Answer zone: two slots side by side.
  const slotH = 34;
  answerBox = { x: panelX, y: panelY + 18, w: panelW, h: slotH };
  const slotW = (panelW - 8) / 2;
  slotRects = [
    { x: panelX, y: answerBox.y, w: slotW, h: slotH },
    { x: panelX + slotW + 8, y: answerBox.y, w: slotW, h: slotH }
  ];

  // Chip bank: as many columns as the panel can hold.
  const chipCols = isNarrow ? (canvasWidth < 380 ? 2 : 3) : 2;
  const chipW = (panelW - (chipCols - 1) * 6) / chipCols;
  const chipH = isNarrow ? 22 : 24;
  const chipGap = isNarrow ? 3 : 4;
  const chipTop = answerBox.y + slotH + 24;
  chipRects = [];
  for (let i = 0; i < CHIP_NAMES.length; i++) {
    const col = i % chipCols;
    const row = floor(i / chipCols);
    chipRects.push({
      x: panelX + col * (chipW + 6),
      y: chipTop + row * (chipH + chipGap),
      w: chipW,
      h: chipH,
      name: CHIP_NAMES[i]
    });
  }
  const chipRows = ceil(CHIP_NAMES.length / chipCols);
  const chipBottom = chipTop + chipRows * (chipH + chipGap);

  feedbackBox = {
    x: panelX,
    y: chipBottom + 6,
    w: panelW,
    h: max(52, panelY + panelH - chipBottom - 6)
  };
}

// ---------------------------------------------------------------------------
// Answer logic
// ---------------------------------------------------------------------------
function mousePressed() {
  if (submitted) return;
  // A chip in the answer zone goes back to the bank.
  for (let i = 0; i < slotRects.length; i++) {
    if (chosen[i] !== undefined && insideRect(slotRects[i])) {
      chosen.splice(i, 1);
      updateButtonStates();
      return;
    }
  }
  // A chip in the bank moves into the answer zone.
  for (let i = 0; i < chipRects.length; i++) {
    if (insideRect(chipRects[i])) {
      const name = chipRects[i].name;
      const at = chosen.indexOf(name);
      if (at >= 0) {
        chosen.splice(at, 1);            // clicking a chosen chip unpicks it
      } else if (chosen.length < 2) {
        chosen.push(name);
      }
      updateButtonStates();
      return;
    }
  }
}

function insideRect(r) {
  return mouseX >= r.x && mouseX <= r.x + r.w &&
         mouseY >= r.y && mouseY <= r.y + r.h;
}

function submitAnswer() {
  if (submitted || chosen.length < 2) return;
  submitted = true;
  const answer = CASES[caseIndex].answer;
  matchCount = 0;
  for (let i = 0; i < chosen.length; i++) {
    if (answer.indexOf(chosen[i]) >= 0) matchCount++;
  }
  updateButtonStates();
}

function clearAnswer() {
  if (submitted) return;
  chosen = [];
  updateButtonStates();
}

function nextCase() {
  caseIndex = (caseIndex + 1) % CASES.length;
  chosen = [];
  submitted = false;
  matchCount = 0;
  updateButtonStates();
}

function setEnabled(btn, enabled) {
  if (enabled) {
    btn.removeAttribute('disabled');
  } else {
    btn.attribute('disabled', '');
  }
}

function updateButtonStates() {
  setEnabled(submitButton, !submitted && chosen.length === 2);
  setEnabled(clearButton, !submitted && chosen.length > 0);
}

// ---------------------------------------------------------------------------
// Face rendering. Every measurement is written in the 128 x 64 display's own
// pixel units and then scaled, so one recipe renders identically at any size.
// ---------------------------------------------------------------------------
function drawFaceOn(x, y, w, h, st) {
  const sx = w / 128;
  const sy = h / 64;
  const px = function (dx) { return x + dx * sx; };
  const py = function (dy) { return y + dy * sy; };

  push();
  noStroke();
  fill(12);                                  // unlit screen
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
    fill(255);
    ellipse(px(cx), py(eyeCy), eyeR * 2 * sx, eyeR * 2 * sy);

    // Pupil, drawn in the background color so gaze offset stays visible
    fill(12);
    ellipse(px(cx + gaze), py(eyeCy), eyeR * 0.7 * sx, eyeR * 0.7 * sy);

    // Eyelid: an unlit band covering the top share of the eye
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
    const outerY = browY - tilt;
    const innerY = browY + tilt;
    stroke(255);
    strokeWeight(max(2, 3 * sy));
    if (eyes[i].side < 0) {
      line(px(cx - 11), py(outerY), px(cx + 11), py(innerY));
    } else {
      line(px(cx - 11), py(innerY), px(cx + 11), py(outerY));
    }
  }

  // Mouth
  const my = 49;
  const curv = st.mouth_curvature || 0;
  const shift = st.mouth_offset_x || 0;
  const oneSide = st.mouth_one_side || 0;
  const tiltM = st.mouth_tilt || 0;

  if (st.mouth_open) {
    noStroke();
    fill(255);
    ellipse(px(64 + shift), py(my), (20 + abs(curv)) * sx, (11 + abs(curv) * 0.5) * sy);
  } else {
    noFill();
    stroke(255);
    strokeWeight(max(2, 3 * sy));
    beginShape();
    vertex(px(64 - 16 + shift), py(my + tiltM));
    quadraticVertex(px(64 + shift), py(my + curv * 1.1),
      px(64 + 16 + shift), py(my - tiltM - oneSide));
    endShape();
  }
  pop();
}

// Turn a face_state into a short one-line parameter summary.
function recipeSummary(st) {
  const parts = [];
  if (st.eyebrow_angle_left !== undefined) {
    parts.push('brows ' + st.eyebrow_angle_left + ' / ' + st.eyebrow_angle_right);
  } else {
    parts.push('brow ' + st.eyebrow_angle);
  }
  parts.push('eyes ' + st.eye_size);
  if (st.eyelid) parts.push('lid ' + st.eyelid);
  parts.push('mouth ' + (st.mouth_curvature || 0));
  if (st.mouth_open) parts.push('open');
  if (st.mouth_one_side) parts.push('one corner +' + st.mouth_one_side);
  return parts.join(',  ');
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------
function draw() {
  updateCanvasSize();
  computeLayout();
  updateHover();

  stroke('silver');
  fill('aliceblue');
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(isNarrow ? 16 : 20);
  text('Which two emotions could this face be read as?', 10, 6,
    canvasWidth - 20, 26);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);

  drawFacePanel();
  drawAnswerZone();
  drawChipBank();
  drawFeedback();
  drawControlLabels();
}

function updateHover() {
  hoverChip = -1;
  if (submitted) return;
  for (let i = 0; i < chipRects.length; i++) {
    if (insideRect(chipRects[i])) hoverChip = i;
  }
}

function drawFacePanel() {
  drawFaceOn(faceBox.x, faceBox.y, faceBox.w, faceBox.h, CASES[caseIndex].st);

  noStroke();
  fill('#37474F');
  textAlign(CENTER, TOP);
  textSize(12);
  text(CASES[caseIndex].label + ' of ' + CASES.length + ':  ' +
    recipeSummary(CASES[caseIndex].st),
    faceBox.x, faceBox.y + faceBox.h + 5, faceBox.w, 30);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}

function drawAnswerZone() {
  noStroke();
  fill('black');
  textSize(13);
  textAlign(LEFT, TOP);
  text('Your two readings', answerBox.x, answerBox.y - 17);

  for (let i = 0; i < slotRects.length; i++) {
    const r = slotRects[i];
    const name = chosen[i];
    stroke(name ? '#1565C0' : '#B0BEC5');
    strokeWeight(name ? 2 : 1);
    fill(name ? '#E3F2FD' : 'white');
    rect(r.x, r.y, r.w, r.h, 6);
    strokeWeight(1);

    noStroke();
    textAlign(CENTER, CENTER);
    textSize(13);
    fill(name ? '#0D47A1' : '#90A4AE');
    text(name ? name : 'empty slot ' + (i + 1), r.x, r.y, r.w, r.h);
  }
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}

function drawChipBank() {
  noStroke();
  fill('black');
  textSize(13);
  textAlign(LEFT, TOP);
  text(submitted ? 'Chip bank (locked until the next face)'
                 : 'Click a chip to place it, click it again to take it back',
    chipRects[0].x, chipRects[0].y - 19);

  for (let i = 0; i < chipRects.length; i++) {
    const r = chipRects[i];
    const picked = chosen.indexOf(r.name) >= 0;
    stroke(picked ? '#1565C0' : '#CFD8DC');
    fill(picked ? '#BBDEFB' : (hoverChip === i ? '#ECEFF1' : 'white'));
    rect(r.x, r.y, r.w, r.h, 12);

    noStroke();
    fill(submitted ? '#78909C' : '#263238');
    textAlign(CENTER, CENTER);
    textSize(12);
    text(r.name, r.x, r.y, r.w, r.h);
  }
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}

// The feedback panel always explains the reference pair, whether or not the
// learner matched it, because the reasoning is the real target here.
function drawFeedback() {
  const item = CASES[caseIndex];

  fill(255, 255, 255, 235);
  stroke(200);
  rect(feedbackBox.x, feedbackBox.y, feedbackBox.w, feedbackBox.h, 8);

  noStroke();
  textAlign(LEFT, TOP);
  const innerX = feedbackBox.x + 9;
  const wrapW = feedbackBox.w - 18;
  let cursorY = feedbackBox.y + 8;

  if (!submitted) {
    fill('#37474F');
    textSize(12);
    text('Judge the face first: which two names could a viewer honestly ' +
      'give it? Place both chips, then press Submit to compare your ' +
      'reading with the reference pair.',
      innerX, cursorY, wrapW, feedbackBox.h - 16);
    textSize(defaultTextSize);
    return;
  }

  const verdict = matchCount === 2 ? 'Full match'
    : (matchCount === 1 ? 'Partial match' : 'Different reading');
  fill(matchCount === 2 ? 'darkgreen' : (matchCount === 1 ? '#E65100' : 'firebrick'));
  textSize(14);
  text(verdict + ' - reference pair: ' + item.answer[0] + ' and ' +
    item.answer[1], innerX, cursorY, wrapW, 36);
  cursorY += matchCount === 2 ? 20 : 20;

  fill('#263238');
  textSize(12);
  text(item.why, innerX, cursorY, wrapW, feedbackBox.y + feedbackBox.h - cursorY - 8);
  textSize(defaultTextSize);
}

// Labels drawn inside the white control region.
function drawControlLabels() {
  noStroke();
  fill('dimgray');
  textAlign(LEFT, CENTER);
  textSize(12);
  const hint = submitted
    ? 'Read the justification, then load the next ambiguous face.'
    : (chosen.length === 2 ? 'Two chips placed. Submit when you are ready.'
                           : 'Place two chips in the answer zone to enable Submit.');
  text(hint, 10, drawHeight + 52);
  textSize(defaultTextSize);
  textAlign(LEFT, TOP);
}
