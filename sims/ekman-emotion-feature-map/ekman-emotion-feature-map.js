// Ekman Emotion Feature Map MicroSim
// Chapter 10: Emotion Theory and the Core Expression Set
// Bloom level: Understand (L2) - explain, interpret
// Interaction: hover to preview, click to reveal. Each emotion holds still in
// the detail panel so the learner can read one feature combination at a time,
// rather than watching anything animate.
//
// CANVAS_HEIGHT: 550

// ---------------------------------------------------------------------------
// Layout constants (standard MicroSim pattern)
// ---------------------------------------------------------------------------
let canvasWidth = 800;
let drawHeight = 470;
let controlHeight = 80;           // one button row plus one hint row
let canvasHeight = drawHeight + controlHeight;
let margin = 12;
let defaultTextSize = 16;

const TITLE_H = 30;
const CELL_GAP = 6;
const OLED_W = 128;
const OLED_H = 64;

// Recognition-accuracy tiers. Green marks the emotions viewers read reliably,
// amber the ones research says get confused most often.
const ACCURACY = {
  high:   { label: 'Read reliably',    color: '#2E7D32' },
  medium: { label: 'Read fairly well', color: '#9E9D24' },
  lower:  { label: 'Often confused',   color: '#EF6C00' }
};

// ---------------------------------------------------------------------------
// The seven Ekman universal emotions. Every field here is data the panel
// reads; nothing about an emotion is computed anywhere else in the sketch.
// ---------------------------------------------------------------------------
const EMOTIONS = [
  {
    key: 'happiness',
    name: 'Happiness',
    brow: 'relaxed, level or slightly raised',
    eyes: 'normal width, softly narrowed',
    mouth: 'corners pulled up in an even curve',
    facs: ['Lip Corner Puller', 'Cheek Raiser'],
    accuracy: 'high',
    note: 'One strongly positive mouth_curvature does almost all the work, which is why happiness survives being drawn in very few pixels.',
    face: { brow: 6, eye: 8, mouth: 7, open: false, shift: 0 }
  },
  {
    key: 'sadness',
    name: 'Sadness',
    brow: 'inner corners up, outer corners down',
    eyes: 'lids slightly lowered',
    mouth: 'corners pulled down into a frown',
    facs: ['Inner Brow Raiser', 'Brow Lowerer', 'Lip Corner Depressor'],
    accuracy: 'medium',
    note: 'Sadness is happiness with the signs flipped: a mildly negative eyebrow_angle and a negative mouth_curvature.',
    face: { brow: -8, eye: 7, mouth: -6, open: false, shift: 0 }
  },
  {
    key: 'anger',
    name: 'Anger',
    brow: 'lowered hard, drawn toward the nose',
    eyes: 'tightened into a narrow stare',
    mouth: 'pressed into a tight flat line',
    facs: ['Brow Lowerer', 'Lid Tightener', 'Lip Tightener'],
    accuracy: 'medium',
    note: 'Anger reads through the eyebrows and a reduced eye_size, not the mouth, so keep mouth_curvature close to flat.',
    face: { brow: -24, eye: 5, mouth: -1, open: false, shift: 0 }
  },
  {
    key: 'fear',
    name: 'Fear',
    brow: 'raised high, pulled together',
    eyes: 'wide, upper lid lifted',
    mouth: 'stretched open sideways',
    facs: ['Inner Brow Raiser', 'Upper Lid Raiser', 'Lip Stretcher'],
    accuracy: 'lower',
    note: 'Fear needs an open mouth shape rather than a simple curve, and it is still mistaken for surprise more than any other pair.',
    face: { brow: 18, eye: 13, mouth: 6, open: true, shift: 0 }
  },
  {
    key: 'surprise',
    name: 'Surprise',
    brow: 'raised very high and curved',
    eyes: 'opened as wide as they go',
    mouth: 'dropped fully open, round',
    facs: ['Outer Brow Raiser', 'Upper Lid Raiser', 'Jaw Drop'],
    accuracy: 'high',
    note: 'Every feature moves the same direction at once, which leaves a viewer almost no room to read it as anything else.',
    face: { brow: 26, eye: 15, mouth: 9, open: true, shift: 0 }
  },
  {
    key: 'disgust',
    name: 'Disgust',
    brow: 'lowered, nose bridge scrunched',
    eyes: 'narrowed as the cheeks push up',
    mouth: 'upper lip curled on one side',
    facs: ['Nose Wrinkler', 'Upper Lip Raiser', 'Lower Lip Depressor'],
    accuracy: 'lower',
    note: 'Disgust is the first emotion here that must break facial symmetry, because a mirrored curve cannot curl just one side.',
    face: { brow: -14, eye: 5, mouth: -5, open: false, shift: 7 }
  },
  {
    key: 'contempt',
    name: 'Contempt',
    brow: 'level and essentially unchanged',
    eyes: 'normal width, no tightening',
    mouth: 'one corner tightened and lifted',
    facs: ['Unilateral Lip Corner Puller', 'Dimpler'],
    accuracy: 'lower',
    note: 'Contempt is Ekman\'s debated seventh emotion, and its one-sided lift is small enough to vanish on a 128 by 64 screen.',
    face: { brow: 1, eye: 8, mouth: 2, open: false, shift: 9 }
  }
];

// Why fear and disgust are so easy to mix up on a face with few moving parts.
const COMPARE_NOTE_LONG =
  'Both move the eyebrows well away from level, and both need a mouth shape ' +
  'one mirrored curve cannot draw. A real face separates them with a wrinkled ' +
  'nose and a stretched lip, which a robot face simply does not have.';

const COMPARE_NOTE_SHORT =
  'Both push the eyebrows far from level, and both need a mouth shape one ' +
  'mirrored curve cannot draw. A robot face has no wrinkled nose or ' +
  'stretched lip to tell them apart.';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let selectedKey = 'happiness';
let compareMode = false;
let hoveredIndex = -1;

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
let compareButton, clearButton;

// ---------------------------------------------------------------------------
// Computed layout, refreshed every frame
// ---------------------------------------------------------------------------
let isNarrow = false;
let cellW = 0, cellH = 0, thumbW = 0, thumbH = 0, perRow = 7;
let iconTop = 0, iconAreaH = 0;
let panelX = 0, panelY = 0, panelW = 0, panelH = 0;
let cellRects = [];               // one {x, y, w, h} per emotion

function setup() {
  updateCanvasSize();
  const cnv = createCanvas(canvasWidth, canvasHeight);
  const parentEl = document.querySelector('main');
  cnv.parent(parentEl);

  compareButton = createButton('Compare Fear vs. Disgust');
  compareButton.mousePressed(startCompare);
  compareButton.style('background-color', '#EF6C00');
  compareButton.style('color', 'white');
  compareButton.style('border', 'none');
  compareButton.style('padding', '6px 12px');
  compareButton.parent(parentEl);

  clearButton = createButton('Back to One Emotion');
  clearButton.mousePressed(endCompare);
  clearButton.parent(parentEl);

  positionControls();

  describe(
    'A map of Ekman\'s seven universal emotions. A row of seven small robot ' +
    'faces runs across the top: happiness, sadness, anger, fear, surprise, ' +
    'disgust, and contempt. Each carries a colored recognition-accuracy ' +
    'badge, green where viewers read the emotion reliably and amber where ' +
    'research says it is often confused. Hovering a face previews its ' +
    'eyebrow, eye, and mouth combination. Clicking one fills the panel below ' +
    'with that combination in plain language, the FACS action units most ' +
    'linked to it, and a note on drawing it with robot-face parameters. A ' +
    'Compare Fear versus Disgust button shows both side by side and explains ' +
    'the features they share.'
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
  compareButton.position(10, drawHeight + 10);
  clearButton.position(205, drawHeight + 10);
}

// ---------------------------------------------------------------------------
// Selection
// ---------------------------------------------------------------------------
function startCompare() {
  compareMode = true;
}

function endCompare() {
  compareMode = false;
}

function isSelected(key) {
  if (compareMode) return key === 'fear' || key === 'disgust';
  return key === selectedKey;
}

function mousePressed() {
  for (let i = 0; i < cellRects.length; i++) {
    const r = cellRects[i];
    if (mouseX >= r.x && mouseX <= r.x + r.w &&
        mouseY >= r.y && mouseY <= r.y + r.h) {
      compareMode = false;
      selectedKey = EMOTIONS[i].key;
      return;
    }
  }
}

function emotionByKey(key) {
  for (let i = 0; i < EMOTIONS.length; i++) {
    if (EMOTIONS[i].key === key) return EMOTIONS[i];
  }
  return EMOTIONS[0];
}

// ---------------------------------------------------------------------------
// Text helpers. Wrapping by hand lets the panel know exactly how tall each
// block will be, so nothing ever spills past the bottom of the box.
// ---------------------------------------------------------------------------
function wrapToLines(str, maxW) {
  const words = str.split(' ');
  const lines = [];
  let current = '';
  for (let i = 0; i < words.length; i++) {
    const candidate = current === '' ? words[i] : current + ' ' + words[i];
    if (current !== '' && textWidth(candidate) > maxW) {
      lines.push(current);
      current = words[i];
    } else {
      current = candidate;
    }
  }
  if (current !== '') lines.push(current);
  return lines;
}

// Draws wrapped text and returns the y coordinate just below the last line.
// maxLines is optional and keeps a long string from spilling out of its box.
function drawWrapped(str, x, y, maxW, lineH, maxLines) {
  let lines = wrapToLines(str, maxW);
  if (maxLines && lines.length > maxLines) lines = lines.slice(0, maxLines);
  for (let i = 0; i < lines.length; i++) {
    text(lines[i], x, y + i * lineH);
  }
  return y + lines.length * lineH;
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------
function computeLayout() {
  isNarrow = canvasWidth < 600;
  perRow = isNarrow ? 4 : 7;       // the icon row wraps to two rows when narrow

  const usable = canvasWidth - 2 * margin;
  cellW = (usable - (perRow - 1) * CELL_GAP) / perRow;
  thumbW = cellW - 8;
  thumbH = thumbW / 2;             // the OLED's 2:1 aspect ratio
  cellH = thumbH + 46;             // thumb + name line + badge + padding

  const rows = Math.ceil(EMOTIONS.length / perRow);
  iconTop = TITLE_H + 4;
  iconAreaH = rows * cellH + (rows - 1) * CELL_GAP;

  cellRects = [];
  for (let i = 0; i < EMOTIONS.length; i++) {
    const row = Math.floor(i / perRow);
    const col = i % perRow;
    const inThisRow = min(perRow, EMOTIONS.length - row * perRow);
    // Center a short final row under the full row above it.
    const rowWidth = inThisRow * cellW + (inThisRow - 1) * CELL_GAP;
    const rowX = (canvasWidth - rowWidth) / 2;
    cellRects.push({
      x: rowX + col * (cellW + CELL_GAP),
      y: iconTop + row * (cellH + CELL_GAP),
      w: cellW,
      h: cellH
    });
  }

  panelX = margin;
  panelW = canvasWidth - 2 * margin;
  panelY = iconTop + iconAreaH + 10;
  panelH = drawHeight - panelY - margin;
}

function updateHover() {
  hoveredIndex = -1;
  for (let i = 0; i < cellRects.length; i++) {
    const r = cellRects[i];
    if (mouseX >= r.x && mouseX <= r.x + r.w &&
        mouseY >= r.y && mouseY <= r.y + r.h) {
      hoveredIndex = i;
      return;
    }
  }
}

// ---------------------------------------------------------------------------
// Main draw loop
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

  drawTitle();
  drawIconRow();
  drawDetailPanel();
  if (hoveredIndex >= 0) drawTooltip(hoveredIndex);
  drawControlLabels();
}

function drawTitle() {
  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(canvasWidth < 560 ? 16 : 20);
  // With a bounding box, x and y mark the box's top-left corner, so the box
  // starts at the left margin and CENTER aligns the words inside it.
  const heading = canvasWidth < 620
    ? 'Ekman\'s Seven Emotions as Face Recipes'
    : 'Ekman\'s Seven Emotions as Eyebrow, Eye, and Mouth Recipes';
  text(heading, 10, 5, canvasWidth - 20, 26);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}

// ---------------------------------------------------------------------------
// The icon row: one clickable cell per emotion
// ---------------------------------------------------------------------------
function drawIconRow() {
  for (let i = 0; i < EMOTIONS.length; i++) {
    const e = EMOTIONS[i];
    const r = cellRects[i];
    const picked = isSelected(e.key);
    const hovered = hoveredIndex === i;

    fill(picked ? '#CFD8DC' : (hovered ? '#E4E9EB' : '#ECEFF1'));
    stroke(picked ? '#37474F' : '#B0BEC5');
    strokeWeight(picked ? 3 : 1);
    rect(r.x, r.y, r.w, r.h, 8);
    strokeWeight(1);

    drawFaceThumb(r.x + 4, r.y + 4, thumbW, e.face);

    noStroke();
    fill('#263238');
    textAlign(CENTER, TOP);
    textSize(constrain(cellW / 7, 11, 14));
    text(e.name, r.x + r.w / 2, r.y + thumbH + 8);

    // The recognition-accuracy badge, the only strong color in the icon row
    const acc = ACCURACY[e.accuracy];
    const badgeY = r.y + thumbH + 26;
    fill(acc.color);
    rect(r.x + 5, badgeY, r.w - 10, 15, 7);
    fill('white');
    textSize(constrain(cellW / 9, 9, 11));
    text(acc.label, r.x + r.w / 2, badgeY + 2);
  }
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}

// A small robot face, drawn in the OLED's own 128 x 64 coordinate space and
// scaled down to thumbnail size.
function drawFaceThumb(px, py, pw, f) {
  const s = pw / OLED_W;
  const ph = OLED_H * s;

  push();
  translate(px, py);
  scale(s);

  noStroke();
  fill('black');
  rect(0, 0, OLED_W, OLED_H);

  const centerX = OLED_W / 2;
  const eyeY = 28;

  noFill();
  stroke('white');
  strokeWeight(1.4 / s);
  ellipse(centerX, OLED_H / 2, (OLED_W / 2 - 4) * 2, (OLED_H / 2 - 4) * 2);

  const leftEyeX = centerX - 20;
  const rightEyeX = centerX + 20;
  const browY = constrain(eyeY - f.eye - 6, 5, 24);

  noStroke();
  fill('white');
  drawEyebrow(leftEyeX, browY, 11, 3, f.brow, -1);
  drawEyebrow(rightEyeX, browY, 11, 3, f.brow, 1);

  ellipse(leftEyeX, eyeY, f.eye * 2, f.eye * 2);
  ellipse(rightEyeX, eyeY, f.eye * 2, f.eye * 2);
  fill('black');
  ellipse(leftEyeX, eyeY, 6, 6);
  ellipse(rightEyeX, eyeY, 6, 6);

  // shift is non-zero only for the two asymmetric emotions, disgust and
  // contempt, whose mouths pull toward one side.
  fill('white');
  drawMouth(centerX + f.shift, 48, 42 - abs(f.shift), f.mouth, f.open);

  pop();

  noFill();
  stroke('#607D8B');
  strokeWeight(1);
  rect(px, py, pw, ph, 2);
}

// One eyebrow as a tilted bar. A positive angle raises the OUTER end, the same
// convention Chapter 9's draw_eyebrow() uses.
function drawEyebrow(cx, cy, halfW, thickness, angleDegrees, outerSign) {
  // The brow can only tilt as far as the room above it allows, so a very
  // large eye never pushes an eyebrow off the top of the 64-pixel screen.
  const maxTilt = constrain(cy - 3, 1, 7);
  const tilt = constrain(Math.tan(radians(angleDegrees)) * halfW, -maxTilt, maxTilt);
  const outerX = cx + outerSign * halfW;
  const innerX = cx - outerSign * halfW;
  const outerYTop = cy - tilt;
  const innerYTop = cy + tilt;
  quad(outerX, outerYTop, innerX, innerYTop,
       innerX, innerYTop + thickness, outerX, outerYTop + thickness);
}

// Positive curvature fills the bottom half of an ellipse for a smile, negative
// fills the top half for a frown, and mouthOpen draws a full rounded shape.
function drawMouth(cx, cy, mouthWidth, curvature, mouthOpen) {
  const rx = mouthWidth / 2;
  if (mouthOpen) {
    ellipse(cx, cy, rx * 1.3, max(6, abs(curvature) * 1.6));
  } else if (curvature > 0) {
    arc(cx, cy, rx * 2, curvature * 2, 0, PI, PIE);
  } else if (curvature < 0) {
    arc(cx, cy, rx * 2, -curvature * 2, PI, TWO_PI, PIE);
  } else {
    rect(cx - rx, cy - 1, rx * 2, 2);
  }
}

// ---------------------------------------------------------------------------
// The detail panel: one emotion, or fear and disgust side by side
// ---------------------------------------------------------------------------
function drawDetailPanel() {
  fill(255, 255, 255, 240);
  stroke('#B0BEC5');
  rect(panelX, panelY, panelW, panelH, 10);

  if (compareMode) {
    drawComparePanel();
  } else {
    const bodySize = isNarrow ? 13 : 15;
    drawEmotionBlock(emotionByKey(selectedKey), panelX + 12, panelY + 10,
      panelW - 24, bodySize, true, true);
  }
}

// Draws one emotion's block and returns the y just below it.
function drawEmotionBlock(e, x, y, w, bodySize, showNote, showFacs) {
  const acc = ACCURACY[e.accuracy];
  const lineH = bodySize + 4;
  const stacked = w < 260;         // narrow columns put the badge on its own line

  noStroke();
  textAlign(LEFT, TOP);
  fill('#263238');
  textSize(bodySize + 5);
  text(e.name, x, y);

  const badgeW = 118;
  if (stacked) {
    y += bodySize + 10;
    fill(acc.color);
    rect(x, y, badgeW, 16, 8);
    fill('white');
    textAlign(CENTER, TOP);
    textSize(10);
    text(acc.label, x + badgeW / 2, y + 3);
    textAlign(LEFT, TOP);
    y += 22;
  } else {
    fill(acc.color);
    rect(x + w - badgeW, y + 2, badgeW, 17, 8);
    fill('white');
    textAlign(CENTER, TOP);
    textSize(11);
    text(acc.label, x + w - badgeW / 2, y + 5);
    textAlign(LEFT, TOP);
    y += bodySize + 13;
  }

  // The three features, the heart of what this sim asks the learner to read
  const rows = [['Eyebrows', e.brow], ['Eyes', e.eyes], ['Mouth', e.mouth]];
  for (let i = 0; i < rows.length; i++) {
    fill('#607D8B');
    textSize(bodySize - 3);
    text(rows[i][0], x, y);
    y += bodySize - 1;
    fill('#263238');
    textSize(bodySize);
    y = drawWrapped(rows[i][1], x + 8, y, w - 8, lineH) + 3;
  }

  if (showFacs) {
    y += 2;
    fill('#607D8B');
    textSize(bodySize - 3);
    text('FACS action units most linked to it', x, y);
    y += bodySize - 1;
    fill('#00695C');
    textSize(bodySize - 1);
    y = drawWrapped(e.facs.join(', '), x + 8, y, w - 8, lineH) + 5;
  }

  if (showNote) {
    fill('#607D8B');
    textSize(bodySize - 3);
    text('On a robot face', x, y);
    y += bodySize - 1;
    fill('#37474F');
    textSize(bodySize - 1);
    y = drawWrapped(e.note, x + 8, y, w - 8, lineH) + 4;
  }

  textSize(defaultTextSize);
  return y;
}

function drawComparePanel() {
  const bodySize = isNarrow ? 11 : 14;
  const innerX = panelX + 12;
  const innerW = panelW - 24;
  const colGap = isNarrow ? 12 : 20;
  const colW = (innerW - colGap) / 2;

  // Both emotions always share the row, so the overlapping features sit
  // literally side by side. Narrow columns drop the note and the FACS list to
  // keep room for the callout that explains the confusion.
  const extras = !isNarrow;
  const leftEnd = drawEmotionBlock(emotionByKey('fear'), innerX, panelY + 10,
    colW, bodySize, extras, extras);
  const rightEnd = drawEmotionBlock(emotionByKey('disgust'),
    innerX + colW + colGap, panelY + 10, colW, bodySize, extras, extras);

  stroke('#CFD8DC');
  line(innerX + colW + colGap / 2, panelY + 10,
       innerX + colW + colGap / 2, max(leftEnd, rightEnd));
  noStroke();

  // The shared-features callout, in the amber that marks lower accuracy.
  const calloutY = max(leftEnd, rightEnd) + 6;
  const available = panelY + panelH - calloutY - 8;
  const note = isNarrow ? COMPARE_NOTE_SHORT : COMPARE_NOTE_LONG;

  textSize(bodySize);
  const noteLines = wrapToLines(note, innerW - 16);
  const needed = 20 + noteLines.length * (bodySize + 3) + 8;
  const calloutH = min(available, needed);

  if (calloutH > 30) {
    fill(255, 243, 224);
    stroke('#FFB74D');
    rect(innerX, calloutY, innerW, calloutH, 8);
    noStroke();
    fill('#E65100');
    textAlign(LEFT, TOP);
    textSize(bodySize - 2);
    text('Why these two get confused', innerX + 8, calloutY + 5);
    fill('#5D4037');
    textSize(bodySize);
    const fitLines = floor((calloutH - 26) / (bodySize + 3));
    drawWrapped(note, innerX + 8, calloutY + 19, innerW - 16, bodySize + 3, fitLines);
  }
  textSize(defaultTextSize);
}

// ---------------------------------------------------------------------------
// Hover tooltip: a lightweight preview of just the three features
// ---------------------------------------------------------------------------
function drawTooltip(index) {
  const e = EMOTIONS[index];
  const parts = ['Brows: ' + e.brow, 'Eyes: ' + e.eyes, 'Mouth: ' + e.mouth];
  const tipW = min(290, canvasWidth - 20);
  const lineH = 15;

  textSize(12);
  let allLines = [];
  for (let i = 0; i < parts.length; i++) {
    allLines = allLines.concat(wrapToLines(parts[i], tipW - 16));
  }
  const tipH = allLines.length * lineH + 10;

  const r = cellRects[index];
  const tipX = constrain(r.x + r.w / 2 - tipW / 2, 6, canvasWidth - tipW - 6);
  let tipY = r.y + r.h + 6;
  if (tipY + tipH > drawHeight - 4) tipY = r.y - tipH - 6;

  fill(38, 50, 56, 245);
  stroke('#37474F');
  rect(tipX, tipY, tipW, tipH, 6);

  noStroke();
  fill('white');
  textAlign(LEFT, TOP);
  textSize(12);
  for (let i = 0; i < allLines.length; i++) {
    text(allLines[i], tipX + 8, tipY + 5 + i * lineH);
  }
  textSize(defaultTextSize);
}

// ---------------------------------------------------------------------------
// Label for the control strip
// ---------------------------------------------------------------------------
function drawControlLabels() {
  noStroke();
  fill('dimgray');
  textAlign(LEFT, CENTER);
  textSize(13);
  text('Hover a face to preview its features. Click one to read its full recipe.',
    10, drawHeight + 55);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}
