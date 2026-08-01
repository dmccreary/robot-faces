// Expression Recipe Flashcard Gallery MicroSim
// Chapter 10: Emotion Theory & the Core Expression Set
// Bloom level: Understand (L2) - predict, infer
// Interaction: flashcard predict-then-flip. The learner commits to a named
// expression before the card turns over and shows the matching recipe or face.
//
// CANVAS_HEIGHT: 520

// ---------------------------------------------------------------------------
// Layout constants. The total height never changes, but the control strip
// grows taller on narrow screens, so drawHeight is recomputed every frame.
// ---------------------------------------------------------------------------
let canvasWidth = 800;
let canvasHeight = 520;          // fixed total: matches CANVAS_HEIGHT above
let drawHeight = 400;            // recomputed by layoutControls()
let controlHeight = 120;         // recomputed by layoutControls()
let margin = 10;
let defaultTextSize = 16;

// ---------------------------------------------------------------------------
// The thirteen expression recipes from the chapter walkthrough. Every value
// uses the same parameter vocabulary Chapter 9 introduced, measured in the
// 128 x 64 display's own pixels.
// ---------------------------------------------------------------------------
const EXPRESSIONS = [
  {
    name: 'Neutral',
    st: { eye_size: 8, eye_spacing: 44, gaze_offset_x: 0, eyebrow_angle: 0,
          mouth_curvature: 0 },
    why: 'Neutral is the rest state: level eyebrows, medium eyes, and a mouth ' +
         'curvature of about zero.'
  },
  {
    name: 'Happy',
    st: { eye_size: 8, eye_spacing: 44, gaze_offset_x: 0, eyebrow_angle: 6,
          mouth_curvature: 7 },
    why: 'A strongly positive mouth_curvature does almost all the work, with ' +
         'eyebrows only slightly raised.'
  },
  {
    name: 'Sad',
    st: { eye_size: 7, eye_spacing: 44, gaze_offset_x: 0, eyebrow_angle: -8,
          mouth_curvature: -6, eyelid: 0.18 },
    why: 'Sad flips both signs from happy: a mild negative eyebrow_angle and a ' +
         'clearly negative mouth_curvature.'
  },
  {
    name: 'Angry',
    st: { eye_size: 6, eye_spacing: 44, gaze_offset_x: 0, eyebrow_angle: -22,
          mouth_curvature: -1 },
    why: 'Anger reads through a sharp negative eyebrow_angle and narrowed ' +
         'eyes, while the mouth stays nearly flat.'
  },
  {
    name: 'Afraid',
    st: { eye_size: 12, eye_spacing: 44, gaze_offset_x: 0, eyebrow_angle: 16,
          mouth_curvature: -2, mouth_open: true },
    why: 'Raised eyebrows and wide eyes open the face up, and the open mouth ' +
         'pulls slightly downward instead of grinning.'
  },
  {
    name: 'Surprised',
    st: { eye_size: 14, eye_spacing: 44, gaze_offset_x: 0, eyebrow_angle: 25,
          mouth_curvature: 9, mouth_open: true },
    why: 'Surprised pushes every parameter to its extreme at once, which is ' +
         'why viewers almost never misread it.'
  },
  {
    name: 'Disgusted',
    st: { eye_size: 6, eye_spacing: 44, gaze_offset_x: 0,
          eyebrow_angle_left: -12, eyebrow_angle_right: -3,
          mouth_curvature: -3, mouth_one_side: 4, mouth_offset_x: -5 },
    why: 'Disgust scrunches the face asymmetrically: narrowed eyes and a mouth ' +
         'pulled and curled to one side.'
  },
  {
    name: 'Contempt',
    st: { eye_size: 8, eye_spacing: 44, gaze_offset_x: 0, eyebrow_angle: 0,
          mouth_curvature: 0, mouth_one_side: 6 },
    why: 'Contempt changes exactly one thing: a single mouth corner lifts while ' +
         'the rest of the face stays neutral.'
  },
  {
    name: 'Tired',
    st: { eye_size: 8, eye_spacing: 44, gaze_offset_x: 0, eyebrow_angle: -2,
          mouth_curvature: -2, eyelid: 0.45 },
    why: 'Tired is mostly an eye story: an eyelid covers about half of each ' +
         'eye, with eyebrows and mouth close to level.'
  },
  {
    name: 'Stern',
    st: { eye_size: 8, eye_spacing: 44, gaze_offset_x: 0, eyebrow_angle: -4,
          mouth_curvature: 0 },
    why: 'Stern shares anger\'s eyebrow direction at a much smaller magnitude, ' +
         'and it never narrows the eyes.'
  },
  {
    name: 'Sleepy',
    st: { eye_size: 8, eye_spacing: 44, gaze_offset_x: 0, eyebrow_angle: -1,
          mouth_curvature: -1, eyelid: 0.8 },
    why: 'Sleepy takes tired\'s eyelid further, covering nearly the whole eye ' +
         'and leaving only a thin sliver.'
  },
  {
    name: 'Confused',
    st: { eye_size: 8, eye_spacing: 44, gaze_offset_x: 0,
          eyebrow_angle_left: 14, eyebrow_angle_right: -6,
          mouth_curvature: 1, mouth_tilt: 2 },
    why: 'Confusion uses two different eyebrow angles instead of one mirrored ' +
         'value, which is deliberate asymmetry.'
  },
  {
    name: 'Excited',
    st: { eye_size: 12, eye_spacing: 44, gaze_offset_x: 0, eyebrow_angle: 14,
          mouth_curvature: 10, mouth_open: true },
    why: 'Excited is happy at maximum: wide eyes, raised eyebrows, and a big ' +
         'open smiling mouth.'
  }
];

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let cardIndex = 0;               // which expression the current card holds
let cardMode = 'face';           // 'face' = show a face, 'recipe' = show numbers
let guessName = '';              // '' until the learner picks a name
let answerShown = false;         // true once the card has flipped
let wasRevealed = false;         // true when Reveal was used instead of a guess
let correctCount = 0;
let seenCount = 0;
let flipT = 1;                   // 0 -> 1 flip animation progress

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
let modeSelect;
let revealButton;
let nextButton;
let resetButton;
let nameButtons = [];

// Control geometry, refreshed by layoutControls()
let actionRows = 1;
let nameRows = 2;
let namePerRow = 7;
const NAME_BTN_W = 78;
const NAME_BTN_H = 25;
const ROW_STEP = 31;

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
function setup() {
  updateCanvasSize();
  const cnv = createCanvas(canvasWidth, canvasHeight);
  const parentEl = document.querySelector('main');
  cnv.parent(parentEl);

  modeSelect = createSelect();
  modeSelect.parent(parentEl);
  modeSelect.option('Face to Name', 'face');
  modeSelect.option('Recipe to Name', 'recipe');
  modeSelect.selected('face');
  modeSelect.changed(changeMode);

  revealButton = createButton('Reveal');
  revealButton.parent(parentEl);
  revealButton.mousePressed(revealAnswer);

  nextButton = createButton('Next Card');
  nextButton.parent(parentEl);
  nextButton.mousePressed(nextCard);

  resetButton = createButton('Reset Score');
  resetButton.parent(parentEl);
  resetButton.mousePressed(resetScore);

  // One button per expression name, used to submit a guess.
  for (let i = 0; i < EXPRESSIONS.length; i++) {
    const btn = createButton(EXPRESSIONS[i].name);
    btn.parent(parentEl);
    btn.style('font-size', '11px');
    btn.mousePressed(function () { submitGuess(i); });
    nameButtons.push(btn);
  }

  cardIndex = floor(random(EXPRESSIONS.length));
  clearButtonColors();
  layoutControls();
  positionControls();

  describe(
    'A flashcard drill for the thirteen named robot-face expressions. One card ' +
    'at a time shows either a rendered face or a written parameter recipe. The ' +
    'learner picks an expression name from thirteen buttons, the card flips to ' +
    'show the other side of the pair, and a one-sentence note names the ' +
    'parameters that define that expression. A score tracks correct guesses ' +
    'out of cards seen.'
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

// Work out how many rows of controls the current width needs, then give the
// drawing area whatever height is left over.
function layoutControls() {
  const usable = canvasWidth - 2 * 8 + 5;
  namePerRow = max(3, floor(usable / (NAME_BTN_W + 5)));
  namePerRow = min(namePerRow, EXPRESSIONS.length);
  nameRows = ceil(EXPRESSIONS.length / namePerRow);
  actionRows = canvasWidth >= 500 ? 1 : 2;

  controlHeight = actionRows * 32 + nameRows * ROW_STEP + 22;
  drawHeight = canvasHeight - controlHeight;
}

function positionControls() {
  const rowY = drawHeight + 6;

  modeSelect.size(148, 26);
  modeSelect.position(8, rowY);

  if (actionRows === 1) {
    revealButton.position(166, rowY);
    nextButton.position(240, rowY);
    resetButton.position(334, rowY);
  } else {
    revealButton.position(166, rowY);
    nextButton.position(8, rowY + 32);
    resetButton.position(102, rowY + 32);
  }

  const gridTop = drawHeight + actionRows * 32 + 8;
  for (let i = 0; i < nameButtons.length; i++) {
    const col = i % namePerRow;
    const row = floor(i / namePerRow);
    nameButtons[i].size(NAME_BTN_W, NAME_BTN_H);
    nameButtons[i].position(8 + col * (NAME_BTN_W + 5), gridTop + row * ROW_STEP);
  }
}

// ---------------------------------------------------------------------------
// Card logic
// ---------------------------------------------------------------------------
function submitGuess(i) {
  if (answerShown) return;                  // one guess per card
  guessName = EXPRESSIONS[i].name;
  answerShown = true;
  wasRevealed = false;
  seenCount++;
  if (i === cardIndex) correctCount++;
  flipT = 0;                                // start the flip animation
  paintFeedbackColors(i);
}

function revealAnswer() {
  if (answerShown) return;
  answerShown = true;
  wasRevealed = true;                       // review only, so no score change
  flipT = 0;
  paintFeedbackColors(-1);
}

function nextCard() {
  let nextIndex = cardIndex;
  // Avoid showing the same expression twice in a row.
  while (nextIndex === cardIndex && EXPRESSIONS.length > 1) {
    nextIndex = floor(random(EXPRESSIONS.length));
  }
  cardIndex = nextIndex;
  guessName = '';
  answerShown = false;
  wasRevealed = false;
  flipT = 1;
  clearButtonColors();
}

function resetScore() {
  correctCount = 0;
  seenCount = 0;
}

function changeMode() {
  cardMode = modeSelect.value();
  cardIndex = floor(random(EXPRESSIONS.length));
  guessName = '';
  answerShown = false;
  wasRevealed = false;
  flipT = 1;
  clearButtonColors();
}

function clearButtonColors() {
  for (let i = 0; i < nameButtons.length; i++) {
    nameButtons[i].style('background-color', '');
    nameButtons[i].style('color', '');
  }
}

// Green marks the correct name, red marks a wrong guess.
function paintFeedbackColors(guessIndex) {
  for (let i = 0; i < nameButtons.length; i++) {
    if (i === cardIndex) {
      nameButtons[i].style('background-color', 'lightgreen');
    } else if (i === guessIndex) {
      nameButtons[i].style('background-color', 'lightcoral');
    } else {
      nameButtons[i].style('background-color', '');
    }
  }
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

    // Lit eye
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

    // Eyebrow: a short bar tilted by the eyebrow angle
    const angle = eyes[i].side < 0
      ? (st.eyebrow_angle_left === undefined ? st.eyebrow_angle : st.eyebrow_angle_left)
      : (st.eyebrow_angle_right === undefined ? st.eyebrow_angle : st.eyebrow_angle_right);
    // Positive angle lifts the outer end (a curious, surprised arch); negative
    // drops it (the furrowed, serious brow Chapter 9 describes).
    // A positive angle tilts the outer end up and lifts the whole brow away
    // from the eye; a negative angle drops the outer end and presses the brow
    // down onto the eye. Height carries most of the signal, which is what
    // gives surprise its lifted brow and anger its heavy, low one.
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
    const leftY = my + tiltM;
    const rightY = my - tiltM - oneSide;
    beginShape();
    vertex(px(64 - 16 + shift), py(leftY));
    quadraticVertex(px(64 + shift), py(my + curv * 1.1),
      px(64 + 16 + shift), py(rightY));
    endShape();
  }
  pop();
}

// Turn a face_state into the lines of a written recipe.
function recipeLines(st) {
  const out = [];
  if (st.eyebrow_angle_left !== undefined) {
    out.push('eyebrow_angle_left: ' + st.eyebrow_angle_left);
    out.push('eyebrow_angle_right: ' + st.eyebrow_angle_right);
  } else {
    out.push('eyebrow_angle: ' + st.eyebrow_angle);
  }
  out.push('eye_size: ' + st.eye_size);
  if (st.eyelid) out.push('eyelid_cover: ' + st.eyelid);
  out.push('gaze_offset_x: ' + (st.gaze_offset_x || 0));
  out.push('mouth_curvature: ' + (st.mouth_curvature || 0));
  if (st.mouth_open) out.push('mouth_open: True');
  if (st.mouth_one_side) out.push('mouth_one_side_raise: ' + st.mouth_one_side);
  if (st.mouth_offset_x) out.push('mouth_offset_x: ' + st.mouth_offset_x);
  return out;
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------
function draw() {
  updateCanvasSize();
  layoutControls();
  positionControls();

  // Advance the flip animation, which runs once per answer and then stops.
  if (flipT < 1) {
    flipT = min(1, flipT + deltaTime / 420);
  }

  stroke('silver');
  fill('aliceblue');
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  const narrow = canvasWidth < 620;

  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(narrow ? 17 : 21);
  text('Expression Recipe Flashcards', canvasWidth / 2, 6);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);

  if (narrow) {
    const cardH = floor((drawHeight - 36) * 0.56);
    drawCard(margin, 34, canvasWidth - 2 * margin, cardH);
    drawInfoPanel(margin, 34 + cardH + 8, canvasWidth - 2 * margin,
      drawHeight - 34 - cardH - 16, 12);
  } else {
    const cardW = floor(canvasWidth * 0.58) - margin;
    drawCard(margin, 34, cardW - margin, drawHeight - 46);
    const infoX = margin + cardW;
    drawInfoPanel(infoX, 34, canvasWidth - infoX - margin, drawHeight - 46, 13);
  }

  drawControlLabels();
}

// The flashcard itself. It turns over with a short horizontal flip once the
// learner answers, so the two sides of the pair feel like one object.
function drawCard(x, y, w, h) {
  const item = EXPRESSIONS[cardIndex];

  // Flip: squeeze the card horizontally, then let it grow back.
  const squeeze = flipT >= 1 ? 1 : max(0.06, abs(cos(PI * flipT)));
  const showBack = answerShown && flipT >= 0.5;

  push();
  translate(x + w / 2, y + h / 2);
  scale(squeeze, 1);
  translate(-w / 2, -h / 2);

  fill('white');
  stroke('silver');
  strokeWeight(1.5);
  rect(0, 0, w, h, 10);
  strokeWeight(1);

  noStroke();
  textAlign(CENTER, TOP);
  fill('dimgray');
  textSize(13);
  const heading = showBack
    ? 'The answer'
    : (cardMode === 'face' ? 'Which expression is this face?'
                           : 'Which expression does this recipe build?');
  text(heading, 8, 8, w - 16, 20);

  if (!showBack) {
    // Front of the card: the question side only.
    if (cardMode === 'face') {
      drawCardFace(item.st, w, h, 32, h - 40);
    } else {
      drawCardRecipe(item.st, w, h, 32, h - 40);
    }
  } else {
    // Back of the card: the name, plus the representation the front hid.
    fill('black');
    textAlign(CENTER, TOP);
    textSize(22);
    text(item.name, w / 2, 28);
    if (cardMode === 'face') {
      drawCardRecipe(item.st, w, h, 62, h - 70);
    } else {
      drawCardFace(item.st, w, h, 62, h - 70);
    }
  }
  pop();
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}

// Render the face inside a card, keeping the display's 2:1 shape.
function drawCardFace(st, w, h, top, boxH) {
  const faceW = min(w - 40, boxH * 2);
  const faceH = faceW / 2;
  drawFaceOn((w - faceW) / 2, top + (boxH - faceH) / 2, faceW, faceH, st);
}

// Render the written recipe inside a card.
function drawCardRecipe(st, w, h, top, boxH) {
  const lines = recipeLines(st);
  const lineH = min(20, boxH / (lines.length + 0.5));
  const startY = top + (boxH - lines.length * lineH) / 2;
  noStroke();
  textAlign(CENTER, TOP);
  textSize(min(15, lineH - 3));
  fill('#1A237E');
  for (let i = 0; i < lines.length; i++) {
    text(lines[i], w / 2, startY + i * lineH);
  }
  textSize(defaultTextSize);
}

// Score, verdict, and the one-sentence parameter explanation.
function drawInfoPanel(x, y, w, h, fontSize) {
  const item = EXPRESSIONS[cardIndex];

  fill(255, 255, 255, 235);
  stroke(200);
  rect(x, y, w, h, 10);

  noStroke();
  textAlign(LEFT, TOP);
  let cursorY = y + 10;
  const innerX = x + 10;
  const wrapW = w - 20;

  fill('black');
  textSize(16);
  text('Score: ' + correctCount + ' correct of ' + seenCount + ' guessed',
    innerX, cursorY, wrapW, 22);
  cursorY += 28;

  if (!answerShown) {
    fill('dimgray');
    textSize(fontSize);
    const prompt = cardMode === 'face'
      ? 'Look at the eyebrows first, then the eyes, then the mouth. Click the ' +
        'name you predict, or click Reveal to study this card instead.'
      : 'Read the numbers as a recipe. Which parameter moved farthest from ' +
        'neutral? Click the name you infer, or click Reveal to study it.';
    text(prompt, innerX, cursorY, wrapW, h - (cursorY - y) - 12);
    textSize(defaultTextSize);
    return;
  }

  if (wasRevealed) {
    fill('#1565C0');
    textSize(15);
    text('Revealed for review, so this card is not scored.',
      innerX, cursorY, wrapW, 40);
    cursorY += 40;
  } else {
    const right = guessName === item.name;
    fill(right ? 'darkgreen' : 'firebrick');
    textSize(16);
    text(right ? 'Correct!' : 'Not quite - you said ' + guessName + '.',
      innerX, cursorY, wrapW, 40);
    cursorY += right ? 24 : 42;
  }

  fill('black');
  textSize(fontSize + 1);
  text('This card is ' + item.name + '.', innerX, cursorY, wrapW, 24);
  cursorY += 26;

  fill('#37474F');
  textSize(fontSize);
  text(item.why, innerX, cursorY, wrapW, y + h - cursorY - 10);
  textSize(defaultTextSize);
}

// Labels drawn inside the white control region.
function drawControlLabels() {
  noStroke();
  fill('dimgray');
  textAlign(LEFT, CENTER);
  textSize(12);
  const hintY = drawHeight + actionRows * 32 + nameRows * ROW_STEP + 12;
  text(answerShown
    ? 'Click Next Card for a new expression.'
    : 'Pick the expression name you predict.', 8, hintY);
  textSize(defaultTextSize);
  textAlign(LEFT, TOP);
}
