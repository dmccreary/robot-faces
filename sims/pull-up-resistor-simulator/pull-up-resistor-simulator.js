// Pull-Up Resistor and Button Simulator MicroSim
// Chapter 1: Hardware & Electronics Foundations
// Bloom level: Understand (L2) / Apply (L3) - explain, demonstrate
// CANVAS_HEIGHT: 480
// Learning objective: explain why a floating GPIO pin needs a pull-up resistor,
// and demonstrate the steady HIGH/LOW reading a pull-up produces.

// ---------- Canvas regions ----------
let canvasWidth = 700;        // responsive: reset from the container width
let drawHeight = 400;         // schematic plus readout panel
let controlHeight = 80;       // two rows of controls
let canvasHeight = drawHeight + controlHeight;
let margin = 15;
let defaultTextSize = 16;

// ---------- Controls ----------
let pullupButton;             // toggles the internal pull-up resistor
let pressButton;              // press-and-hold push button
let resetButton;              // returns to the default state

// ---------- State machine ----------
// Two booleans describe the whole circuit, which gives the four stages the
// lesson asks students to compare.
let pullupOn = false;         // default OFF, so the problem shows up first
let buttonHeld = false;       // true only while the student holds the control

// A floating pin has no defined voltage, so real hardware reads noise. We fake
// that noise with a value that flips every so often.
let flickerHigh = true;
let lastFlickerMs = 0;
const FLICKER_MS = 140;

// The virtual schematic is drawn in a fixed 340 x 290 space and then scaled.
const SW = 340;
const SH = 290;
let schemScale = 1;
let schemX = 0;
let schemY = 0;

function setup() {
  updateCanvasSize();
  const cnv = createCanvas(canvasWidth, canvasHeight);
  cnv.parent(document.querySelector('main'));

  // Row 1: pull-up toggle and reset
  pullupButton = createButton('Pull-up resistor: OFF');
  pullupButton.parent(document.querySelector('main'));
  pullupButton.position(10, drawHeight + 8);
  pullupButton.mousePressed(togglePullup);

  resetButton = createButton('Reset');
  resetButton.parent(document.querySelector('main'));
  resetButton.position(200, drawHeight + 8);
  resetButton.mousePressed(resetSimulation);

  // Row 2: the press-and-hold push button
  pressButton = createButton('PRESS AND HOLD BUTTON');
  pressButton.parent(document.querySelector('main'));
  pressButton.position(10, drawHeight + 44);
  pressButton.mousePressed(holdDown);
  pressButton.mouseReleased(letGo);
  pressButton.mouseOut(letGo);       // releasing off the button still counts
  pressButton.touchStarted(holdDown);
  pressButton.touchEnded(letGo);

  describe('A schematic of a Raspberry Pi Pico with pin GP15 wired to a push ' +
    'button and an optional pull-up resistor, beside a readout showing ' +
    'whether the pin reads HIGH, LOW, or floating.');
}

function togglePullup() {
  pullupOn = !pullupOn;
  pullupButton.html('Pull-up resistor: ' + (pullupOn ? 'ON' : 'OFF'));
}

function holdDown() {
  buttonHeld = true;
}

function letGo() {
  buttonHeld = false;
}

function resetSimulation() {
  pullupOn = false;
  buttonHeld = false;
  pullupButton.html('Pull-up resistor: OFF');
}

// Returns 'LOW', 'HIGH', or 'FLOATING' for the current circuit.
function pinState() {
  if (buttonHeld) return 'LOW';        // the button always wins: it ties to GND
  if (pullupOn) return 'HIGH';         // the resistor gently holds the pin up
  return 'FLOATING';                   // nothing is driving the pin at all
}

function draw() {
  updateCanvasSize();

  // Advance the pretend electrical noise only while the pin really is floating.
  if (pinState() === 'FLOATING' && millis() - lastFlickerMs > FLICKER_MS) {
    flickerHigh = random() > 0.5;
    lastFlickerMs = millis();
  }

  // --- Region backgrounds (required MicroSim look) ---
  stroke('silver');
  fill('aliceblue');
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  // --- Title ---
  noStroke();
  fill('black');
  textSize(20);
  textAlign(CENTER, TOP);
  text('Why a Floating Pin Needs a Pull-Up Resistor', canvasWidth / 2, 8);

  // --- Two panel layout, stacking on narrow screens ---
  const isNarrow = canvasWidth < 520;
  let schemRegion;
  let readRegion;
  if (isNarrow) {
    schemRegion = { x: margin, y: 40, w: canvasWidth - 2 * margin, h: 195 };
    readRegion = { x: margin, y: 245, w: canvasWidth - 2 * margin,
                   h: drawHeight - 255 };
  } else {
    schemRegion = { x: margin, y: 42, w: canvasWidth * 0.58 - margin,
                    h: drawHeight - 60 };
    readRegion = { x: canvasWidth * 0.60, y: 90,
                   w: canvasWidth * 0.40 - margin, h: 190 };
  }

  drawSchematic(schemRegion);
  drawReadout(readRegion);
  drawControlLabels();
}

function updateCanvasSize() {
  const container = document.querySelector('main');
  if (container && container.offsetWidth > 0) {
    canvasWidth = container.offsetWidth;
  }
}

function windowResized() {
  updateCanvasSize();
  resizeCanvas(canvasWidth, canvasHeight);
}

// ---------------------------------------------------------------------------
// Schematic
// ---------------------------------------------------------------------------

function drawSchematic(region) {
  schemScale = Math.min(region.w / SW, region.h / SH);
  schemX = region.x + (region.w - SW * schemScale) / 2;
  schemY = region.y + (region.h - SH * schemScale) / 2;

  const state = pinState();

  push();
  translate(schemX, schemY);
  scale(schemScale);

  // --- 3.3V supply rail across the top ---
  stroke('red');
  strokeWeight(2);
  line(40, 30, 300, 30);
  noStroke();
  fill('red');
  textSize(14);
  textAlign(LEFT, BOTTOM);
  text('3.3V', 40, 26);

  // --- Ground rail across the bottom ---
  stroke('black');
  strokeWeight(2);
  line(40, 260, 300, 260);
  // Ground symbol
  line(120, 260, 120, 272);
  line(108, 272, 132, 272);
  line(113, 277, 127, 277);
  line(118, 282, 122, 282);
  noStroke();
  fill('black');
  textAlign(LEFT, TOP);
  text('GND (0V)', 140, 264);

  // --- Pico body with the GP15 pin ---
  stroke('black');
  strokeWeight(1);
  fill(30, 130, 90);
  rect(20, 105, 90, 90, 6);
  noStroke();
  fill('white');
  textSize(13);
  textAlign(CENTER, CENTER);
  text('Pico', 65, 140);
  textSize(11);
  text('input pin', 65, 162);

  // Pin stub leaving the Pico
  stroke('black');
  strokeWeight(2);
  line(110, 150, 230, 150);
  noStroke();
  fill('black');
  textSize(13);
  textAlign(LEFT, BOTTOM);
  text('GP15', 122, 145);

  // --- Junction dot where the resistor and the button meet the pin ---
  fill('black');
  noStroke();
  ellipse(230, 150, 7, 7);

  // --- Pull-up resistor branch, from the junction up to 3.3V ---
  const resistorActive = pullupOn;
  const branchColor = resistorActive ? color('red') : color(190);
  stroke(branchColor);
  strokeWeight(2);
  line(230, 150, 230, 112);
  line(230, 68, 230, 30);
  drawResistorSymbol(230, 68, 112, branchColor);
  noStroke();
  fill(resistorActive ? color('black') : color(160));
  textSize(12);
  textAlign(LEFT, CENTER);
  text(resistorActive ? '50k pull-up ON' : 'pull-up OFF', 248, 90);

  // --- Push button branch, from the junction down to ground ---
  stroke('black');
  strokeWeight(2);
  line(230, 150, 230, 190);
  line(230, 226, 230, 260);
  drawPushButton(230, 190, 226, buttonHeld);
  noStroke();
  fill('black');
  textSize(12);
  textAlign(LEFT, CENTER);
  text(buttonHeld ? 'button PRESSED' : 'button released', 262, 208);

  // --- Floating warning, shown only in the undefined state ---
  // Placed in the open space above the Pico so it never covers the GP15 label.
  if (state === 'FLOATING') {
    drawWarningTriangle(130, 58, 26);
    noStroke();
    fill(180, 90, 0);
    textSize(12);
    textAlign(CENTER, TOP);
    text('nothing is driving GP15', 130, 76);
  }

  pop();
  strokeWeight(1);
}

// A standard zigzag resistor symbol drawn vertically between yTop and yBottom.
function drawResistorSymbol(x, yTop, yBottom, strokeColor) {
  const steps = 6;
  const h = (yBottom - yTop) / steps;
  stroke(strokeColor);
  strokeWeight(2);
  noFill();
  beginShape();
  vertex(x, yTop);
  for (let i = 0; i < steps; i++) {
    vertex(x + (i % 2 === 0 ? 9 : -9), yTop + h * (i + 0.5));
  }
  vertex(x, yBottom);
  endShape();
}

// A momentary push button drawn as a switch: two fixed contacts with a moving
// bar between them. The bar swings closed only while the student holds it.
function drawPushButton(x, yTop, yBottom, held) {
  const topY = yTop + 6;
  const botY = yBottom - 6;

  // The two fixed contacts
  noStroke();
  fill('black');
  ellipse(x, topY, 6, 6);
  ellipse(x, botY, 6, 6);

  if (held) {
    // Closed: the bar bridges the contacts and current reaches ground
    stroke('limegreen');
    strokeWeight(4);
    line(x, topY, x, botY);
  } else {
    // Open: the bar is swung aside, so the path to ground is broken
    stroke(110);
    strokeWeight(3);
    line(x, topY, x - 16, botY);
  }

  // The plunger cap the student "presses"
  stroke('black');
  strokeWeight(2);
  const capY = held ? (topY + botY) / 2 + 3 : (topY + botY) / 2 - 3;
  line(x + 10, capY, x + 22, capY);
  line(x + 22, capY - 7, x + 22, capY + 7);
  noFill();
}

function drawWarningTriangle(cx, cy, size) {
  stroke(180, 90, 0);
  strokeWeight(2);
  fill(255, 220, 120);
  triangle(cx, cy - size / 2, cx - size / 2, cy + size / 2,
           cx + size / 2, cy + size / 2);
  noStroke();
  fill(120, 60, 0);
  textSize(15);
  textAlign(CENTER, CENTER);
  text('!', cx, cy + 4);
}

// ---------------------------------------------------------------------------
// Digital readout
// ---------------------------------------------------------------------------

function drawReadout(region) {
  const state = pinState();

  // Panel background
  stroke(200);
  fill(255, 255, 255, 235);
  rect(region.x, region.y, region.w, region.h, 10);

  const cx = region.x + region.w / 2;
  let y = region.y + 14;

  noStroke();
  fill(70);
  textSize(15);
  textAlign(CENTER, TOP);
  text('Pin GP15 reads', cx, y);
  y += 26;

  // The big value. While floating, it flips between HIGH and LOW on its own.
  let valueStr;
  let valueColor;
  if (state === 'HIGH') {
    valueStr = 'HIGH (3.3V)';
    valueColor = color(0, 140, 40);
  } else if (state === 'LOW') {
    valueStr = 'LOW (0V)';
    valueColor = color(200, 30, 30);
  } else if (flickerHigh) {
    valueStr = 'HIGH (3.3V)';
    valueColor = color(0, 140, 40);
  } else {
    valueStr = 'LOW (0V)';
    valueColor = color(200, 30, 30);
  }

  fill(valueColor);
  textSize(26);
  text(valueStr, cx, y);
  y += 38;

  // The name of the state, which is the part students must be able to explain.
  let stateStr;
  let explainStr;
  if (state === 'FLOATING') {
    stateStr = 'FLOATING / UNDEFINED';
    explainStr = 'No resistor and no press, so stray ' +
                 'electrical noise decides the value.';
  } else if (state === 'LOW' && pullupOn) {
    stateStr = 'HELD LOW BY THE BUTTON';
    explainStr = 'The closed button ties GP15 straight ' +
                 'to ground, which always wins.';
  } else if (state === 'LOW') {
    stateStr = 'HELD LOW BY THE BUTTON';
    explainStr = 'Pressing gives a real reading even ' +
                 'without a resistor. Releasing does not.';
  } else {
    stateStr = 'STEADY HIGH FROM THE PULL-UP';
    explainStr = 'The resistor gently ties GP15 to 3.3V ' +
                 'whenever the button is open.';
  }

  fill(state === 'FLOATING' ? color(180, 90, 0) : color(40));
  textSize(14);
  text(stateStr, cx, y);
  y += 24;

  fill(70);
  textSize(13);
  wrapParagraph(explainStr, region.x + 12, y, region.w - 24, 17);
}

// Draw a string across several lines, centered inside the panel.
function wrapParagraph(str, x, y, maxW, lineH) {
  const words = str.split(' ');
  let lineStr = '';
  let lineY = y;
  textAlign(CENTER, TOP);
  for (const word of words) {
    const test = lineStr.length ? lineStr + ' ' + word : word;
    if (textWidth(test) > maxW && lineStr.length) {
      text(lineStr, x + maxW / 2, lineY);
      lineStr = word;
      lineY += lineH;
    } else {
      lineStr = test;
    }
  }
  if (lineStr.length) {
    text(lineStr, x + maxW / 2, lineY);
  }
}

function drawControlLabels() {
  // Only show the hint when there is clear room to the right of the buttons.
  if (canvasWidth < 560) return;
  noStroke();
  fill(90);
  textSize(13);
  textAlign(LEFT, CENTER);
  text('Hold the button down to close the circuit; let go to open it again.',
       230, drawHeight + 56);
}
