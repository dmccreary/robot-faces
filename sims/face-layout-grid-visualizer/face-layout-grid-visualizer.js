// Face Layout Grid Visualizer MicroSim
// Chapter 9: Facial Anatomy and Layout Design
// Bloom level: Understand (L2) - interpret, explain
// Interaction: hover to reveal. Each band reports its own percentage and the
// reason a robot face gives it that much room, so the learner can pause on one
// band at a time instead of watching an animation.
//
// CANVAS_HEIGHT: 490

// ---------------------------------------------------------------------------
// Layout constants (standard MicroSim pattern)
// ---------------------------------------------------------------------------
let canvasWidth = 800;
let drawHeight = 400;
let controlHeight = 90;           // two rows of controls plus a hint line
let canvasHeight = drawHeight + controlHeight;
let margin = 10;
let defaultTextSize = 16;

// ---------------------------------------------------------------------------
// The layout grid itself. These five percentages are the shared constants the
// whole sim runs on, so both display shapes divide their height identically.
// They add up to exactly 100.
// ---------------------------------------------------------------------------
const BANDS = [
  {
    name: 'Top margin',
    pct: 12,
    pale: '#CFD8DC', bright: '#90A4AE', ink: '#37474F',
    note: 'A gap at the top keeps an eyebrow from touching the screen edge, where a bezel can crop it.'
  },
  {
    name: 'Eye band',
    pct: 32,
    pale: '#B2DFDB', bright: '#26A69A', ink: '#00695C',
    note: 'Eyes take the largest share because they carry most of a robot face\'s expression.'
  },
  {
    name: 'Nose and cheek band',
    pct: 16,
    pale: '#FFE0B2', bright: '#FFB74D', ink: '#E65100',
    note: 'A thin, usually empty gap that keeps the eyes and the mouth from crowding each other.'
  },
  {
    name: 'Mouth band',
    pct: 28,
    pale: '#D1C4E9', bright: '#9575CD', ink: '#4527A0',
    note: 'The mouth sits low, like a real face, and needs room for a curve to bend up or down.'
  },
  {
    name: 'Bottom margin',
    pct: 12,
    pale: '#DCEDC8', bright: '#AED581', ink: '#33691E',
    note: 'A gap at the bottom keeps the lowest point of a smile or a frown on the screen.'
  }
];

// Where each feature sits, measured as a fraction of the display's height.
// These are derived from the band percentages above, never typed twice.
const EYE_BAND = 1;
const MOUTH_BAND = 3;

// The two display shapes this sim can render.
const SHAPES = {
  oled: { label: '128 x 64 OLED', w: 128, h: 64, round: false },
  round: { label: '240 x 240 Round', w: 240, h: 240, round: true }
};

// ---------------------------------------------------------------------------
// Model state
// ---------------------------------------------------------------------------
let shapeKey = 'oled';
let showReferenceLines = false;
let hoveredBand = -1;             // -1 means nothing is hovered

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
let shapeSelect;
let referenceCheckbox;

// ---------------------------------------------------------------------------
// Computed layout, refreshed every frame
// ---------------------------------------------------------------------------
let isNarrow = false;
let dispX = 0, dispY = 0, dispW = 0, dispH = 0;
let panelX = 0, panelY = 0, panelW = 0;
let legendX = 0, legendW = 0;
let infoX = 0, infoY = 0, infoW = 0, infoH = 0;
const PCT_GUTTER = 46;            // room to the right of the display for labels
const LEGEND_ROW_H = 22;
const LEGEND_TOP_OFFSET = 26;     // space for the "Bands, top to bottom" heading

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
function setup() {
  updateCanvasSize();
  const cnv = createCanvas(canvasWidth, canvasHeight);
  const parentEl = document.querySelector('main');
  cnv.parent(parentEl);

  shapeSelect = createSelect();
  shapeSelect.parent(parentEl);
  shapeSelect.option(SHAPES.oled.label, 'oled');
  shapeSelect.option(SHAPES.round.label, 'round');
  shapeSelect.selected('oled');
  shapeSelect.changed(function () { shapeKey = shapeSelect.value(); });

  referenceCheckbox = createCheckbox('Show real-face reference lines', false);
  referenceCheckbox.parent(parentEl);
  referenceCheckbox.changed(function () {
    showReferenceLines = referenceCheckbox.checked();
  });

  positionControls();

  describe(
    'A face layout grid. A rectangle shaped like a 128 by 64 display is split ' +
    'into five horizontal bands: top margin at 12 percent, eye band at 32 ' +
    'percent, nose and cheek band at 16 percent, mouth band at 28 percent, and ' +
    'bottom margin at 12 percent. A simple neutral face with two eyes, two flat ' +
    'eyebrows, and a flat mouth is drawn so each feature sits inside its band. ' +
    'Hovering a band names it and explains its purpose. A menu switches the ' +
    'display to a 240 by 240 round shape while keeping every percentage the same.'
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
  shapeSelect.position(120, drawHeight + 10);
  referenceCheckbox.position(10, drawHeight + 44);
}

// ---------------------------------------------------------------------------
// Layout helpers
// ---------------------------------------------------------------------------
function computeLayout() {
  isNarrow = canvasWidth < 600;

  const titleH = 34;
  const shape = SHAPES[shapeKey];
  const aspect = shape.w / shape.h;      // display width divided by height

  // The legend always needs a heading plus one row per band.
  const legendH = LEGEND_TOP_OFFSET + BANDS.length * LEGEND_ROW_H;

  let areaX, areaW, areaH;
  if (isNarrow) {
    // Legend and infobox move below the display and sit side by side there.
    panelW = canvasWidth - 2 * margin;
    areaX = margin;
    areaW = canvasWidth - 2 * margin - PCT_GUTTER;
    areaH = drawHeight - titleH - legendH - 2 * margin;
  } else {
    panelW = max(190, floor(canvasWidth * 0.35) - 2 * margin);
    areaX = margin;
    areaW = canvasWidth - panelW - 3 * margin - PCT_GUTTER;
    areaH = drawHeight - titleH - 2 * margin;
  }

  // Fit the display into the available box while keeping its aspect ratio.
  dispW = min(areaW, areaH * aspect);
  dispH = dispW / aspect;
  dispX = areaX + (areaW - dispW) / 2;
  dispY = titleH + (areaH - dispH) / 2;

  if (isNarrow) {
    panelX = margin;
    panelY = titleH + areaH + margin;
    legendX = panelX;
    legendW = floor(panelW * 0.52);
    infoW = panelW - legendW - 10;
    infoX = panelX + legendW + 10;
    infoY = panelY;
    infoH = legendH;
  } else {
    panelX = canvasWidth - panelW - margin;
    panelY = titleH + margin;
    legendX = panelX;
    legendW = panelW;
    infoX = panelX;
    infoW = panelW;
    infoY = panelY + legendH + 8;
    infoH = 118;
  }
}

// The top y coordinate of a band, on the canvas.
function bandTop(index) {
  let sum = 0;
  for (let i = 0; i < index; i++) sum += BANDS[i].pct;
  return dispY + (sum / 100) * dispH;
}

function bandHeight(index) {
  return (BANDS[index].pct / 100) * dispH;
}

// The vertical center of a band, as a fraction of the display's height.
function bandCenterFraction(index) {
  let sum = 0;
  for (let i = 0; i < index; i++) sum += BANDS[i].pct;
  return (sum + BANDS[index].pct / 2) / 100;
}

// ---------------------------------------------------------------------------
// Hover detection. The display bands and the legend rows both select a band,
// which makes the thin twelve-percent margins easy to reach.
// ---------------------------------------------------------------------------
function updateHover() {
  hoveredBand = -1;

  // Over the display?
  if (mouseX >= dispX && mouseX <= dispX + dispW &&
      mouseY >= dispY && mouseY <= dispY + dispH) {
    let insideShape = true;
    if (SHAPES[shapeKey].round) {
      const cx = dispX + dispW / 2;
      const cy = dispY + dispH / 2;
      const r = dispW / 2;
      insideShape = dist(mouseX, mouseY, cx, cy) <= r;
    }
    if (insideShape) {
      for (let i = 0; i < BANDS.length; i++) {
        if (mouseY >= bandTop(i) && mouseY <= bandTop(i) + bandHeight(i)) {
          hoveredBand = i;
          return;
        }
      }
    }
  }

  // Over a legend row?
  const listTop = panelY + LEGEND_TOP_OFFSET;
  if (mouseX >= legendX && mouseX <= legendX + legendW) {
    const row = floor((mouseY - listTop) / LEGEND_ROW_H);
    if (row >= 0 && row < BANDS.length && mouseY >= listTop) {
      hoveredBand = row;
    }
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

  drawTitle();
  drawDisplay();
  drawPercentGutter();
  drawLegend();
  drawInfobox();
  drawControlLabels();
}

function drawTitle() {
  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(canvasWidth < 500 ? 18 : 22);
  const titleX = isNarrow ? canvasWidth / 2 : (canvasWidth - panelW - margin) / 2;
  text('Face Layout Grid: ' + SHAPES[shapeKey].label, titleX, 6);
  textSize(defaultTextSize);
  textAlign(LEFT, TOP);
}

// The bands, the face, and the optional reference line, all clipped to the
// selected display shape.
function drawDisplay() {
  const shape = SHAPES[shapeKey];

  push();
  drawingContext.save();
  if (shape.round) {
    drawingContext.beginPath();
    drawingContext.arc(dispX + dispW / 2, dispY + dispH / 2, dispW / 2, 0, TWO_PI);
    drawingContext.clip();
  } else {
    drawingContext.beginPath();
    drawingContext.rect(dispX, dispY, dispW, dispH);
    drawingContext.clip();
  }

  // One pale rectangle per band, brighter when hovered.
  noStroke();
  for (let i = 0; i < BANDS.length; i++) {
    fill(hoveredBand === i ? lerpColor(color(BANDS[i].pale), color(BANDS[i].bright), 0.45)
                           : color(BANDS[i].pale));
    rect(dispX, bandTop(i), dispW, bandHeight(i));
  }

  // Thin dividing lines between bands
  stroke(255, 255, 255, 200);
  strokeWeight(1);
  for (let i = 1; i < BANDS.length; i++) {
    line(dispX, bandTop(i), dispX + dispW, bandTop(i));
  }

  if (showReferenceLines) drawReferenceLines();
  drawNeutralFace();

  // The hovered band gets a bright border. It is drawn inside the clip so a
  // round display trims the border to the circle instead of showing a
  // rectangle floating outside the screen.
  if (hoveredBand >= 0) {
    noFill();
    stroke(BANDS[hoveredBand].bright);
    strokeWeight(4);
    rect(dispX, bandTop(hoveredBand), dispW, bandHeight(hoveredBand));
    strokeWeight(1);
  }

  drawingContext.restore();
  pop();

  // The display's own outline
  noFill();
  stroke('#455A64');
  strokeWeight(2);
  if (shape.round) {
    ellipse(dispX + dispW / 2, dispY + dispH / 2, dispW, dispH);
  } else {
    rect(dispX, dispY, dispW, dispH);
  }
  strokeWeight(1);
}

// A simple neutral face: two eyes, a flat eyebrow over each, and a flat mouth.
// Every size is a fraction of the display, so the face keeps its proportions
// when the display shape changes.
function drawNeutralFace() {
  const eyeCy = dispY + bandCenterFraction(EYE_BAND) * dispH;
  const mouthCy = dispY + bandCenterFraction(MOUTH_BAND) * dispH;
  const leftCx = dispX + 0.32 * dispW;
  const rightCx = dispX + 0.68 * dispW;
  const eyeRx = 0.085 * dispW;
  const eyeRy = 0.085 * dispH;

  noStroke();
  fill('#263238');
  ellipse(leftCx, eyeCy, eyeRx * 2, eyeRy * 2);
  ellipse(rightCx, eyeCy, eyeRx * 2, eyeRy * 2);

  // Flat eyebrows, still inside the eye band
  const browY = eyeCy - eyeRy - 0.035 * dispH;
  const browHalf = 0.10 * dispW;
  const browThick = max(2, 0.014 * dispH);
  rect(leftCx - browHalf, browY - browThick / 2, browHalf * 2, browThick, 2);
  rect(rightCx - browHalf, browY - browThick / 2, browHalf * 2, browThick, 2);

  // A small flat mouth in the middle of the mouth band
  const mouthHalf = 0.15 * dispW;
  const mouthThick = max(3, 0.022 * dispH);
  rect(dispX + dispW / 2 - mouthHalf, mouthCy - mouthThick / 2,
    mouthHalf * 2, mouthThick, 3);
}

// The classic portrait guideline: on a real face, the eyes sit at the vertical
// midpoint of the head. On this robot face they sit higher.
function drawReferenceLines() {
  const midY = dispY + dispH / 2;
  stroke(198, 40, 40, 180);
  strokeWeight(2);
  drawingContext.setLineDash([6, 5]);
  line(dispX, midY, dispX + dispW, midY);
  drawingContext.setLineDash([]);
  strokeWeight(1);

  noStroke();
  fill(198, 40, 40);
  textAlign(LEFT, TOP);
  textSize(12);
  text('Real face: eyes at the middle', dispX + 10, midY + 4);
  textSize(defaultTextSize);
}

// Percentages live in a gutter to the right of the display, where they never
// collide with the face or with a round display's curved edge.
function drawPercentGutter() {
  const x = dispX + dispW + 6;
  noStroke();
  textAlign(LEFT, CENTER);
  textSize(12);
  for (let i = 0; i < BANDS.length; i++) {
    const y = bandTop(i) + bandHeight(i) / 2;
    stroke(BANDS[i].bright);
    strokeWeight(hoveredBand === i ? 3 : 1);
    line(dispX + dispW, y, x - 2, y);
    noStroke();
    fill(hoveredBand === i ? BANDS[i].ink : '#546E7A');
    text(BANDS[i].pct + '%', x + 2, y);
  }
  strokeWeight(1);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}

// A legend row per band. Hovering a row highlights the matching band, which
// makes the thin twelve-percent margins easy to reach with a mouse.
function drawLegend() {
  noStroke();
  fill('black');
  textAlign(LEFT, TOP);
  textSize(14);
  text('Bands, top to bottom', legendX, panelY);

  const listTop = panelY + LEGEND_TOP_OFFSET;
  for (let i = 0; i < BANDS.length; i++) {
    const y = listTop + i * LEGEND_ROW_H;
    if (hoveredBand === i) {
      noStroke();
      fill(255, 255, 255, 220);
      rect(legendX - 4, y - 2, legendW + 8, LEGEND_ROW_H - 2, 4);
    }
    noStroke();
    fill(BANDS[i].pale);
    stroke(BANDS[i].bright);
    rect(legendX, y + 2, 14, 14, 3);
    noStroke();
    fill(hoveredBand === i ? BANDS[i].ink : '#37474F');
    textSize(13);
    text(BANDS[i].name + '  ' + BANDS[i].pct + '%', legendX + 20, y + 3);
  }
  textSize(defaultTextSize);
}

// The infobox reports the hovered band's name, its percentage, and one sentence
// on why a robot face gives it that much room.
function drawInfobox() {
  fill(255, 255, 255, 235);
  stroke(200);
  rect(infoX, infoY, infoW, infoH, 10);

  noStroke();
  textAlign(LEFT, TOP);
  const innerX = infoX + 9;
  const wrapW = infoW - 18;

  if (hoveredBand < 0) {
    fill('#37474F');
    textSize(13);
    text('Hover any band, on the display or in the list, to see what it is for ' +
      'and how much of the height it takes.', innerX, infoY + 8, wrapW, infoH - 16);
  } else {
    const band = BANDS[hoveredBand];
    fill(band.ink);
    textSize(15);
    text(band.name + ' - ' + band.pct + '%', innerX, infoY + 7, wrapW, 40);
    fill('#37474F');
    textSize(13);
    text(band.note, innerX, infoY + 29, wrapW, infoH - 36);
  }
  textSize(defaultTextSize);
}

// Labels drawn inside the white control region.
function drawControlLabels() {
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);
  text('Display shape:', 10, drawHeight + 21);

  fill('dimgray');
  textSize(13);
  text('Every band keeps the same percentage of height in both shapes.',
    10, drawHeight + 76);
  textSize(defaultTextSize);
  textAlign(LEFT, TOP);
}
