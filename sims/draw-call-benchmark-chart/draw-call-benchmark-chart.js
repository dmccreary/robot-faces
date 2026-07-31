// Draw Call Benchmark Chart
// An interactive Chart.js MicroSim for the Robot Faces intelligent textbook.
// Chapter 12: Animating Expressions - Timing & Motion
// Bloom level: Analyze (L4) - examine, differentiate, compare
//
// CANVAS_HEIGHT: 520
//
// The learner compares measured draw times for four ways of redrawing one
// animation frame, then decides which technique costs the most time and why.

/* ------------------------------------------------------------------ */
/* 1. The benchmark data.                                              */
/*                                                                     */
/*    These are representative ticks_us() readings for one 128x64       */
/*    monochrome frame on an RP2040-class board. They are rounded for   */
/*    teaching and will differ on other hardware, but the ordering      */
/*    between the four techniques holds on every board.                 */
/* ------------------------------------------------------------------ */

const techniques = [
  {
    // Two-line labels keep the x-axis readable at narrow widths.
    label: ['Full redraw,', 'primitives only'],
    shortName: 'Full redraw, primitives only',
    microseconds: 3400,
    family: 'primitives',
    explanation: 'Every frame rebuilds the whole face from scratch. Each eye, ' +
      'eyebrow, and mouth is drawn again with ellipse() and poly() calls. ' +
      'That is the most drawing work of any technique here.'
  },
  {
    label: ['Full redraw,', 'blitted sprites'],
    shortName: 'Full redraw, blitted sprites',
    microseconds: 1150,
    family: 'blit',
    explanation: 'The eyes and mouth were drawn once into small buffers ahead ' +
      'of time. Each frame just copies those finished pixel blocks with blit(), ' +
      'which runs about three times faster than rebuilding the shapes.'
  },
  {
    label: ['Partial redraw,', 'primitives'],
    shortName: 'Partial redraw, primitives',
    microseconds: 480,
    family: 'primitives',
    explanation: 'Only the eyelid region is redrawn for a blink, so the rest of ' +
      'the face is left alone. Touching fewer pixels avoids the cost of redrawing ' +
      'an entire face every frame, even with primitive calls.'
  },
  {
    label: ['Partial redraw,', 'blitted sprite'],
    shortName: 'Partial redraw, blitted sprite',
    microseconds: 190,
    family: 'blit',
    explanation: 'This technique combines both savings: a small region, copied ' +
      'instead of rebuilt. It is the fastest option shown, about 18 times faster ' +
      'than a full redraw made only of primitives.'
  }
];

// Teal marks techniques that rebuild shapes; coral marks techniques that copy
// pre-rendered sprites. The colors match the book's mascot identity.
const FAMILY_COLORS = {
  primitives: '#00897B',
  blit: '#FF7043'
};

// One frame at 20 frames per second lasts 1/20 of a second, which is
// 50,000 microseconds. That is the whole time budget for a frame.
const BUDGET_US = 50000;
const BUDGET_FPS = 20;

/* ------------------------------------------------------------------ */
/* 2. The two views of the same four measurements.                     */
/* ------------------------------------------------------------------ */

// Maximum theoretical frame rate: one second holds 1,000,000 microseconds,
// so dividing by the draw time gives frames per second if drawing were the
// only work the program ever did.
function fpsFor(microseconds) {
  return Math.round(1000000 / microseconds);
}

const VIEWS = {
  microseconds: {
    axisLabel: 'Draw time (microseconds per frame)',
    value: function (t) { return t.microseconds; },
    format: function (v) { return v.toLocaleString('en-US') + ' us'; },
    budgetValue: BUDGET_US,
    budgetLabel: '50,000 us = the full time budget for one frame at 20 FPS'
  },
  fps: {
    axisLabel: 'Maximum theoretical frames per second',
    value: function (t) { return fpsFor(t.microseconds); },
    format: function (v) { return v.toLocaleString('en-US') + ' FPS'; },
    budgetValue: BUDGET_FPS,
    budgetLabel: '20 FPS target - every technique clears it easily'
  }
};

const DEFAULT_TEXT =
  'Hover any bar for its exact draw time and its maximum theoretical frame ' +
  'rate. Click a bar to read why that technique costs what it does.';

let currentView = 'microseconds';
let showBudget = false;
let selectedIndex = null;   // index of the clicked bar, or null
let chart = null;

/* ------------------------------------------------------------------ */
/* 3. Custom plugin: a value label above every bar, plus the dashed    */
/*    budget reference line when the learner turns it on.              */
/* ------------------------------------------------------------------ */

const annotationPlugin = {
  id: 'benchmarkAnnotations',
  // afterDatasetsDraw runs before tooltips, so tooltips always stay on top.
  afterDatasetsDraw: function (chartInstance) {
    const ctx = chartInstance.ctx;
    const meta = chartInstance.getDatasetMeta(0);
    const view = VIEWS[currentView];

    ctx.save();

    // A readable number above each bar. Without this, the 190 us bar would be
    // almost impossible to read once the budget line stretches the axis.
    ctx.textAlign = 'center';
    ctx.font = 'bold 13px Arial, Helvetica, sans-serif';
    ctx.fillStyle = '#263238';
    meta.data.forEach(function (bar, i) {
      const value = chartInstance.data.datasets[0].data[i];
      ctx.fillText(view.format(value), bar.x, bar.y - 8);
    });

    // The dashed reference line showing the 20 FPS budget.
    if (showBudget) {
      const yScale = chartInstance.scales.y;
      const y = yScale.getPixelForValue(view.budgetValue);
      const left = chartInstance.chartArea.left;
      const right = chartInstance.chartArea.right;

      ctx.strokeStyle = '#5C6BC0';
      ctx.lineWidth = 2;
      ctx.setLineDash([8, 5]);
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(right, y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.textAlign = 'left';
      ctx.font = 'italic 12px Arial, Helvetica, sans-serif';
      ctx.fillStyle = '#3949AB';
      // Put the label just below the line in the microsecond view, where the
      // line sits near the top, and just above it in the frames-per-second
      // view, where the line sits near the bottom.
      const labelY = (currentView === 'microseconds') ? y + 15 : y - 7;
      ctx.fillText(view.budgetLabel, left + 6, labelY);
    }

    ctx.restore();
  }
};

/* ------------------------------------------------------------------ */
/* 4. The side-panel explanation.                                      */
/* ------------------------------------------------------------------ */

function showExplanation(index) {
  selectedIndex = index;
  const panel = document.getElementById('explanation');

  if (index === null) {
    panel.innerHTML = DEFAULT_TEXT;
    panel.style.borderLeftColor = '#B0BEC5';
    return;
  }

  const t = techniques[index];
  const us = t.microseconds;
  panel.innerHTML =
    '<strong>' + t.shortName + ': ' + us.toLocaleString('en-US') +
    ' microseconds per frame</strong> (up to about ' +
    fpsFor(us).toLocaleString('en-US') + ' FPS, and ' +
    (us / BUDGET_US * 100).toFixed(1) + '% of a 20 FPS frame budget). ' +
    t.explanation;
  panel.style.borderLeftColor = FAMILY_COLORS[t.family];
}

// Selected bars get a dark border so the clicked bar stands out.
function borderColors() {
  return techniques.map(function (t, i) {
    return (i === selectedIndex) ? '#263238' : FAMILY_COLORS[t.family];
  });
}

function borderWidths() {
  return techniques.map(function (t, i) {
    return (i === selectedIndex) ? 4 : 1;
  });
}

/* ------------------------------------------------------------------ */
/* 5. Chart setup.                                                     */
/* ------------------------------------------------------------------ */

function valuesFor(view) {
  return techniques.map(VIEWS[view].value);
}

// When the budget line is on, the axis has to reach past the budget value so
// the dashed line is actually visible. Seeing the bars shrink to slivers is
// the point: even the slowest technique uses a small slice of the budget.
function suggestedAxisMax() {
  if (!showBudget) { return undefined; }
  return VIEWS[currentView].budgetValue * 1.12;
}

function createChart() {
  const ctx = document.getElementById('chart').getContext('2d');

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: techniques.map(function (t) { return t.label; }),
      datasets: [{
        label: 'Draw time',
        data: valuesFor(currentView),
        backgroundColor: techniques.map(function (t) { return FAMILY_COLORS[t.family]; }),
        borderColor: borderColors(),
        borderWidth: borderWidths(),
        maxBarThickness: 90
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      // Extra top room so the value labels are never clipped.
      layout: { padding: { top: 30 } },
      plugins: {
        title: {
          display: true,
          text: 'Draw Time per Frame: Primitives vs. Blitting',
          font: { size: 17 },
          padding: { bottom: 6 }
        },
        legend: { display: false },   // the color key lives in HTML instead
        tooltip: {
          callbacks: {
            // Every tooltip carries both numbers, so the learner can compare
            // microseconds and frame rates without switching views.
            label: function (context) {
              const t = techniques[context.dataIndex];
              return t.microseconds.toLocaleString('en-US') +
                ' microseconds -> up to about ' +
                fpsFor(t.microseconds).toLocaleString('en-US') +
                ' FPS theoretical max';
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Technique' },
          ticks: { font: { size: 13 } }
        },
        y: {
          beginAtZero: true,
          grace: '14%',
          title: { display: true, text: VIEWS[currentView].axisLabel }
        }
      }
    },
    plugins: [annotationPlugin]
  });

  // Clicking a bar selects it and fills the explanation panel. A direct canvas
  // listener reports the clicked bar reliably at every canvas size.
  chart.canvas.style.cursor = 'pointer';
  chart.canvas.addEventListener('click', function (e) {
    const hits = chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
    showExplanation(hits.length > 0 ? hits[0].index : null);
    refreshChart();
  });
}

// Push the current view, budget setting, and selection into the chart.
function refreshChart() {
  chart.data.datasets[0].data = valuesFor(currentView);
  chart.data.datasets[0].borderColor = borderColors();
  chart.data.datasets[0].borderWidth = borderWidths();
  chart.options.scales.y.title.text = VIEWS[currentView].axisLabel;
  chart.options.scales.y.suggestedMax = suggestedAxisMax();
  chart.update();
}

/* ------------------------------------------------------------------ */
/* 6. Controls.                                                        */
/* ------------------------------------------------------------------ */

function switchView(view) {
  currentView = view;

  const buttons = document.querySelectorAll('#toggle button');
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].classList.toggle('active', buttons[i].getAttribute('data-view') === view);
  }
  refreshChart();
}

function initChart() {
  createChart();
  showExplanation(null);

  const buttons = document.querySelectorAll('#toggle button');
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function () {
      switchView(this.getAttribute('data-view'));
    });
  }

  document.getElementById('budget-check').addEventListener('change', function () {
    showBudget = this.checked;
    refreshChart();
  });
}

window.addEventListener('DOMContentLoaded', initChart);
