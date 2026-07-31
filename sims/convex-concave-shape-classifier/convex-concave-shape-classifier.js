// Convex vs Concave Shape Classifier MicroSim
// Chapter 7: Ellipse & Polygon Drawing
// Bloom level: Analyze (L4) - differentiate, examine
// Interaction: classify-then-reveal. The learner commits to a judgment for each
// shape before the dented vertices are revealed in coral.
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

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
let convexButton;
let concaveButton;
let nextButton;
let explainButton;

// ---------------------------------------------------------------------------
// Shape library.
//
// Every shape is stored as its own array of points in a normalized 0..1 space,
// so the same data scales to any display size. Whether a shape is convex, and
// which vertices dent inward, are worked out from the point array itself.
// ---------------------------------------------------------------------------

// Build the 10 alternating points of a five-point star.
function starPoints(cx, cy, outerR, innerR) {
  const out = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5;
    const r = (i % 2 === 0) ? outerR : innerR;
    out.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return out;
}

// Build a regular polygon with the given number of sides.
function regularPoints(cx, cy, radius, sides) {
  const out = [];
  for (let i = 0; i < sides; i++) {
    const a = -Math.PI / 2 + i * 2 * Math.PI / sides;
    out.push([cx + radius * Math.cos(a), cy + radius * Math.sin(a)]);
  }
  return out;
}

const shapeSet = [
  {
    name: 'Triangle',
    pts: [[0.5, 0.08], [0.94, 0.9], [0.06, 0.9]],
    why: 'Every corner turns the same way as you walk around the outline, so ' +
         'nothing dents inward. Three-sided shapes are always convex.'
  },
  {
    name: 'Square',
    pts: [[0.14, 0.14], [0.86, 0.14], [0.86, 0.86], [0.14, 0.86]],
    why: 'All four corners turn the same direction, and a straight line between ' +
         'any two points inside the square stays inside it.'
  },
  {
    name: 'Five-Point Star',
    pts: starPoints(0.5, 0.5, 0.44, 0.18),
    why: 'The five inner points sit between the arms. Each one bends back the ' +
         'opposite way from the tips, which is exactly what a dent looks like.'
  },
  {
    name: 'Arrow',
    pts: [[0.06, 0.36], [0.54, 0.36], [0.54, 0.12], [0.94, 0.5],
          [0.54, 0.88], [0.54, 0.64], [0.06, 0.64]],
    why: 'The two corners where the thin shaft meets the wide head bend back ' +
         'inward, so the arrow is concave even though it looks simple.'
  },
  {
    name: 'L-Shape',
    pts: [[0.18, 0.1], [0.5, 0.1], [0.5, 0.58], [0.86, 0.58],
          [0.86, 0.9], [0.18, 0.9]],
    why: 'The inside corner of the L bends the opposite way from the other ' +
         'five corners. One dented vertex is enough to make a shape concave.'
  },
  {
    name: 'Pentagon',
    pts: regularPoints(0.5, 0.5, 0.44, 5),
    why: 'A regular pentagon turns by the same amount at every corner, always ' +
         'in the same direction, so no vertex dents inward.'
  },
  {
    name: 'Chevron',
    pts: [[0.06, 0.18], [0.5, 0.46], [0.94, 0.18], [0.94, 0.46],
          [0.5, 0.74], [0.06, 0.46]],
    why: 'The middle of the top edge dips down between the two ends. That dip ' +
         'is a vertex pointing back into the shape.'
  },
  {
    name: 'Hexagon',
    pts: regularPoints(0.5, 0.5, 0.44, 6),
    why: 'Like the pentagon, every corner of a regular hexagon turns the same ' +
         'direction by the same amount, so the shape is convex.'
  }
];

// ---------------------------------------------------------------------------
// Geometry: find the vertices that dent inward.
//
// Walk the outline and take the cross product at each corner. If a corner turns
// the opposite way from the shape's overall winding direction, that corner is
// reflex - it dents inward - and the shape is concave.
// ---------------------------------------------------------------------------
function findReflexVertices(pts) {
  const n = pts.length;
  let area2 = 0;
  for (let i = 0; i < n; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % n];
    area2 += a[0] * b[1] - b[0] * a[1];
  }
  const winding = area2 >= 0 ? 1 : -1;

  const reflex = [];
  for (let i = 0; i < n; i++) {
    const prev = pts[(i - 1 + n) % n];
    const cur = pts[i];
    const nxt = pts[(i + 1) % n];
    const cross = (cur[0] - prev[0]) * (nxt[1] - cur[1]) -
                  (cur[1] - prev[1]) * (nxt[0] - cur[0]);
    if (cross * winding < 0) reflex.push(i);
  }
  return reflex;
}

// Pre-compute the answer key once, at load time.
for (let i = 0; i < shapeSet.length; i++) {
  shapeSet[i].reflex = findReflexVertices(shapeSet[i].pts);
  shapeSet[i].isConvex = shapeSet[i].reflex.length === 0;
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let shapeIdx = 0;
let guess = '';                  // '' | 'convex' | 'concave'
let wasCorrect = false;
let correctCount = 0;
let seenCount = 0;
let showExplanation = false;

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
function setup() {
  updateCanvasSize();
  const cnv = createCanvas(canvasWidth, canvasHeight);
  const parentEl = document.querySelector('main');
  cnv.parent(parentEl);

  convexButton = createButton('Convex');
  convexButton.parent(parentEl);
  convexButton.mousePressed(function () { submitGuess('convex'); });

  concaveButton = createButton('Concave');
  concaveButton.parent(parentEl);
  concaveButton.mousePressed(function () { submitGuess('concave'); });

  nextButton = createButton('Next Shape');
  nextButton.parent(parentEl);
  nextButton.mousePressed(nextShape);

  explainButton = createButton('Show Explanation');
  explainButton.parent(parentEl);
  explainButton.mousePressed(toggleExplanation);

  positionControls();
  updateButtonStates();

  describe(
    'A classification exercise with eight polygons drawn one at a time on a ' +
    'simulated OLED screen. The learner labels each shape convex or concave, ' +
    'then sees whether the answer was right and which vertices, if any, dent ' +
    'inward toward the interior.'
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
  convexButton.position(10, row1Y);
  concaveButton.position(95, row1Y);
  nextButton.position(190, row1Y);
  explainButton.position(10, row2Y);
}

// ---------------------------------------------------------------------------
// Quiz logic
// ---------------------------------------------------------------------------
function submitGuess(choice) {
  if (guess !== '') return;                 // one guess per shape
  guess = choice;
  const shape = shapeSet[shapeIdx];
  wasCorrect = (choice === 'convex') === shape.isConvex;
  seenCount++;
  if (wasCorrect) correctCount++;
  updateButtonStates();
}

function nextShape() {
  if (guess === '') return;
  if (shapeIdx >= shapeSet.length - 1) {
    // The set is finished, so this button starts a fresh pass.
    shapeIdx = 0;
    correctCount = 0;
    seenCount = 0;
  } else {
    shapeIdx++;
  }
  guess = '';
  showExplanation = false;
  updateButtonStates();
}

function toggleExplanation() {
  if (guess === '') return;
  showExplanation = !showExplanation;
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
  const guessed = guess !== '';
  setEnabled(convexButton, !guessed);
  setEnabled(concaveButton, !guessed);
  setEnabled(nextButton, guessed);
  setEnabled(explainButton, guessed);
  nextButton.html(
    guessed && shapeIdx >= shapeSet.length - 1 ? 'Start Over' : 'Next Shape');
  explainButton.html(showExplanation ? 'Hide Explanation' : 'Show Explanation');
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
  text('Convex or Concave?', canvasWidth / 2, 6);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);

  if (narrow) {
    const w = canvasWidth - 2 * margin;
    const panelY = 36 + 178 + 10;
    drawShapePanel(margin, 36, w, 178);
    drawInfoPanel(margin, panelY, w, drawHeight - panelY - 8, 13);
  } else {
    const leftW = floor(canvasWidth * 0.62) - margin * 2;
    drawShapePanel(margin, 40, leftW, drawHeight - 40 - 12);
    const rightX = floor(canvasWidth * 0.63);
    const rightW = canvasWidth - rightX - margin;
    drawInfoPanel(rightX, 40, rightW, drawHeight - 40 - 12, 14);
  }

  drawControlLabels();
}

// The simulated OLED screen holding one polygon.
function drawShapePanel(x, y, w, h) {
  const shape = shapeSet[shapeIdx];

  // Screen background with a faint pixel grid
  stroke('silver');
  fill('black');
  rect(x, y, w, h, 6);

  stroke(45);
  strokeWeight(1);
  for (let gx = x + 16; gx < x + w; gx += 16) {
    line(gx, y + 1, gx, y + h - 1);
  }
  for (let gy = y + 16; gy < y + h; gy += 16) {
    line(x + 1, gy, x + w - 1, gy);
  }

  // Fit the normalized shape into the panel, leaving room for the caption
  const pad = 26;
  const size = min(w - 2 * pad, h - 2 * pad - 18);
  const ox = x + (w - size) / 2;
  const oy = y + (h - 18 - size) / 2 + 6;
  const screenPts = shape.pts.map(function (p) {
    return [ox + p[0] * size, oy + p[1] * size];
  });

  // The polygon outline, drawn the way an OLED would light it
  noFill();
  stroke('white');
  strokeWeight(2);
  beginShape();
  for (let i = 0; i < screenPts.length; i++) {
    vertex(screenPts[i][0], screenPts[i][1]);
  }
  endShape(CLOSE);
  strokeWeight(1);

  // Once a guess is locked in, mark every vertex that dents inward
  if (guess !== '') {
    // Explanation mode adds the straight line between a dented vertex's two
    // neighbors, so the learner can see the outline fall behind it.
    if (showExplanation) {
      for (let n = 0; n < shape.reflex.length; n++) {
        const i = shape.reflex[n];
        const prev = screenPts[(i - 1 + screenPts.length) % screenPts.length];
        const nxt = screenPts[(i + 1) % screenPts.length];
        stroke('gold');
        strokeWeight(1);
        drawingContext.setLineDash([5, 4]);
        line(prev[0], prev[1], nxt[0], nxt[1]);
        drawingContext.setLineDash([]);
      }
    }

    noStroke();
    for (let i = 0; i < screenPts.length; i++) {
      const isReflex = shape.reflex.indexOf(i) >= 0;
      fill(isReflex ? 'coral' : 'deepskyblue');
      circle(screenPts[i][0], screenPts[i][1], isReflex ? 11 : 6);
    }

    if (showExplanation) {
      // Number the vertices so the explanation text can point at one
      fill('lightgray');
      textSize(11);
      textAlign(CENTER, CENTER);
      for (let i = 0; i < screenPts.length; i++) {
        text(i, screenPts[i][0] + 12, screenPts[i][1] - 10);
      }
      textAlign(LEFT, TOP);
      textSize(defaultTextSize);
    }
  }

  // Caption
  noStroke();
  fill('white');
  textSize(14);
  textAlign(CENTER, BOTTOM);
  text('Shape ' + (shapeIdx + 1) + ' of ' + shapeSet.length + ': ' + shape.name,
    x + w / 2, y + h - 6);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}

// Score, feedback, and the optional explanation.
function drawInfoPanel(x, y, w, h, fontSize) {
  const shape = shapeSet[shapeIdx];

  fill(255, 255, 255, 230);
  stroke(200);
  rect(x, y, w, h, 10);

  noStroke();
  textAlign(LEFT, TOP);
  let cursorY = y + 10;

  // Running score
  fill('black');
  textSize(17);
  text('Correct: ' + correctCount + ' / ' + seenCount + ' shapes seen',
    x + 10, cursorY, w - 20, 24);
  cursorY += 30;

  if (guess === '') {
    fill('dimgray');
    textSize(fontSize);
    text('Examine the outline. Does any corner dent inward, back toward the ' +
         'middle of the shape? Click Convex or Concave to lock in your answer.',
      x + 10, cursorY, w - 20, h - (cursorY - y) - 12);
    textSize(defaultTextSize);
    return;
  }

  // Verdict line
  fill(wasCorrect ? 'darkgreen' : 'firebrick');
  textSize(16);
  text(wasCorrect ? 'Correct!' : 'Not quite.', x + 10, cursorY, w - 20, 22);
  cursorY += 24;

  fill('black');
  textSize(fontSize);
  const answer = shape.isConvex ? 'convex' : 'concave';
  text('The ' + shape.name + ' is ' + answer + '.', x + 10, cursorY, w - 20, 22);
  cursorY += 24;

  // One-sentence explanation of the classification
  fill('dimgray');
  textSize(fontSize - 1);
  const dentText = shape.isConvex
    ? 'No vertex dents inward, so every blue dot turns the same way.'
    : (shape.reflex.length === 1
      ? 'One vertex, shown in coral, dents inward toward the interior.'
      : shape.reflex.length + ' vertices, shown in coral, dent inward toward ' +
        'the interior.');
  text(dentText, x + 10, cursorY, w - 20, 40);
  cursorY += 44;

  if (showExplanation) {
    fill('black');
    textSize(fontSize - 1);
    let detail = shape.why;
    if (!shape.isConvex) {
      detail += '  Each gold dashed line joins a dented vertex to its two ' +
                'neighbors. The outline falls behind that line, and the gap ' +
                'is the dent.';
      detail += '  Dented vertex numbers: ' + shape.reflex.join(', ') + '.';
    }
    text(detail, x + 10, cursorY, w - 20, y + h - cursorY - 10);
  } else {
    fill('gray');
    textSize(fontSize - 2);
    text('Click Show Explanation for the reason, or Next Shape to continue.',
      x + 10, cursorY, w - 20, y + h - cursorY - 10);
  }
  textSize(defaultTextSize);
}

// Labels drawn inside the white control region.
function drawControlLabels() {
  noStroke();
  fill('dimgray');
  textAlign(LEFT, CENTER);
  textSize(13);
  // The first-row hint only fits once the control strip is wide enough.
  if (canvasWidth >= 620) {
    const hint = guess === ''
      ? 'Pick one: is this shape convex or concave?'
      : 'Answer locked in. Reveal the reason, or move on to the next shape.';
    text(hint, 300, drawHeight + 22);
  }
  text('Score so far: ' + correctCount + ' of ' + seenCount,
    170, drawHeight + 57);
  textSize(defaultTextSize);
  textAlign(LEFT, TOP);
}
