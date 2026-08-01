// Blit Transparency Key Visualizer MicroSim
// Chapter 6: Basic Drawing Primitives
// Bloom level: Analyze (L4) - differentiate, examine
// Interaction: drag and compare. The learner drags one sprite over a patterned
// buffer and flips the transparency key on and off to contrast the two results.
//
// CANVAS_HEIGHT: 470

// ---------------------------------------------------------------------------
// Layout constants (standard MicroSim pattern)
// ---------------------------------------------------------------------------
let canvasWidth = 800;
let drawHeight = 420;
let controlHeight = 50;           // one row of controls
let canvasHeight = drawHeight + controlHeight;
let margin = 16;
let defaultTextSize = 16;

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
let keyCheckbox;
let resetButton;

// ---------------------------------------------------------------------------
// The simulated frame buffer
// Every value in bufferCodes is one of the three color codes below. The buffer
// is rebuilt only when the sprite moves or the transparency key changes.
// ---------------------------------------------------------------------------
const BUF_W = 128;                // buffer width in pixels
const BUF_H = 64;                 // buffer height in pixels
const SPRITE_SIZE = 24;           // the sprite's square bounding box
const STRIPE_WIDTH = 8;           // background stripe width in pixels

// The two background stripe colors are kept distinct from the sprite's pure
// white so the copied circle stays visible over either stripe.
const CODE_STRIPE_A = 0;          // teal stripe
const CODE_STRIPE_B = 1;          // pale stripe
const CODE_WHITE = 2;             // the sprite's circle
const CODE_BLACK = 3;             // the sprite's bounding-box background

// RGB values for each code, used when the buffer is painted.
const CODE_RGB = [
  [0, 150, 136],                  // teal
  [206, 236, 233],                // pale teal-white
  [255, 255, 255],                // white
  [20, 20, 20]                    // black
];

let bufferCodes = new Uint8Array(BUF_W * BUF_H);
let spriteCodes = new Uint8Array(SPRITE_SIZE * SPRITE_SIZE);
let fbGraphics;                   // offscreen image holding the buffer
let spriteGraphics;               // offscreen image of the sprite as stored
let bufferDirty = true;

// ---------------------------------------------------------------------------
// Model state
// ---------------------------------------------------------------------------
const START_X = 6;
const START_Y = 6;
let spriteX = START_X;            // sprite position in buffer pixels
let spriteY = START_Y;
let useColorKey = false;          // the transparency toggle, default off
let dragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

// Computed layout, refreshed every frame
let bufX = 0;
let bufY = 64;
let bufScale = 4;
let panelX = 0;
let panelY = 0;
let panelW = 0;
let panelH = 0;
let isNarrow = false;

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------
function setup() {
  updateCanvasSize();
  const cnv = createCanvas(canvasWidth, canvasHeight);
  cnv.parent(document.querySelector('main'));

  const parentEl = document.querySelector('main');

  keyCheckbox = createCheckbox(' Transparent color key', false);
  keyCheckbox.parent(parentEl);
  keyCheckbox.changed(() => {
    useColorKey = keyCheckbox.checked();
    bufferDirty = true;
  });

  resetButton = createButton('Reset');
  resetButton.parent(parentEl);
  resetButton.size(70);
  resetButton.mousePressed(resetAll);

  fbGraphics = createGraphics(BUF_W, BUF_H);
  fbGraphics.pixelDensity(1);
  spriteGraphics = createGraphics(SPRITE_SIZE, SPRITE_SIZE);
  spriteGraphics.pixelDensity(1);

  buildSprite();
  paintSprite();
  positionControls();
  noSmooth();                     // keep scaled-up pixels square and crisp

  describe(
    'A simulated frame buffer striped in teal and white, with a draggable ' +
    'sprite made of a white circle inside a black square. With the color key ' +
    'off, the whole black square overwrites the stripes. With the color key ' +
    'on, the black pixels are skipped and only the circle is copied.'
  );
}

// The sprite as it sits in memory: a white circle inside a black square.
function buildSprite() {
  const center = (SPRITE_SIZE - 1) / 2;
  const radius = SPRITE_SIZE / 2 - 0.5;
  for (let sy = 0; sy < SPRITE_SIZE; sy++) {
    for (let sx = 0; sx < SPRITE_SIZE; sx++) {
      const dx = sx - center;
      const dy = sy - center;
      const inside = (dx * dx + dy * dy) <= radius * radius;
      spriteCodes[sy * SPRITE_SIZE + sx] = inside ? CODE_WHITE : CODE_BLACK;
    }
  }
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
  keyCheckbox.position(10, drawHeight + 15);
  resetButton.position(max(220, canvasWidth - 70 - margin), drawHeight + 12);
}

function resetAll() {
  spriteX = START_X;
  spriteY = START_Y;
  useColorKey = false;
  keyCheckbox.checked(false);
  dragging = false;
  bufferDirty = true;
}

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------
function computeLayout() {
  isNarrow = canvasWidth < 620;
  bufY = 64;

  let availW;
  let availH;
  if (isNarrow) {
    panelH = 140;
    availW = canvasWidth - 2 * margin;
    availH = drawHeight - bufY - panelH - 50;
    panelX = margin;
    panelW = canvasWidth - 2 * margin;
    panelY = drawHeight - panelH - 8;
  } else {
    availW = canvasWidth * 0.65 - 2 * margin;
    availH = drawHeight - bufY - 44;
    panelX = canvasWidth * 0.65 + 4;
    panelW = canvasWidth - panelX - margin;
    panelY = bufY - 20;
    panelH = drawHeight - panelY - 14;
  }

  availW = max(64, availW);
  availH = max(32, availH);
  bufScale = max(1, min(availW / BUF_W, availH / BUF_H));
  bufX = margin + (availW - BUF_W * bufScale) / 2;
}

// ---------------------------------------------------------------------------
// The blit itself
// A blit copies a rectangle of source pixels into the buffer. With a color
// key, source pixels matching the key are skipped instead of copied.
// ---------------------------------------------------------------------------
function composeBuffer() {
  // Start from the background pattern that was already "drawn" on the buffer.
  for (let py = 0; py < BUF_H; py++) {
    for (let px = 0; px < BUF_W; px++) {
      const stripe = floor(px / STRIPE_WIDTH) % 2;
      bufferCodes[py * BUF_W + px] =
        stripe === 0 ? CODE_STRIPE_A : CODE_STRIPE_B;
    }
  }

  // Copy the sprite one source pixel at a time.
  for (let sy = 0; sy < SPRITE_SIZE; sy++) {
    for (let sx = 0; sx < SPRITE_SIZE; sx++) {
      const src = spriteCodes[sy * SPRITE_SIZE + sx];
      if (useColorKey && src === CODE_BLACK) continue;   // the key color is skipped
      const dx = spriteX + sx;
      const dy = spriteY + sy;
      if (dx < 0 || dx >= BUF_W || dy < 0 || dy >= BUF_H) continue;
      bufferCodes[dy * BUF_W + dx] = src;
    }
  }
  paintBuffer();
  bufferDirty = false;
}

// Push the code array into the offscreen image, one pixel per buffer pixel.
function paintBuffer() {
  fbGraphics.loadPixels();
  for (let i = 0; i < BUF_W * BUF_H; i++) {
    const rgb = CODE_RGB[bufferCodes[i]];
    fbGraphics.pixels[i * 4] = rgb[0];
    fbGraphics.pixels[i * 4 + 1] = rgb[1];
    fbGraphics.pixels[i * 4 + 2] = rgb[2];
    fbGraphics.pixels[i * 4 + 3] = 255;
  }
  fbGraphics.updatePixels();
}

function paintSprite() {
  spriteGraphics.loadPixels();
  for (let i = 0; i < SPRITE_SIZE * SPRITE_SIZE; i++) {
    const rgb = CODE_RGB[spriteCodes[i]];
    spriteGraphics.pixels[i * 4] = rgb[0];
    spriteGraphics.pixels[i * 4 + 1] = rgb[1];
    spriteGraphics.pixels[i * 4 + 2] = rgb[2];
    spriteGraphics.pixels[i * 4 + 3] = 255;
  }
  spriteGraphics.updatePixels();
}

// ---------------------------------------------------------------------------
// Dragging
// ---------------------------------------------------------------------------
function spriteScreenX() { return bufX + spriteX * bufScale; }
function spriteScreenY() { return bufY + spriteY * bufScale; }
function spriteScreenSide() { return SPRITE_SIZE * bufScale; }

function mousePressed() {
  const sx = spriteScreenX();
  const sy = spriteScreenY();
  const side = spriteScreenSide();
  if (mouseX >= sx && mouseX <= sx + side &&
      mouseY >= sy && mouseY <= sy + side) {
    dragging = true;
    dragOffsetX = mouseX - sx;
    dragOffsetY = mouseY - sy;
  }
}

function mouseDragged() {
  if (!dragging) return;
  moveSpriteTo(mouseX - dragOffsetX, mouseY - dragOffsetY);
  return false;                   // do not let the drag scroll the page
}

function mouseReleased() {
  dragging = false;
}

// Touch input reuses the same handlers so the sprite drags on a tablet too.
function touchStarted() { mousePressed(); }
function touchMoved() { mouseDragged(); return false; }
function touchEnded() { dragging = false; }

// Convert a screen position to a whole buffer pixel and clamp to the buffer.
function moveSpriteTo(screenX, screenY) {
  const nextX = round((screenX - bufX) / bufScale);
  const nextY = round((screenY - bufY) / bufScale);
  const clampedX = constrain(nextX, 0, BUF_W - SPRITE_SIZE);
  const clampedY = constrain(nextY, 0, BUF_H - SPRITE_SIZE);
  if (clampedX !== spriteX || clampedY !== spriteY) {
    spriteX = clampedX;
    spriteY = clampedY;
    bufferDirty = true;
  }
}

// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------
function draw() {
  updateCanvasSize();
  computeLayout();
  if (bufferDirty) composeBuffer();

  stroke('silver');
  fill('aliceblue');
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  drawTitle();
  drawBuffer();
  drawPanel();
}

function drawTitle() {
  noStroke();
  fill('black');
  textAlign(CENTER, TOP);
  textSize(canvasWidth < 520 ? 17 : 22);
  text('Blit Transparency Key Visualizer',
    canvasWidth * (isNarrow ? 0.5 : 0.33), 8);

  fill('dimgray');
  textSize(14);
  text('Drag the sprite, then flip the color key on and off',
    canvasWidth * (isNarrow ? 0.5 : 0.33), 36);
  textAlign(LEFT, TOP);
  textSize(defaultTextSize);
}

function drawBuffer() {
  const w = BUF_W * bufScale;
  const h = BUF_H * bufScale;

  noStroke();
  image(fbGraphics, bufX, bufY, w, h);

  noFill();
  stroke('dimgray');
  strokeWeight(1.5);
  rect(bufX, bufY, w, h);
  strokeWeight(1);

  // A dashed outline of the sprite's 24 x 24 bounding box. It stays the same
  // size whether or not the key is on, which is the point of the comparison.
  const side = spriteScreenSide();
  drawingContext.setLineDash([5, 4]);
  stroke('crimson');
  strokeWeight(1.5);
  noFill();
  rect(spriteScreenX(), spriteScreenY(), side, side);
  drawingContext.setLineDash([]);
  strokeWeight(1);

  noStroke();
  fill('dimgray');
  textAlign(LEFT, TOP);
  textSize(13);
  text('Dashed box: the 24 x 24 source rectangle the blit reads from. ' +
    'Drag it anywhere.', bufX, bufY + h + 8, w, 34);
  textSize(defaultTextSize);
}

// The panel: the live blit call, what the current mode does, and a legend.
function drawPanel() {
  noStroke();
  fill(255, 255, 255, 230);
  stroke(200);
  rect(panelX, panelY, panelW, panelH, 10);

  const compact = panelH < 200;
  const colW = compact ? panelW / 2 : panelW;
  const tx = panelX + 12;
  const tw = colW - 24;

  drawCodeBlock(tx, panelY + 10, tw, compact);

  const legendX = compact ? panelX + colW + 12 : tx;
  const legendY = compact ? panelY + 10 : panelY + 168;
  drawLegend(legendX, legendY, tw, compact);
}

function drawCodeBlock(x, y, w, compact) {
  // Vertical offsets tighten up when the panel sits below the buffer.
  const codeY = y + (compact ? 22 : 24);
  const modeY = y + (compact ? 56 : 66);
  const explainY = y + (compact ? 76 : 88);

  noStroke();
  textAlign(LEFT, TOP);

  fill('black');
  textSize(15);
  text('The blit call', x, y);

  const call = useColorKey
    ? 'fb.blit(sprite, ' + spriteX + ', ' + spriteY + ', BLACK)'
    : 'fb.blit(sprite, ' + spriteX + ', ' + spriteY + ')';

  fill('black');
  textFont('monospace');
  textSize(compact ? 12 : 13);
  text(call, x, codeY, w, 32);
  textFont('sans-serif');

  fill(useColorKey ? 'teal' : 'crimson');
  textSize(14);
  text(useColorKey ? 'Transparent blit' : 'Opaque blit', x, modeY);

  fill('dimgray');
  textSize(compact ? 12 : 13);
  const explain = useColorKey
    ? 'Every black source pixel is skipped, so the stripes show through ' +
      'around the circle.'
    : 'All 576 source pixels are copied, so the black corners erase the ' +
      'stripes underneath.';
  text(explain, x, explainY, w, compact ? 50 : 66);
  textSize(defaultTextSize);
}

function drawLegend(x, y, w, compact) {
  noStroke();
  textAlign(LEFT, TOP);

  fill('black');
  textSize(15);
  text('Legend', x, y);

  // The first row shows both stripe colors in one two-tone swatch.
  let rowY = y + 24;
  stroke(150);
  fill(CODE_RGB[CODE_STRIPE_A][0], CODE_RGB[CODE_STRIPE_A][1],
    CODE_RGB[CODE_STRIPE_A][2]);
  rect(x, rowY, 8, 16);
  fill(CODE_RGB[CODE_STRIPE_B][0], CODE_RGB[CODE_STRIPE_B][1],
    CODE_RGB[CODE_STRIPE_B][2]);
  rect(x + 8, rowY, 8, 16);
  noStroke();
  fill('black');
  textSize(13);
  text('background stripes', x + 24, rowY + 1);
  rowY += 24;

  const items = [
    [CODE_WHITE, 'sprite circle'],
    [CODE_BLACK, 'key color (BLACK)']
  ];
  for (let i = 0; i < items.length; i++) {
    const rgb = CODE_RGB[items[i][0]];
    stroke(150);
    fill(rgb[0], rgb[1], rgb[2]);
    rect(x, rowY, 16, 16);
    noStroke();
    fill('black');
    textSize(13);
    text(items[i][1], x + 24, rowY + 1);
    rowY += 24;
  }

  // The sprite exactly as it is stored, shown only when the panel is tall.
  if (!compact) {
    fill('dimgray');
    textSize(13);
    text('The sprite in memory (24 x 24):', x, rowY + 8);
    image(spriteGraphics, x, rowY + 30, 60, 60);
    stroke(150);
    noFill();
    rect(x, rowY + 30, 60, 60);
    noStroke();
  }
  textSize(defaultTextSize);
}
