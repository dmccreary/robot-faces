// Indentation Error Visualizer
// A p5.js MicroSim for the Robot Faces intelligent textbook.
// Bloom level: Understand (L2) - explain, classify
//
// CANVAS_HEIGHT: 480
//
// A stepper changes the indent depth of line 2 one space at a time, and the
// status box reports exactly what MicroPython would say. Discrete steps suit an
// Understand-level objective better than a continuous animation would.

// ---- Canvas layout ----------------------------------------------------
let canvasWidth = 400;      // responsive, set from the container width
let drawHeight = 400;       // drawing region
let controlHeight = 80;     // two rows of controls: (2 x 35) + 10
let canvasHeight = drawHeight + controlHeight;
let margin = 15;
let defaultTextSize = 16;

// ---- Simulation state -------------------------------------------------
let indentDepth = 4;        // spaces in front of line 2, from 0 to 8
let useTab = false;         // true when line 2 starts with one tab instead
const MAX_DEPTH = 8;

// ---- Controls ---------------------------------------------------------
let minusButton, plusButton, resetButton, tabCheckbox;

// The three-line code listing. Line 2 carries the indent the learner controls.
// Line 3 is always indented four spaces, and that fixed second line is what
// makes an inconsistent line 2 detectable at all.
const LINE_1 = 'for i in range(3):';
const LINE_2 = 'print("Blink", i)';
const LINE_3 = 'blink_eyes()';
const LINE_3_DEPTH = 4;

function setup() {
  updateCanvasSize();
  const canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent(document.querySelector('main'));

  // Row 1: the indent-depth stepper
  minusButton = createButton('&minus;');
  minusButton.parent(document.querySelector('main'));
  minusButton.position(10, drawHeight + 5);
  minusButton.size(36, 26);
  minusButton.mousePressed(decreaseIndent);

  plusButton = createButton('+');
  plusButton.parent(document.querySelector('main'));
  plusButton.position(52, drawHeight + 5);
  plusButton.size(36, 26);
  plusButton.mousePressed(increaseIndent);

  // Row 2: the tab toggle and the reset button
  tabCheckbox = createCheckbox(' Use a tab instead of spaces on line 2', false);
  tabCheckbox.parent(document.querySelector('main'));
  tabCheckbox.position(10, drawHeight + 45);
  tabCheckbox.changed(function () { useTab = tabCheckbox.checked(); });

  resetButton = createButton('Reset');
  resetButton.parent(document.querySelector('main'));
  resetButton.position(canvasWidth - 80, drawHeight + 43);
  resetButton.size(66, 26);
  resetButton.mousePressed(resetToDefault);

  describe('An indentation error visualizer. A stepper sets how many spaces indent ' +
    'line 2 of a three-line MicroPython loop, and a status box reports whether the ' +
    'code runs or which indentation error MicroPython would raise.');
}

// ---- Control callbacks ------------------------------------------------

function increaseIndent() {
  if (indentDepth < MAX_DEPTH) { indentDepth++; }
}

function decreaseIndent() {
  if (indentDepth > 0) { indentDepth--; }
}

function resetToDefault() {
  indentDepth = 4;
  useTab = false;
  tabCheckbox.checked(false);
}

// ---- The rule that classifies the current indentation -----------------
// Line 3 always sits at four spaces, so line 2 is compared against both the
// outer level (zero spaces) and against line 3.

function evaluateIndent(depth, tabOn) {
  if (tabOn) {
    return {
      ok: false,
      headline: 'TabError',
      message: 'TabError: inconsistent use of tabs and spaces in indentation',
      badLine: 2,
      why: 'Line 2 starts with a tab while line 3 starts with spaces. MicroPython ' +
           'cannot compare the two widths, so it refuses to guess where the block belongs.'
    };
  }
  if (depth === 0) {
    return {
      ok: false,
      headline: 'IndentationError',
      message: "IndentationError: expected an indented block after 'for' statement on line 1",
      badLine: 2,
      why: 'A line ending in a colon promises an indented block below it. Line 2 is ' +
           'not indented at all, so the promised block never appears.'
    };
  }
  if (depth === LINE_3_DEPTH) {
    return {
      ok: true,
      headline: 'Valid',
      message: 'Lines 2 and 3 are indented the same amount, so both belong to the loop body.',
      badLine: 0,
      why: 'Indentation is how MicroPython marks a block. Matching depths mean the loop ' +
           'runs both lines, once per pass, three times in all.'
    };
  }
  if (depth < LINE_3_DEPTH) {
    return {
      ok: false,
      headline: 'IndentationError',
      message: 'IndentationError: unexpected indent',
      badLine: 3,
      why: 'Line 2 opened the block at ' + depth + (depth === 1 ? ' space' : ' spaces') +
           ', then line 3 jumped deeper to 4. Nothing on line 2 asked for a deeper block.'
    };
  }
  return {
    ok: false,
    headline: 'IndentationError',
    message: 'IndentationError: unindent does not match any outer indentation level',
    badLine: 3,
    why: 'Line 2 opened the block at ' + depth + ' spaces, so the only known levels are ' +
         '0 and ' + depth + '. Line 3 sits at 4, which matches neither one.'
  };
}

// ---- Drawing helpers --------------------------------------------------

// Draws one code line: a small gray dot for each leading space, or a gray arrow
// for a tab, followed by the code text itself.
function drawCodeLine(codeText, depth, tabOn, x, y, charW) {
  let textX = x;

  if (tabOn) {
    // One tab, drawn as a shaded arrow four characters wide.
    const tabW = charW * 4;
    noStroke();
    fill(200, 200, 200, 120);
    rect(x, y - 9, tabW, 18, 3);
    stroke('gray');
    strokeWeight(1);
    line(x + 4, y, x + tabW - 5, y);
    line(x + tabW - 9, y - 4, x + tabW - 5, y);
    line(x + tabW - 9, y + 4, x + tabW - 5, y);
    textX = x + tabW;
  } else {
    // One dot per space, so the depth stays countable by eye.
    noStroke();
    fill('gray');
    for (let s = 0; s < depth; s++) {
      circle(x + (s + 0.5) * charW, y, 3);
    }
    textX = x + depth * charW;
  }

  noStroke();
  fill('black');
  text(codeText, textX, y);
}

// A white panel with a small label above it.
function drawPanel(panelLabel, x, y, w, h) {
  noStroke();
  fill('black');
  textAlign(LEFT, BOTTOM);
  textSize(13);
  text(panelLabel, x + 2, y - 3);

  fill('white');
  stroke('silver');
  strokeWeight(1);
  rect(x, y, w, h, 6);
  textAlign(LEFT, CENTER);
}

// ---- Main draw loop ---------------------------------------------------

function draw() {
  updateCanvasSize();

  // Required background regions
  fill('aliceblue');
  stroke('silver');
  rect(0, 0, canvasWidth, drawHeight);
  fill('white');
  rect(0, drawHeight, canvasWidth, controlHeight);

  // Title
  noStroke();
  fill('black');
  textSize(20);
  textAlign(CENTER, TOP);
  text('Indentation Error Visualizer', canvasWidth / 2, 8);
  textAlign(LEFT, CENTER);
  textSize(defaultTextSize);

  const status = evaluateIndent(indentDepth, useTab);

  // Below 600px wide, the code listing and the status panel stack vertically
  // and the printed output moves inside the status panel.
  const stacked = canvasWidth < 600;

  const codeY = 62;
  const codeH = 96;
  let codeX, codeW, statusX, statusW, statusY, statusH, outY, outH;

  if (stacked) {
    codeX = margin;
    codeW = canvasWidth - 2 * margin;
    statusX = margin;
    statusW = codeW;
    statusY = codeY + codeH + 26;
    statusH = drawHeight - statusY - margin;
    outY = 0;   // no separate output panel in stacked mode
    outH = 0;
  } else {
    // Left 63% holds the code listing and its output, right side holds status.
    codeX = margin;
    codeW = canvasWidth * 0.63 - margin - 5;
    outY = codeY + codeH + 26;
    outH = drawHeight - outY - margin;
    statusX = canvasWidth * 0.63 + 5;
    statusW = canvasWidth - statusX - margin;
    statusY = codeY;
    statusH = drawHeight - statusY - margin;
  }

  // ---- Code listing panel ----
  drawPanel('Your MicroPython code', codeX, codeY, codeW, codeH);

  textFont('monospace');
  textSize(14);
  const charW = textWidth('m');
  const lineX = codeX + 34;
  const lineYs = [codeY + 22, codeY + 48, codeY + 74];

  // Red band behind whichever line MicroPython would complain about
  if (status.badLine > 0) {
    noStroke();
    fill(255, 205, 210);
    rect(codeX + 2, lineYs[status.badLine - 1] - 12, codeW - 4, 24, 4);
    fill(198, 40, 40);
    rect(codeX + 2, lineYs[status.badLine - 1] - 12, 4, 24);
  }

  // Line numbers down the left gutter
  noStroke();
  fill('gray');
  textSize(12);
  for (let i = 0; i < 3; i++) {
    text(String(i + 1), codeX + 12, lineYs[i]);
  }

  textSize(14);
  drawCodeLine(LINE_1, 0, false, lineX, lineYs[0], charW);
  drawCodeLine(LINE_2, indentDepth, useTab, lineX, lineYs[1], charW);
  drawCodeLine(LINE_3, LINE_3_DEPTH, false, lineX, lineYs[2], charW);

  // ---- Output panel (wide layout only) ----
  textFont('sans-serif');
  if (!stacked) {
    drawPanel('What MicroPython prints', codeX, outY, codeW, outH);
    noStroke();
    if (status.ok) {
      textFont('monospace');
      textSize(15);
      fill(27, 94, 32);
      for (let i = 0; i < 3; i++) {
        text('Blink ' + i, codeX + 14, outY + 24 + i * 24);
      }
      textFont('sans-serif');
      textSize(13);
      fill(69, 90, 100);
      text('The loop body runs once per pass, three passes in all.',
           codeX + 14, outY + 108, codeW - 28, 40);
    } else {
      textFont('monospace');
      textSize(15);
      fill(120);
      text('(no output)', codeX + 14, outY + 24);
      textFont('sans-serif');
      textSize(13);
      fill(69, 90, 100);
      text('MicroPython reads the whole file before running it, so an indentation ' +
           'problem stops the program before a single line prints.',
           codeX + 14, outY + 48, codeW - 28, outH - 56);
    }
  }

  // ---- Status panel ----
  textFont('sans-serif');
  drawPanel('Status', statusX, statusY, statusW, statusH);

  const msgH = stacked ? 46 : 80;
  const whyH = stacked ? 74 : 110;
  let sy = statusY + 10;

  noStroke();
  textAlign(LEFT, TOP);
  fill(status.ok ? color(27, 94, 32) : color(198, 40, 40));
  textSize(19);
  text(status.headline, statusX + 10, sy);
  sy += 26;

  fill('black');
  textSize(13);
  text(status.message, statusX + 10, sy, statusW - 20, msgH);
  sy += msgH + 2;

  stroke('silver');
  strokeWeight(1);
  line(statusX + 10, sy, statusX + statusW - 10, sy);
  sy += 8;

  noStroke();
  fill(69, 90, 100);
  text(status.why, statusX + 10, sy, statusW - 20, whyH);
  sy += whyH + 2;

  // In stacked mode the printed output lives here instead of its own panel.
  if (stacked) {
    textFont('monospace');
    textSize(13);
    fill(status.ok ? color(27, 94, 32) : color(120));
    text(status.ok ? 'Prints: Blink 0 / Blink 1 / Blink 2' : 'Prints: (no output)',
         statusX + 10, sy);
    textFont('sans-serif');
  }

  textAlign(LEFT, CENTER);

  // ---- Control labels ----
  noStroke();
  fill('black');
  textSize(15);
  const depthLabel = useTab
    ? 'Indent depth of line 2: 1 tab'
    : 'Indent depth of line 2: ' + indentDepth + (indentDepth === 1 ? ' space' : ' spaces');
  text(depthLabel, 96, drawHeight + 18);
}

// ---- Responsive sizing ------------------------------------------------

function windowResized() {
  updateCanvasSize();
  resizeCanvas(canvasWidth, canvasHeight);
}

function updateCanvasSize() {
  const container = document.querySelector('main');
  if (container) {
    canvasWidth = container.offsetWidth;
    // Reset stays pinned to the right edge of the control region.
    if (typeof resetButton !== 'undefined' && resetButton) {
      resetButton.position(canvasWidth - 80, drawHeight + 43);
    }
  }
}
