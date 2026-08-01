// Valence-Arousal Quadrant Plotter MicroSim
// Chapter 11: Expression Design, Readability & Human-Robot Interaction
// Bloom level: Apply (L3) - classify, apply, demonstrate
// Interaction: click to place a point, then read its quadrant and its nearby
// expressions. Applying the model beats looking at a finished grid.
//
// CANVAS_HEIGHT: 500

// ---------------------------------------------------------------------------
// Layout constants (standard MicroSim pattern)
// ---------------------------------------------------------------------------
let canvasWidth = 800;
let drawHeight = 440;
let controlHeight = 60;           // one row of controls plus a hint line
let canvasHeight = drawHeight + controlHeight;
let margin = 10;
let defaultTextSize = 16;

// How close two points must be, in grid units, to count as easy to confuse.
const NEAR_THRESHOLD = 0.35;

// ---------------------------------------------------------------------------
// The thirteen Chapter 10 expressions, placed on the valence-arousal grid.
// Valence runs -1 (unpleasant) to +1 (pleasant); arousal runs -1 (calm) to
// +1 (energetic).
// ---------------------------------------------------------------------------
const PRESETS = [
  { name: 'Neutral', v: 0.00, a: 0.00,
    why: 'The rest state sits at the origin: neither pleasant nor unpleasant, neither calm nor energetic.' },
  { name: 'Happy', v: 0.70, a: 0.32,
    why: 'Clearly pleasant, and moderately energetic rather than fully excited.' },
  { name: 'Excited', v: 0.78, a: 0.88, below: true,
    why: 'Happy pushed to its maximum, so it lands deep in the pleasant, energetic corner.' },
  { name: 'Surprised', v: 0.06, a: 0.88,
    why: 'Very high arousal with valence near zero, because a surprise can be good news or bad.' },
  { name: 'Afraid', v: -0.28, a: 0.84,
    why: 'Unpleasant and highly aroused, sitting close to surprised, which is exactly why the two get confused.' },
  { name: 'Angry', v: -0.72, a: 0.62,
    why: 'Strongly unpleasant with high energy, sharing a quadrant with afraid and disgusted.' },
  { name: 'Disgusted', v: -0.66, a: 0.34,
    why: 'Unpleasant and fairly energetic, close enough to angry that a simple face can blur them.' },
  { name: 'Contempt', v: -0.46, a: 0.06,
    why: 'Mildly unpleasant and very low energy, part of why this expression is so easy to miss.' },
  { name: 'Stern', v: -0.20, a: 0.20,
    why: 'Slightly unpleasant with modest energy: serious attention rather than an upset feeling.' },
  { name: 'Confused', v: -0.14, a: 0.44,
    why: 'Slightly unpleasant with moderate arousal, since confusion is alert but not comfortable.' },
  { name: 'Sad', v: -0.66, a: -0.36,
    why: 'Unpleasant and low energy, sitting almost exactly opposite excited across the grid.' },
  { name: 'Tired', v: -0.42, a: -0.58,
    why: 'Low energy with mildly unpleasant valence, sitting between sad and sleepy.' },
  { name: 'Sleepy', v: -0.22, a: -0.84,
    why: 'The lowest-arousal expression in the whole set, with valence close to neutral.' }
];

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let myPoints = [];                // points the learner has placed
let showPresets = true;
let hoverPreset = -1;
let hoverMine = -1;

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
let presetCheckbox;
let resetButton;

// ---------------------------------------------------------------------------
// Computed layout, refreshed every frame
// ---------------------------------------------------------------------------
let isNarrow = false;
let gridX = 0, gridY = 0, gridSize = 0;
let infoX = 0, infoY = 0, infoW = 0, infoH = 0;

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
function setup() {
  updateCanvasSize();
  const cnv = createCanvas(canvasWidth, canvasHeight);
  const parentEl = document.querySelector('main');
  cnv.parent(parentEl);

  presetCheckbox = createCheckbox(' Show all 13 expressions', true);
  presetCheckbox.parent(parentEl);
  presetCheckbox.changed(function () {
    showPresets = presetCheckbox.checked();
  });

  resetButton = createButton('Reset My Points');
  resetButton.parent(parentEl);
  resetButton.mousePressed(function () { myPoints = []; });

  positionControls();

  describe(
    'A square valence-arousal grid. Valence runs left to right from unpleasant ' +
    'to pleasant, and arousal runs bottom to top from calm to energetic, so the ' +
    'grid splits into four labeled quadrants. Thirteen small markers show where ' +
    'each named expression from the previous chapter falls. Clicking the grid ' +
    'drops a new point, and an infobox reports that point\'s valence, arousal, ' +
    'quadrant, and any expressions close enough to be easily confused with it.'
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
  presetCheckbox.position(10, drawHeight + 12);
  resetButton.position(220, drawHeight + 8);
}

// The grid always stays square; the infobox takes whatever is left.
function computeLayout() {
  isNarrow = canvasWidth < 600;
  const titleH = 28;
  const axisGutter = 34;          // room for the axis labels below and left

  if (isNarrow) {
    const boxH = drawHeight - titleH - 152 - axisGutter;   // 152 for the infobox
    gridSize = max(120, min(canvasWidth - 2 * margin - axisGutter, boxH));
    gridX = margin + axisGutter;
    gridY = titleH;
    infoX = margin;
    infoY = gridY + gridSize + axisGutter;
    infoW = canvasWidth - 2 * margin;
    infoH = drawHeight - infoY - 8;
  } else {
    const leftW = floor(canvasWidth * 0.65);
    gridSize = max(140, min(leftW - 2 * margin - axisGutter,
      drawHeight - titleH - axisGutter - 10));
    gridX = margin + axisGutter;
    gridY = titleH;
    infoX = leftW + 4;
    infoY = titleH;
    infoW = canvasWidth - infoX - margin;
    infoH = drawHeight - titleH - 12;
  }
}

// ---------------------------------------------------------------------------
// Grid coordinate helpers
// ---------------------------------------------------------------------------
function valenceToX(v) { return gridX + (v + 1) / 2 * gridSize; }
function arousalToY(a) { return gridY + (1 - a) / 2 * gridSize; }
function xToValence(x) { return (x - gridX) / gridSize * 2 - 1; }
function yToArousal(y) { return 1 - (y - gridY) / gridSize * 2; }

function insideGrid(x, y) {
  return x >= gridX && x <= gridX + gridSize &&
         y >= gridY && y <= gridY + gridSize;
}

// Which quadrant a coordinate pair lands in.
function quadrantName(v, a) {
  if (abs(v) < 0.06 || abs(a) < 0.06) {
    return 'On the border between quadrants';
  }
  return (v >= 0 ? 'Pleasant' : 'Unpleasant') + '/' +
         (a >= 0 ? 'Energetic' : 'Calm');
}

// Preset expressions within the confusion threshold of a point.
function nearbyNames(v, a, skipIndex) {
  const out = [];
  for (let i = 0; i < PRESETS.length; i++) {
    if (i === skipIndex) continue;
    const d = dist(v, a, PRESETS[i].v, PRESETS[i].a);
    if (d <= NEAR_THRESHOLD) out.push(PRESETS[i].name + ' (' + nf(d, 1, 2) + ')');
  }
  return out;
}

// ---------------------------------------------------------------------------
// Interaction
// ---------------------------------------------------------------------------
function mousePressed() {
  if (!insideGrid(mouseX, mouseY)) return;
  myPoints.push({
    v: constrain(xToValence(mouseX), -1, 1),
    a: constrain(yToArousal(mouseY), -1, 1)
  });
}

function updateHover() {
  hoverPreset = -1;
  hoverMine = -1;
  let best = 14;                  // pixels

  if (showPresets) {
    for (let i = 0; i < PRESETS.length; i++) {
      const d = dist(mouseX, mouseY, valenceToX(PRESETS[i].v),
        arousalToY(PRESETS[i].a));
      if (d < best) { best = d; hoverPreset = i; hoverMine = -1; }
    }
  }
  for (let i = 0; i < myPoints.length; i++) {
    const d = dist(mouseX, mouseY, valenceToX(myPoints[i].v),
      arousalToY(myPoints[i].a));
    if (d < best) { best = d; hoverMine = i; hoverPreset = -1; }
  }
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
  textAlign(LEFT, TOP);
  textSize(isNarrow ? 15 : 19);
  text('Valence-Arousal Quadrant Plotter', margin, 5, canvasWidth - 20, 24);
  textSize(defaultTextSize);

  drawGrid();
  drawMarkers();
  drawInfobox();
  drawControlLabels();
}

function drawGrid() {
  const midX = valenceToX(0);
  const midY = arousalToY(0);

  // Four lightly shaded quadrants
  noStroke();
  fill('#E8F5E9'); rect(midX, gridY, gridSize / 2, gridSize / 2);          // pleasant, energetic
  fill('#E3F2FD'); rect(midX, midY, gridSize / 2, gridSize / 2);           // pleasant, calm
  fill('#FFEBEE'); rect(gridX, gridY, gridSize / 2, gridSize / 2);         // unpleasant, energetic
  fill('#ECEFF1'); rect(gridX, midY, gridSize / 2, gridSize / 2);          // unpleasant, calm

  // Quadrant names, tucked into each corner
  fill('#90A4AE');
  textSize(isNarrow ? 10 : 12);
  textAlign(LEFT, TOP);
  // The top labels sit a little lower so the surprised marker clears them.
  text('Unpleasant/Energetic', gridX + 6, gridY + 24);
  text('Unpleasant/Calm', gridX + 6, gridY + gridSize - 18);
  textAlign(RIGHT, TOP);
  text('Pleasant/Energetic', gridX + gridSize - 6, gridY + 24);
  text('Pleasant/Calm', gridX + gridSize - 6, gridY + gridSize - 18);
  textAlign(LEFT, TOP);

  // Grid lines every 0.5 units
  stroke(255);
  strokeWeight(1);
  for (let g = -0.5; g <= 0.75; g += 0.5) {
    if (abs(g) < 0.01) continue;
    line(valenceToX(g), gridY, valenceToX(g), gridY + gridSize);
    line(gridX, arousalToY(g), gridX + gridSize, arousalToY(g));
  }

  // Axes and border
  stroke('#78909C');
  strokeWeight(1.5);
  line(gridX, midY, gridX + gridSize, midY);
  line(midX, gridY, midX, gridY + gridSize);
  noFill();
  stroke('#455A64');
  rect(gridX, gridY, gridSize, gridSize);
  strokeWeight(1);

  // Axis labels
  noStroke();
  fill('#37474F');
  textSize(12);
  textAlign(LEFT, TOP);
  text('Unpleasant', gridX, gridY + gridSize + 6);
  textAlign(RIGHT, TOP);
  text('Pleasant', gridX + gridSize, gridY + gridSize + 6);
  textAlign(CENTER, TOP);
  text('valence', gridX, gridY + gridSize + 20, gridSize, 16);

  push();
  translate(gridX - 12, gridY);
  rotate(-HALF_PI);
  textAlign(LEFT, BOTTOM);
  text('Calm', -gridSize, 0);
  textAlign(RIGHT, BOTTOM);
  text('Energetic', 0, 0);
  textAlign(CENTER, TOP);
  text('arousal', -gridSize, 2, gridSize, 16);
  pop();
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}

function drawMarkers() {
  // Preset expressions
  if (showPresets) {
    for (let i = 0; i < PRESETS.length; i++) {
      const x = valenceToX(PRESETS[i].v);
      const y = arousalToY(PRESETS[i].a);
      const on = hoverPreset === i;
      noStroke();
      fill(on ? '#B71C1C' : '#455A64');
      circle(x, y, on ? 11 : 7);
      fill(on ? '#B71C1C' : '#37474F');
      textSize(on ? 12 : 10);
      // Labels flip to the left of the dot near the right edge so they never
      // run off the grid, and a crowded marker can ask for its label below.
      if (PRESETS[i].below) {
        textAlign(RIGHT, TOP);
        text(PRESETS[i].name, min(x + 26, gridX + gridSize - 4), y + 5);
      } else if (x > gridX + gridSize * 0.7) {
        textAlign(RIGHT, CENTER);
        text(PRESETS[i].name, x - 7, y - 1);
      } else {
        textAlign(LEFT, CENTER);
        text(PRESETS[i].name, x + 7, y - 1);
      }
    }
  }

  // Points the learner placed, in a color of their own
  for (let i = 0; i < myPoints.length; i++) {
    const x = valenceToX(myPoints[i].v);
    const y = arousalToY(myPoints[i].a);
    const on = hoverMine === i;
    stroke('white');
    strokeWeight(1.5);
    fill(on ? '#4A148C' : '#7B1FA2');
    circle(x, y, on ? 15 : 12);
    noStroke();
    fill('white');
    textSize(9);
    textAlign(CENTER, CENTER);
    text(i + 1, x, y);
  }
  strokeWeight(1);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}

// Coordinates, quadrant, and the nearby-and-easily-confused list.
function drawInfobox() {
  fill(255, 255, 255, 240);
  stroke(200);
  rect(infoX, infoY, infoW, infoH, 8);
  noStroke();

  const innerX = infoX + 9;
  const wrapW = infoW - 18;
  let cy = infoY + 8;
  textAlign(LEFT, TOP);

  // Work out which point the infobox is describing.
  let v, a, title, note, skip = -1;
  if (hoverPreset >= 0) {
    v = PRESETS[hoverPreset].v;
    a = PRESETS[hoverPreset].a;
    title = PRESETS[hoverPreset].name + ' (preset expression)';
    note = PRESETS[hoverPreset].why;
    skip = hoverPreset;
  } else if (hoverMine >= 0) {
    v = myPoints[hoverMine].v;
    a = myPoints[hoverMine].a;
    title = 'Your point ' + (hoverMine + 1);
    note = '';
  } else if (myPoints.length > 0) {
    const last = myPoints[myPoints.length - 1];
    v = last.v;
    a = last.a;
    title = 'Your point ' + myPoints.length + ' (most recent)';
    note = '';
  } else {
    fill('#37474F');
    textSize(13);
    text('Click anywhere on the grid to place a point. This panel will name ' +
      'its quadrant and list the expressions close enough to be confused ' +
      'with it. Hover any marker to preview it instead.',
      innerX, cy, wrapW, infoH - 16);
    textSize(defaultTextSize);
    return;
  }

  fill('black');
  textSize(isNarrow ? 14 : 15);
  text(title, innerX, cy, wrapW, 40);
  cy += isNarrow ? 20 : 24;

  fill('#0D47A1');
  textSize(13);
  text('valence ' + nf(v, 1, 2) + ',  arousal ' + nf(a, 1, 2),
    innerX, cy, wrapW, 20);
  cy += 19;

  fill('#1B5E20');
  textSize(isNarrow ? 13 : 14);
  text('Quadrant: ' + quadrantName(v, a), innerX, cy, wrapW, 38);
  cy += isNarrow ? 24 : 34;

  if (note !== '') {
    fill('#546E7A');
    textSize(12);
    text(note, innerX, cy, wrapW, isNarrow ? 46 : 62);
    cy += isNarrow ? 46 : 62;
  }

  fill('black');
  textSize(13);
  if (!showPresets) {
    text('Expression markers are hidden, so no neighbors are listed.',
      innerX, cy, wrapW, 40);
  } else {
    const near = nearbyNames(v, a, skip);
    if (near.length === 0) {
      text('No expression sits within ' + NEAR_THRESHOLD +
        ' of this point, so it has room of its own on the grid.',
        innerX, cy, wrapW, 44);
    } else {
      text('Nearby, and therefore easy to confuse with this point:',
        innerX, cy, wrapW, 34);
      cy += isNarrow ? 30 : 32;
      fill('#4A148C');
      textSize(12);
      text(near.join(',  '), innerX, cy, wrapW,
        infoY + infoH - cy - 8);
    }
  }
  textSize(defaultTextSize);
}

// Labels drawn inside the white control region.
function drawControlLabels() {
  noStroke();
  fill('dimgray');
  textAlign(LEFT, CENTER);
  textSize(12);
  text('Distances in parentheses are grid units. Anything under ' +
    NEAR_THRESHOLD + ' is a confusion risk on a simple face.',
    10, drawHeight + 44);
  textSize(defaultTextSize);
  textAlign(LEFT, TOP);
}
