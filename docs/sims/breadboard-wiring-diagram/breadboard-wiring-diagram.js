// Interactive Breadboard Wiring Diagram MicroSim
// Chapter 1: Hardware & Electronics Foundations
// Bloom level: Analyze (L4) - examine, distinguish, organize
// CANVAS_HEIGHT: 560
// Learning objective: examine a complete wiring diagram, distinguish power
// wires from signal wires, and identify which Pico pin each display wire uses.

// ---------- Canvas regions ----------
let canvasWidth = 700;        // responsive: reset from the container width
let drawHeight = 400;         // breadboard illustration region
let infoHeight = 80;          // infobox strip under the illustration
let controlHeight = 80;       // two rows of controls
let canvasHeight = drawHeight + infoHeight + controlHeight;
let margin = 15;
let defaultTextSize = 16;

// ---------- Virtual drawing space ----------
// The whole illustration is designed in a fixed 700 x 360 coordinate space and
// then scaled to fit the container. That keeps every part in proportion at any
// browser width.
const VW = 700;
const VH = 360;
let viewScale = 1;            // virtual units -> screen pixels
let viewX = 0;                // screen x of virtual origin
let viewY = 0;                // screen y of virtual origin

// ---------- Controls ----------
let displaySelect;            // OLED or round color display
let labelCheckbox;            // show or hide pin labels

// ---------- State ----------
let selectedWire = -1;        // index into wireList, or -1 for nothing selected
let hoveredWire = -1;         // index under the mouse this frame

// The seven connections. Order matters: the display header and the Pico header
// list their pins in the same order, so no wire has to cross another one.
// The colors are all different so a student can name a wire by its color.
const wireList = [
  {
    name: 'SCK',
    picoPin: 'GP2',
    dispPin: 'SCK',
    wireColor: 'gold',
    kind: 'signal',
    info: 'SCK (Serial Clock): the Pico ticks this wire high and low so the ' +
          'display knows exactly when to read each bit of data.'
  },
  {
    name: 'SDA / MOSI',
    picoPin: 'GP3',
    dispPin: 'SDA',
    wireColor: 'orange',
    kind: 'signal',
    info: 'SDA / MOSI (data out): carries the actual pixel bits from the Pico ' +
          'to the display, one bit for every tick of the clock wire.'
  },
  {
    name: 'RES',
    picoPin: 'GP4',
    dispPin: 'RES',
    wireColor: 'darkviolet',
    kind: 'signal',
    info: 'RES (Reset): a short pulse on this wire wipes the display and ' +
          'restarts it in a known state, which is how every sketch begins.'
  },
  {
    name: 'DC',
    picoPin: 'GP5',
    dispPin: 'DC',
    wireColor: 'royalblue',
    kind: 'signal',
    info: 'DC (Data/Command): tells the display whether the next byte is a ' +
          'command to obey or a byte of pixel data to draw.'
  },
  {
    name: 'CS',
    picoPin: 'GP6',
    dispPin: 'CS',
    wireColor: 'limegreen',
    kind: 'signal',
    info: 'CS (Chip Select): picks out one device to listen. Each extra ' +
          'display on the same SPI bus needs its own CS wire.'
  },
  {
    name: '3V3 power',
    picoPin: '3V3',
    dispPin: 'VCC',
    wireColor: 'red',
    kind: 'power',
    info: '3V3 to VCC: supplies power to the display. Never connect this to ' +
          'VBUS or 5V, because that voltage can destroy the display.'
  },
  {
    name: 'GND',
    picoPin: 'GND',
    dispPin: 'GND',
    wireColor: 'black',
    kind: 'power',
    info: 'GND to GND: the shared return path for every signal. Without a ' +
          'common ground the other five wires cannot be read correctly.'
  }
];

const promptMessage = 'Click a wire or pin to see what it does.';

function setup() {
  updateCanvasSize();
  const cnv = createCanvas(canvasWidth, canvasHeight);
  cnv.parent(document.querySelector('main'));

  const controlsTop = drawHeight + infoHeight;

  // Row 1: which display module is wired up
  displaySelect = createSelect();
  displaySelect.parent(document.querySelector('main'));
  displaySelect.option('OLED (128x64)');
  displaySelect.option('Color Round (240x240)');
  displaySelect.selected('OLED (128x64)');
  displaySelect.position(110, controlsTop + 8);
  displaySelect.changed(clearSelection);

  // Row 2: pin labels on or off
  labelCheckbox = createCheckbox('Show pin labels', true);
  labelCheckbox.parent(document.querySelector('main'));
  labelCheckbox.position(10, controlsTop + 44);
  labelCheckbox.style('font-size', '15px');

  describe('A wiring diagram showing a Raspberry Pi Pico on a breadboard ' +
    'connected to a display module by seven color-coded jumper wires. ' +
    'Clicking a wire or a pin explains that connection.');
}

// Switching displays clears the infobox so students re-read the new diagram.
function clearSelection() {
  selectedWire = -1;
}

function draw() {
  updateCanvasSize();
  computeViewTransform();

  // --- Region backgrounds (required MicroSim look) ---
  stroke('silver');
  fill('aliceblue');
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, infoHeight);
  rect(0, drawHeight + infoHeight, canvasWidth, controlHeight);

  // --- Title ---
  noStroke();
  fill('black');
  textSize(20);
  textAlign(CENTER, TOP);
  text('Wiring a Display to the Pico', canvasWidth / 2, 8);

  // --- Illustration, drawn in virtual coordinates ---
  hoveredWire = wireUnderMouse();

  push();
  translate(viewX, viewY);
  scale(viewScale);
  drawBreadboard();
  drawPico();
  drawDisplayModule();
  drawWires();
  pop();

  drawInfoPanel();
  drawControlLabels();
}

// ---------------------------------------------------------------------------
// Layout helpers
// ---------------------------------------------------------------------------

function updateCanvasSize() {
  const container = document.querySelector('main');
  if (container && container.offsetWidth > 0) {
    canvasWidth = container.offsetWidth;
  }
}

// Fit the 700 x 360 virtual illustration inside the drawing region.
function computeViewTransform() {
  const topPad = 36;                       // leave room for the title
  const usableH = drawHeight - topPad - 8;
  const usableW = canvasWidth - 2 * margin;
  viewScale = Math.min(usableW / VW, usableH / VH);
  viewX = (canvasWidth - VW * viewScale) / 2;
  viewY = topPad + (usableH - VH * viewScale) / 2;
}

// Convert the mouse position into virtual illustration coordinates.
function mouseVirtualX() {
  return (mouseX - viewX) / viewScale;
}

function mouseVirtualY() {
  return (mouseY - viewY) / viewScale;
}

// Virtual x of the i-th pin on the Pico header (left to right).
function picoPinX(i) {
  return 200 + i * 50;
}

// Virtual x of the i-th pin on the display header (left to right).
function displayPinX(i) {
  return 260 + i * 30;
}

const PICO_PIN_Y = 205;       // top edge of the Pico body
const DISP_PIN_Y = 112;       // bottom edge of the display header

// Each wire drops to its own routing height so the harness stays readable.
function routingY(i) {
  return 120 + i * 10;
}

// The four points of one wire's path, in virtual coordinates.
function wirePath(i) {
  const dx = displayPinX(i);
  const px = picoPinX(i);
  const my = routingY(i);
  return [
    { x: dx, y: DISP_PIN_Y },
    { x: dx, y: my },
    { x: px, y: my },
    { x: px, y: PICO_PIN_Y }
  ];
}

// ---------------------------------------------------------------------------
// Illustration
// ---------------------------------------------------------------------------

function drawBreadboard() {
  // Board body
  stroke('darkgray');
  strokeWeight(1);
  fill(245, 245, 240);
  rect(20, 190, 660, 165, 6);

  // Power rails: a red line along the top, a blue line along the bottom
  strokeWeight(2);
  stroke('red');
  line(30, 199, 670, 199);
  stroke('royalblue');
  line(30, 346, 670, 346);

  // The center gap that splits the board into two halves
  strokeWeight(1);
  stroke('lightgray');
  fill(228, 228, 222);
  rect(20, 266, 660, 12);

  // Hole grid
  noStroke();
  fill(200);
  for (let col = 0; col < 31; col++) {
    const hx = 35 + col * 21;
    for (let row = 0; row < 4; row++) {
      ellipse(hx, 212 + row * 13, 3.5, 3.5);
      ellipse(hx, 288 + row * 13, 3.5, 3.5);
    }
  }
}

function drawPico() {
  // Pico body straddling the center gap of the breadboard
  stroke('black');
  strokeWeight(1);
  fill(30, 130, 90);
  rect(170, 200, 360, 145, 8);

  // The USB connector at the left end
  fill(190);
  noStroke();
  rect(160, 258, 22, 30, 3);

  // Board name
  noStroke();
  fill('white');
  textSize(13);
  textAlign(CENTER, CENTER);
  text('Raspberry Pi Pico', 350, 290);
  textSize(10);
  text('the wires above plug into these header pins', 350, 308);

  // Header pins along the top edge
  for (let i = 0; i < wireList.length; i++) {
    const px = picoPinX(i);
    const isActive = (i === selectedWire || i === hoveredWire);
    stroke(isActive ? 'white' : 'black');
    strokeWeight(isActive ? 2 : 1);
    fill('gold');
    rect(px - 7, PICO_PIN_Y - 6, 14, 12, 2);

    if (labelCheckbox && labelCheckbox.checked()) {
      noStroke();
      fill('white');
      textSize(11);
      textAlign(CENTER, TOP);
      text(wireList[i].picoPin, px, PICO_PIN_Y + 10);
    }
  }
}

function drawDisplayModule() {
  const isRound = displaySelect &&
                  displaySelect.value() === 'Color Round (240x240)';

  stroke('black');
  strokeWeight(1);
  fill(40);

  if (isRound) {
    // A round 240x240 color display
    ellipse(350, 46, 92, 92);
    fill(20, 40, 90);
    noStroke();
    ellipse(350, 46, 78, 78);
  } else {
    // A rectangular 128x64 monochrome OLED
    rect(250, 0, 200, 92, 4);
    fill(20, 30, 40);
    noStroke();
    rect(262, 8, 176, 68, 2);
  }

  // Two simple robot eyes so students see what the module is for
  fill(isRound ? color(0, 220, 255) : color(220, 240, 255));
  ellipse(320, 44, 26, 32);
  ellipse(380, 44, 26, 32);

  // Header tab carrying the seven pins
  stroke('black');
  strokeWeight(1);
  fill(60);
  rect(248, 92, 204, 20, 3);

  for (let i = 0; i < wireList.length; i++) {
    const dx = displayPinX(i);
    const isActive = (i === selectedWire || i === hoveredWire);
    stroke(isActive ? 'white' : 'black');
    strokeWeight(isActive ? 2 : 1);
    fill('gold');
    rect(dx - 6, 106, 12, 10, 2);

    if (labelCheckbox && labelCheckbox.checked()) {
      noStroke();
      fill('white');
      textSize(10);
      textAlign(CENTER, CENTER);
      text(wireList[i].dispPin, dx, 100);
    }
  }

  // Caption naming the module
  noStroke();
  fill('black');
  textSize(12);
  textAlign(CENTER, BOTTOM);
  const caption = isRound ? 'Round color display (240x240)'
                          : 'OLED display (128x64)';
  text(caption, 560, 60);
  textSize(11);
  text('Same seven wires either way', 560, 78);
}

function drawWires() {
  noFill();
  strokeCap(ROUND);
  strokeJoin(ROUND);

  for (let i = 0; i < wireList.length; i++) {
    const path = wirePath(i);
    const isActive = (i === selectedWire || i === hoveredWire);

    // A white halo underneath makes the highlighted wire pop out
    if (isActive) {
      stroke('white');
      strokeWeight(9);
      drawPath(path);
    }
    stroke(wireList[i].wireColor);
    strokeWeight(isActive ? 4 : 3);
    drawPath(path);
  }
  strokeWeight(1);
}

function drawPath(path) {
  beginShape();
  for (const pt of path) {
    vertex(pt.x, pt.y);
  }
  endShape();
}

// ---------------------------------------------------------------------------
// Infobox
// ---------------------------------------------------------------------------

function drawInfoPanel() {
  const top = drawHeight + 6;
  noStroke();
  fill(250, 250, 255);
  stroke(210);
  rect(margin, top, canvasWidth - 2 * margin, infoHeight - 14, 8);

  noStroke();
  textAlign(LEFT, TOP);

  if (selectedWire < 0) {
    fill(90);
    textSize(defaultTextSize);
    text(promptMessage, margin + 12, top + 12);
    textSize(13);
    fill(120);
    text('Five signal wires carry data. Two power wires keep the display alive.',
         margin + 12, top + 36);
    return;
  }

  const w = wireList[selectedWire];

  // Color swatch so the infobox and the diagram agree
  fill(w.wireColor);
  stroke(120);
  rect(margin + 12, top + 10, 16, 16, 3);

  noStroke();
  fill('black');
  textSize(15);
  const heading = w.picoPin + ' → ' + w.dispPin + '  (' +
                  (w.kind === 'power' ? 'power wire' : 'signal wire') + ')';
  text(heading, margin + 36, top + 10);

  fill(40);
  textSize(13);
  wrapParagraph(w.info, margin + 12, top + 34, canvasWidth - 2 * margin - 24, 16);
}

// Draw a string across several lines so it never runs off the panel.
function wrapParagraph(str, x, y, maxW, lineH) {
  const words = str.split(' ');
  let lineStr = '';
  let lineY = y;
  for (const word of words) {
    const test = lineStr.length ? lineStr + ' ' + word : word;
    if (textWidth(test) > maxW && lineStr.length) {
      text(lineStr, x, lineY);
      lineStr = word;
      lineY += lineH;
    } else {
      lineStr = test;
    }
  }
  if (lineStr.length) {
    text(lineStr, x, lineY);
  }
}

function drawControlLabels() {
  const controlsTop = drawHeight + infoHeight;
  noStroke();
  fill('black');
  textSize(defaultTextSize);
  textAlign(LEFT, CENTER);
  text('Display:', 10, controlsTop + 20);
}

// ---------------------------------------------------------------------------
// Hit testing
// ---------------------------------------------------------------------------

// Returns the index of the wire (or its pins) under the mouse, else -1.
function wireUnderMouse() {
  if (mouseY < 0 || mouseY > drawHeight) return -1;
  const vx = mouseVirtualX();
  const vy = mouseVirtualY();
  // Keep the click target about the same size on screen at every scale.
  const tol = 9 / Math.max(viewScale, 0.45);

  for (let i = 0; i < wireList.length; i++) {
    // Pin rectangles at both ends count as part of the connection
    if (Math.abs(vx - picoPinX(i)) < 10 && Math.abs(vy - PICO_PIN_Y) < 12) {
      return i;
    }
    if (Math.abs(vx - displayPinX(i)) < 9 && Math.abs(vy - 111) < 12) {
      return i;
    }
    const path = wirePath(i);
    for (let s = 0; s < path.length - 1; s++) {
      if (distToSegment(vx, vy, path[s].x, path[s].y,
                        path[s + 1].x, path[s + 1].y) < tol) {
        return i;
      }
    }
  }
  return -1;
}

// Shortest distance from point (px, py) to the segment (x1,y1)-(x2,y2).
function distToSegment(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const lenSq = dx * dx + dy * dy;
  if (lenSq === 0) return dist(px, py, x1, y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));
  return dist(px, py, x1 + t * dx, y1 + t * dy);
}

function mousePressed() {
  // Ignore clicks that land outside the canvas or in the control strip.
  if (mouseX < 0 || mouseX > canvasWidth || mouseY < 0 || mouseY > drawHeight) {
    return;
  }
  const hit = wireUnderMouse();
  selectedWire = hit;
}

function windowResized() {
  updateCanvasSize();
  resizeCanvas(canvasWidth, canvasHeight);
}
