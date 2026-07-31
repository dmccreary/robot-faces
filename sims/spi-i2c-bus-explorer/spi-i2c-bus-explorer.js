// SPI vs I2C Bus Explorer MicroSim
// Chapter 1: Hardware & Electronics Foundations
// Bloom level: Analyze (L4) - differentiate, compare
// CANVAS_HEIGHT: 480
// Learning objective: differentiate SPI and I2C wiring by comparing wire count,
// addressing, and speed, and identify which bus a wiring diagram uses.

// ---------- Canvas regions ----------
let canvasWidth = 700;        // responsive: reset from the container width
let drawHeight = 340;         // wiring diagram region
let infoHeight = 90;          // infobox panel under the diagram
let controlHeight = 50;       // one row of controls
let canvasHeight = drawHeight + infoHeight + controlHeight;
let margin = 15;
let defaultTextSize = 16;

// ---------- Virtual drawing space ----------
// Both diagrams are laid out in one fixed 560 x 280 space and then scaled to
// the container, so switching buses never shifts the picture around.
const VW = 560;
const VH = 280;
let viewScale = 1;
let viewX = 0;
let viewY = 0;

// ---------- Controls ----------
let spiButton;
let i2cButton;

// ---------- State ----------
let busView = 'SPI';          // 'SPI' or 'I2C'
let selectedItem = null;      // the clicked wire or box
let hoveredItem = null;       // the wire or box under the mouse this frame

let spiWires = [];
let i2cWires = [];
let spiBoxes = [];
let i2cBoxes = [];

const promptMessage = 'Click any wire to learn what it does.';

// Shared power-wire descriptions, used by both bus diagrams.
const POWER_INFO =
  '3.3 volt supply: powers the device. Both buses need power and ground, so ' +
  'neither wire counts toward the bus wire total.';
const GROUND_INFO =
  'Ground: the shared return path for every signal. Every device on either ' +
  'bus must share this same ground with the Pico.';

function setup() {
  updateCanvasSize();
  const cnv = createCanvas(canvasWidth, canvasHeight);
  cnv.parent(document.querySelector('main'));

  buildDiagrams();

  const controlsTop = drawHeight + infoHeight;

  spiButton = createButton('Show SPI');
  spiButton.parent(document.querySelector('main'));
  spiButton.position(10, controlsTop + 12);
  spiButton.mousePressed(() => switchBus('SPI'));

  i2cButton = createButton('Show I2C');
  i2cButton.parent(document.querySelector('main'));
  i2cButton.position(110, controlsTop + 12);
  i2cButton.mousePressed(() => switchBus('I2C'));

  refreshButtonStyles();

  describe('A wiring diagram comparing an SPI bus, which needs five signal ' +
    'wires to one display, with an I2C bus, which shares two signal wires ' +
    'across two devices that are told apart by address.');
}

// Only one bus view is active at a time; switching clears the infobox.
function switchBus(which) {
  busView = which;
  selectedItem = null;
  refreshButtonStyles();
}

// The active toggle gets a filled look so students can see which view they are in.
function refreshButtonStyles() {
  const activeBg = '#1f7a4d';
  const idleBg = '#e8e8e8';
  spiButton.style('background-color', busView === 'SPI' ? activeBg : idleBg);
  spiButton.style('color', busView === 'SPI' ? 'white' : 'black');
  i2cButton.style('background-color', busView === 'I2C' ? activeBg : idleBg);
  i2cButton.style('color', busView === 'I2C' ? 'white' : 'black');
}

// ---------------------------------------------------------------------------
// Diagram geometry, built once in virtual coordinates
// ---------------------------------------------------------------------------

function buildDiagrams() {
  // --- SPI: one Pico, one display, seven straight parallel wires ---
  const spiNames = [
    { name: 'SCK', wireColor: 'gold', signal: true,
      info: 'SCK (Serial Clock): the Pico ticks this wire high and low so the ' +
            'display knows exactly when to read each bit.' },
    { name: 'MOSI / SDA', wireColor: 'orange', signal: true,
      info: 'MOSI, often labeled SDA on display boards: the data wire that ' +
            'carries pixel bytes from the Pico out to the display.' },
    { name: 'CS', wireColor: 'red', signal: true,
      info: 'Chip Select: tells one specific device to listen. Each device on ' +
            'an SPI bus needs its own CS wire back to the Pico.' },
    { name: 'DC', wireColor: 'royalblue', signal: true,
      info: 'Data/Command: tells the display whether the next byte is a ' +
            'command to obey or a byte of pixel data to draw.' },
    { name: 'RES', wireColor: 'darkviolet', signal: true,
      info: 'Reset: a short pulse on this wire clears the display and starts ' +
            'it in a known state before any drawing begins.' },
    { name: '3V3', wireColor: 'gray', signal: false, info: POWER_INFO },
    { name: 'GND', wireColor: 'gray', signal: false, info: GROUND_INFO }
  ];

  spiWires = spiNames.map((w, i) => {
    const y = 70 + i * 22;
    return {
      name: w.name,
      wireColor: w.wireColor,
      signal: w.signal,
      info: w.info,
      segments: [[150, y, 390, y]],
      labelX: 270,
      labelY: y
    };
  });

  spiBoxes = [
    { name: 'Raspberry Pi Pico', sub: 'SPI controller',
      x: 20, y: 55, w: 130, h: 170, fillColor: [30, 130, 90],
      info: 'The Pico is the controller. On an SPI bus it drives the clock ' +
            'and decides which device is selected at any moment.' },
    { name: 'OLED display', sub: 'one SPI device',
      x: 390, y: 55, w: 150, h: 170, fillColor: [60, 60, 70],
      info: 'One SPI display. Adding a second display would mean running one ' +
            'more CS wire, because SPI has no addresses.' }
  ];

  // --- I2C: one Pico, two devices, two shared signal wires ---
  const i2cNames = [
    { name: 'SCL', wireColor: 'gold', signal: true,
      info: 'SCL (Serial Clock): a single clock wire shared by every device ' +
            'on the bus, no matter how many devices you add.' },
    { name: 'SDA', wireColor: 'orange', signal: true,
      info: 'SDA (Serial Data): one shared data wire. The Pico sends an ' +
            'address first, and only the matching device answers.' },
    { name: '3V3', wireColor: 'gray', signal: false, info: POWER_INFO },
    { name: 'GND', wireColor: 'gray', signal: false, info: GROUND_INFO }
  ];

  i2cWires = i2cNames.map((w, i) => {
    const picoY = 110 + i * 20;      // where the wire leaves the Pico
    const trunkX = 300 + i * 22;     // the shared vertical trunk
    const d1Y = 50 + i * 12;         // entry point on the upper device
    const d2Y = 194 + i * 12;        // entry point on the lower device
    return {
      name: w.name,
      wireColor: w.wireColor,
      signal: w.signal,
      info: w.info,
      segments: [
        [150, picoY, trunkX, picoY],
        [trunkX, d1Y, trunkX, d2Y],
        [trunkX, d1Y, 390, d1Y],
        [trunkX, d2Y, 390, d2Y]
      ],
      labelX: 200,
      labelY: picoY
    };
  });

  i2cBoxes = [
    { name: 'Raspberry Pi Pico', sub: 'I2C controller',
      x: 20, y: 90, w: 130, h: 120, fillColor: [30, 130, 90],
      info: 'The Pico is the controller. It names the device it wants by ' +
            'sending that address on the shared SDA wire.' },
    { name: 'OLED display', sub: 'address 0x3C',
      x: 390, y: 30, w: 150, h: 80, fillColor: [60, 60, 70],
      info: 'Address 0x3C. The display ignores everything on the bus unless ' +
            'the Pico calls out that exact address first.' },
    { name: 'Motion sensor', sub: 'address 0x68',
      x: 390, y: 170, w: 150, h: 80, fillColor: [80, 55, 90],
      info: 'Address 0x68. A second device on the same two wires, told apart ' +
            'by its address rather than by an extra wire.' }
  ];
}

function currentWires() {
  return busView === 'SPI' ? spiWires : i2cWires;
}

function currentBoxes() {
  return busView === 'SPI' ? spiBoxes : i2cBoxes;
}

// ---------------------------------------------------------------------------
// Draw loop
// ---------------------------------------------------------------------------

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
  text('SPI vs I2C: Counting the Wires', canvasWidth / 2, 6);

  hoveredItem = itemUnderMouse();

  push();
  translate(viewX, viewY);
  scale(viewScale);
  drawBoxes();
  drawWires();
  drawCaptions();
  pop();

  if (hoveredItem && hoveredItem.kind === 'wire') {
    drawTooltip(hoveredItem.item.name);
  }

  drawInfoPanel();
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

function computeViewTransform() {
  const topPad = 32;
  const usableH = drawHeight - topPad - 6;
  const usableW = canvasWidth - 2 * margin;
  viewScale = Math.min(usableW / VW, usableH / VH);
  viewX = (canvasWidth - VW * viewScale) / 2;
  viewY = topPad + (usableH - VH * viewScale) / 2;
}

function drawBoxes() {
  for (const box of currentBoxes()) {
    const isActive = (selectedItem && selectedItem.item === box) ||
                     (hoveredItem && hoveredItem.item === box);
    stroke(isActive ? 'white' : 'black');
    strokeWeight(isActive ? 3 : 1);
    fill(box.fillColor[0], box.fillColor[1], box.fillColor[2]);
    rect(box.x, box.y, box.w, box.h, 8);

    noStroke();
    fill('white');
    textAlign(CENTER, CENTER);
    textSize(14);
    text(box.name, box.x + box.w / 2, box.y + box.h / 2 - 10);
    textSize(12);
    text(box.sub, box.x + box.w / 2, box.y + box.h / 2 + 10);
  }
}

function drawWires() {
  noFill();
  strokeCap(ROUND);
  for (const w of currentWires()) {
    const isActive = (selectedItem && selectedItem.item === w) ||
                     (hoveredItem && hoveredItem.item === w);
    if (isActive) {
      stroke('white');
      strokeWeight(8);
      for (const s of w.segments) {
        line(s[0], s[1], s[2], s[3]);
      }
    }
    stroke(w.wireColor);
    strokeWeight(isActive ? 4 : 2.5);
    for (const s of w.segments) {
      line(s[0], s[1], s[2], s[3]);
    }

    // Wire name, drawn on a small light plate so it stays readable
    noStroke();
    fill('aliceblue');
    textSize(11);
    textAlign(CENTER, CENTER);
    const labelW = textWidth(w.name) + 10;
    rect(w.labelX - labelW / 2, w.labelY - 8, labelW, 16, 3);
    fill(w.signal ? 'black' : 90);
    text(w.name, w.labelX, w.labelY);
  }
  strokeWeight(1);
}

function drawCaptions() {
  // Wire counter: power and ground are excluded on purpose.
  const signalCount = currentWires().filter(w => w.signal).length;
  noStroke();
  fill(30);
  textSize(15);
  textAlign(LEFT, TOP);
  text('Wires used: ' + signalCount, 20, 4);
  textSize(11);
  fill(90);
  text('(signal wires only; 3V3 and GND are extra)', 20, 22);

  // The one-line takeaway for the current view
  textSize(13);
  fill(30);
  textAlign(CENTER, TOP);
  const caption = busView === 'SPI'
    ? 'One CS wire needed per device'
    : 'Same two wires serve every device; addresses tell them apart';
  text(caption, VW / 2, 258);
}

// ---------------------------------------------------------------------------
// Tooltip and infobox
// ---------------------------------------------------------------------------

function drawTooltip(label) {
  textSize(12);
  const w = textWidth(label) + 14;
  const x = Math.min(mouseX + 12, canvasWidth - w - 4);
  const y = Math.max(mouseY - 26, 2);
  stroke(120);
  fill(255, 255, 210);
  rect(x, y, w, 20, 4);
  noStroke();
  fill('black');
  textAlign(LEFT, CENTER);
  text(label, x + 7, y + 10);
}

function drawInfoPanel() {
  const top = drawHeight + 8;
  stroke(210);
  fill(250, 250, 255);
  rect(margin, top, canvasWidth - 2 * margin, infoHeight - 16, 8);

  noStroke();
  textAlign(LEFT, TOP);

  if (!selectedItem) {
    fill(90);
    textSize(defaultTextSize);
    text(promptMessage, margin + 12, top + 10);
    fill(120);
    textSize(13);
    text('SPI is faster and needs more wires. I2C is slower and shares two ' +
         'wires among many devices.', margin + 12, top + 34);
    return;
  }

  const item = selectedItem.item;

  if (selectedItem.kind === 'wire') {
    fill(item.wireColor);
    stroke(120);
    rect(margin + 12, top + 10, 16, 16, 3);
    noStroke();
    fill('black');
    textSize(15);
    text(item.name + (item.signal ? '  (bus wire)' : '  (power wire)'),
         margin + 36, top + 10);
  } else {
    noStroke();
    fill('black');
    textSize(15);
    text(item.name + '  (' + item.sub + ')', margin + 12, top + 10);
  }

  fill(40);
  textSize(13);
  wrapParagraph(item.info, margin + 12, top + 34,
                canvasWidth - 2 * margin - 24, 16);
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
  if (canvasWidth < 460) return;
  noStroke();
  fill(90);
  textSize(13);
  textAlign(LEFT, CENTER);
  text('Compare the two buses, then click a wire for its definition.',
       215, drawHeight + infoHeight + 24);
}

// ---------------------------------------------------------------------------
// Hit testing
// ---------------------------------------------------------------------------

// Returns { kind: 'wire' | 'box', item } under the mouse, or null.
function itemUnderMouse() {
  if (mouseY < 0 || mouseY > drawHeight) return null;
  const vx = (mouseX - viewX) / viewScale;
  const vy = (mouseY - viewY) / viewScale;
  const tol = 7 / Math.max(viewScale, 0.45);

  // Wires are checked first because they are the smaller target.
  for (const w of currentWires()) {
    for (const s of w.segments) {
      if (distToSegment(vx, vy, s[0], s[1], s[2], s[3]) < tol) {
        return { kind: 'wire', item: w };
      }
    }
  }
  for (const box of currentBoxes()) {
    if (vx >= box.x && vx <= box.x + box.w &&
        vy >= box.y && vy <= box.y + box.h) {
      return { kind: 'box', item: box };
    }
  }
  return null;
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
  if (mouseX < 0 || mouseX > canvasWidth || mouseY < 0 || mouseY > drawHeight) {
    return;
  }
  const hit = itemUnderMouse();
  // A clicked infobox stays open until another item is clicked.
  if (hit) {
    selectedItem = hit;
  }
}
