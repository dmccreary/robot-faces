// Old Workaround vs. New ellipse() Call
// Chapter 8: A History of MicroPython's FrameBuf Drawing Support
// Bloom level: Analyze (L4) - contrast, differentiate
//
// CANVAS_HEIGHT: 710
//
// The toggle swaps only the code panel. The rendered circle never changes, so
// the learner can isolate the one thing that did change between MicroPython
// versions: how much code and how much thinking the same picture costs.

/* ------------------------------------------------------------------ */
/* 1. The two states. Each holds its code, its line count, and the     */
/*    index of the line that actually draws the circle's edge.         */
/* ------------------------------------------------------------------ */

const STATES = {
  old: {
    title: 'Old Workaround &mdash; before v1.20.0',
    lines: [
      'import math',
      '',
      'def draw_circle(fb, cx, cy, r, color, steps=24):',
      '    prev_x = cx + r',
      '    prev_y = cy',
      '    for i in range(1, steps + 1):',
      '        angle = 2 * math.pi * i / steps',
      '        x = int(cx + r * math.cos(angle))',
      '        y = int(cy + r * math.sin(angle))',
      '        fb.line(prev_x, prev_y, x, y, color)',
      '        prev_x, prev_y = x, y'
    ],
    edgeLine: 9,                 // the fb.line() call that draws each edge piece
    badge: 'Needs: a math import, a loop, trigonometry, and bookkeeping of the previous point.'
  },
  new: {
    title: 'New ellipse() Call &mdash; v1.20.0 and later',
    lines: [
      'fb.ellipse(cx, cy, r, r, color)'
    ],
    edgeLine: 0,                 // the whole call draws the edge
    badge: 'Needs: nothing extra &mdash; ellipse() has been built into framebuf since v1.20.0. ' +
           'Add one more argument, True, and the same line fills the circle, which the loop ' +
           'version cannot do at all.'
  }
};

const WHY_TEXT =
  'Both circles look identical. One took an import, a loop, and trigonometry. ' +
  'The other took one line — because a contributor\'s pull request became part of MicroPython.';

/* ------------------------------------------------------------------ */
/* 2. The simulated display. The same circle is drawn for both states, */
/*    one frame-buffer pixel at a time, so the output really is equal. */
/* ------------------------------------------------------------------ */

const SCREEN_W = 128;
const SCREEN_H = 64;
const CIRCLE_CX = 64;
const CIRCLE_CY = 32;
const CIRCLE_R = 20;

function isInsideCircle(px, py) {
  const dx = px - CIRCLE_CX;
  const dy = py - CIRCLE_CY;
  return dx * dx + dy * dy <= CIRCLE_R * CIRCLE_R;
}

// A pixel belongs to the outline when it is inside the circle and at least one
// of its four neighbors is outside. That is a one-pixel-thick edge, the same
// thickness the line loop and ellipse() both produce.
function isEdgePixel(px, py) {
  if (!isInsideCircle(px, py)) return false;
  return !(isInsideCircle(px - 1, py) && isInsideCircle(px + 1, py) &&
           isInsideCircle(px, py - 1) && isInsideCircle(px, py + 1));
}

function drawScreen() {
  const svg = document.getElementById('screen');
  let markup = '<rect x="0" y="0" width="128" height="64" fill="#101418"/>';
  for (let py = 0; py < SCREEN_H; py++) {
    for (let px = 0; px < SCREEN_W; px++) {
      if (!isEdgePixel(px, py)) continue;
      markup += '<rect x="' + px + '" y="' + py + '" width="1" height="1" fill="#ffffff"/>';
    }
  }
  svg.innerHTML = markup;
}

/* ------------------------------------------------------------------ */
/* 3. Swapping the code panel.                                         */
/* ------------------------------------------------------------------ */

// Python source is inserted as text nodes, never as markup, so characters like
// < and > in the code can never be read as HTML.
function renderCode(state) {
  const codeEl = document.getElementById('code');
  codeEl.innerHTML = '';
  for (let i = 0; i < state.lines.length; i++) {
    const span = document.createElement('span');
    span.className = (i === state.edgeLine) ? 'ln edge-line' : 'ln';
    // A blank line still needs some content or it collapses to zero height.
    span.textContent = state.lines[i] === '' ? ' ' : state.lines[i];
    codeEl.appendChild(span);
  }
}

/* ------------------------------------------------------------------ */
/* 4. The animated line counter. Watching 11 slide down to 1 makes the */
/*    size difference land harder than swapping two static numbers.    */
/* ------------------------------------------------------------------ */

let countFrom = 11;
let countAnimationId = null;
let countFallbackId = null;

function renderCount(value) {
  document.getElementById('count-number').textContent = value;
  document.getElementById('count-label').textContent =
    (value === 1) ? 'line of code' : 'lines of code';
}

function animateCount(target) {
  const start = countFrom;
  const startTime = performance.now();
  const duration = 450;

  countFrom = target;
  if (countAnimationId !== null) cancelAnimationFrame(countAnimationId);
  if (countFallbackId !== null) clearTimeout(countFallbackId);

  function step(now) {
    const progress = Math.min(1, (now - startTime) / duration);
    renderCount(Math.round(start + (target - start) * progress));
    countAnimationId = (progress < 1) ? requestAnimationFrame(step) : null;
  }
  countAnimationId = requestAnimationFrame(step);

  // A hidden browser tab never runs requestAnimationFrame, so this timer makes
  // sure the counter still shows the right number when the learner returns.
  countFallbackId = setTimeout(function () {
    if (countAnimationId !== null) {
      cancelAnimationFrame(countAnimationId);
      countAnimationId = null;
    }
    renderCount(target);
    countFallbackId = null;
  }, duration + 150);
}

/* ------------------------------------------------------------------ */
/* 5. Wiring it all together.                                          */
/* ------------------------------------------------------------------ */

function showState(key) {
  const state = STATES[key];

  document.body.className = key;
  document.getElementById('code-title').innerHTML = state.title;
  document.getElementById('badge').innerHTML = state.badge;
  renderCode(state);
  animateCount(state.lines.length);

  document.getElementById('btn-old').classList.toggle('active', key === 'old');
  document.getElementById('btn-new').classList.toggle('active', key === 'new');
}

function toggleWhy() {
  const el = document.getElementById('why-text');
  const btn = document.getElementById('why-btn');
  const isShown = el.classList.contains('shown');
  if (isShown) {
    el.classList.remove('shown');
    el.textContent = '';
    btn.textContent = 'Why does this matter?';
  } else {
    el.classList.add('shown');
    el.textContent = WHY_TEXT;
    btn.textContent = 'Hide the answer';
  }
}

function initSim() {
  drawScreen();
  document.getElementById('btn-old').addEventListener('click', function () { showState('old'); });
  document.getElementById('btn-new').addEventListener('click', function () { showState('new'); });
  document.getElementById('why-btn').addEventListener('click', toggleWhy);
  showState('old');
}

window.addEventListener('DOMContentLoaded', initSim);
