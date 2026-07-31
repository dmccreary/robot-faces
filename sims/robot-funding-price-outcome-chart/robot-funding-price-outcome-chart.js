// Robot Price and Funding Comparison Chart
// An interactive Chart.js MicroSim for the Robot Faces intelligent textbook.
// Bloom level: Analyze (L4) - compare, examine
//
// CANVAS_HEIGHT: 540
//
// The learner toggles between two views of the same four robots and looks for a
// pattern. The chart never states the conclusion; the bar colors carry the
// outcome and the learner has to compare them against the numbers.

/* ------------------------------------------------------------------ */
/* 1. Outcome categories. The bar color encodes what happened to the   */
/*    robot, which is the variable the learner is testing the numbers  */
/*    against.                                                         */
/* ------------------------------------------------------------------ */

const OUTCOMES = {
  active:      { color: '#2E7D32', label: 'Still in active production' },
  revived:     { color: '#EF6C00', label: 'Discontinued, then revived by a new company' },
  ended:       { color: '#C62828', label: 'Discontinued' },
  restructured:{ color: '#757575', label: 'Severely delayed or restructured' }
};

/* ------------------------------------------------------------------ */
/* 2. The data. All figures are approximate and rounded for teaching   */
/*    purposes only; they are not exact financial records.             */
/* ------------------------------------------------------------------ */

const robots = [
  {
    name: 'Cozmo',
    outcome: 'ended',
    price: 180,
    funding: 200,
    priceNote: 'Cozmo launched at about $180, the lowest price of the four.',
    fundingNote: 'Anki raised over $200M across its history, but Cozmo ended when the company closed in 2019.'
  },
  {
    name: 'Vector',
    outcome: 'revived',
    price: 250,
    funding: 200,
    priceNote: 'Vector launched at about $250, roughly $70 above Cozmo.',
    fundingNote: 'Anki raised over $200M across its history but shut down in 2019, and another company later revived Vector.'
  },
  {
    name: 'Miko',
    outcome: 'active',
    price: 300,
    funding: 25,
    priceNote: 'Miko launched at about $300, aimed at families and classrooms.',
    fundingNote: 'Emotix raised tens of millions across several rounds and is still shipping new Miko models.'
  },
  {
    name: 'Buddy',
    outcome: 'restructured',
    price: 500,
    funding: 0.6,
    priceNote: 'Backers pledged about $500 in 2015, and the final retail price rose after years of delay.',
    fundingNote: 'Buddy raised about $0.6M on Indiegogo in 2015, plus later private rounds, and still faced long delays.'
  }
];

// The Anki funding figure is a single company total, so it appears on both the
// Cozmo bar and the Vector bar. This footnote says so on screen.
const VIEWS = {
  price: {
    axisLabel: 'Approximate launch price (US dollars)',
    format: function (v) { return '$' + v; },
    footnote: 'Approximate launch prices, rounded. Buddy shows its 2015 crowdfunding pledge price.'
  },
  funding: {
    axisLabel: 'Approximate total funding raised (millions of US dollars)',
    format: function (v) { return '$' + v + 'M'; },
    footnote: 'Approximate totals, rounded. Cozmo and Vector share one bar value because both came from Anki, a single company.'
  }
};

let currentView = 'price';
let chart = null;
let highlightedRobot = null;   // index of the bar the learner clicked, or null

/* ------------------------------------------------------------------ */
/* 3. Custom plugin: value labels above every bar, plus the two        */
/*    callout annotations in the funding view.                         */
/* ------------------------------------------------------------------ */

const annotationPlugin = {
  id: 'robotAnnotations',
  // afterDatasetsDraw runs before tooltips, so tooltips stay on top.
  afterDatasetsDraw: function (chartInstance) {
    const ctx = chartInstance.ctx;
    const meta = chartInstance.getDatasetMeta(0);
    const fmt = VIEWS[currentView].format;

    ctx.save();
    ctx.textAlign = 'center';

    // A readable number above each bar. Without this, Buddy's tiny funding bar
    // would be unreadable next to Anki's $200M bar.
    ctx.font = 'bold 14px Arial, Helvetica, sans-serif';
    ctx.fillStyle = '#263238';
    meta.data.forEach(function (bar, i) {
      const value = chartInstance.data.datasets[0].data[i];
      ctx.fillText(fmt(value), bar.x, bar.y - 8);
    });

    // Two callout labels that name the pattern worth examining.
    if (currentView === 'funding') {
      ctx.font = 'italic 13px Arial, Helvetica, sans-serif';

      const vectorBar = meta.data[1];
      ctx.fillStyle = '#EF6C00';
      ctx.fillText('Highest funding, still discontinued', vectorBar.x, vectorBar.y - 30);

      const mikoBar = meta.data[2];
      ctx.fillStyle = '#2E7D32';
      ctx.fillText('Modest funding, still shipping', mikoBar.x, mikoBar.y - 30);
    }

    ctx.restore();
  }
};

/* ------------------------------------------------------------------ */
/* 4. Legend, footnote, and highlight handling in plain HTML.          */
/* ------------------------------------------------------------------ */

function buildLegend() {
  const legend = document.getElementById('legend');
  legend.innerHTML = '';
  Object.keys(OUTCOMES).forEach(function (key) {
    const entry = document.createElement('span');
    entry.className = 'legend-item';
    entry.setAttribute('data-outcome', key);
    entry.innerHTML =
      '<span class="swatch" style="background:' + OUTCOMES[key].color + '"></span>' +
      OUTCOMES[key].label;
    legend.appendChild(entry);
  });
}

// Clicking a bar highlights the legend row for that robot's outcome.
function highlightLegendFor(robotIndex) {
  highlightedRobot = robotIndex;
  const wanted = (robotIndex === null) ? null : robots[robotIndex].outcome;
  const items = document.querySelectorAll('#legend .legend-item');
  for (let i = 0; i < items.length; i++) {
    items[i].classList.toggle('active', items[i].getAttribute('data-outcome') === wanted);
  }
  const caption = document.getElementById('caption');
  if (robotIndex === null) {
    caption.textContent = VIEWS[currentView].footnote;
  } else {
    const r = robots[robotIndex];
    caption.textContent = r.name + ': ' + OUTCOMES[r.outcome].label + '.';
  }
}

/* ------------------------------------------------------------------ */
/* 5. Chart setup.                                                     */
/* ------------------------------------------------------------------ */

function valuesFor(view) {
  return robots.map(function (r) { return view === 'price' ? r.price : r.funding; });
}

function barColors() {
  return robots.map(function (r) { return OUTCOMES[r.outcome].color; });
}

function createChart() {
  const ctx = document.getElementById('chart').getContext('2d');

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: robots.map(function (r) { return r.name; }),
      datasets: [{
        label: 'Robot',
        data: valuesFor(currentView),
        backgroundColor: barColors(),
        borderColor: barColors(),
        borderWidth: 1,
        maxBarThickness: 90
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      // Extra top room so the value labels and callouts are never clipped.
      layout: { padding: { top: 46 } },
      plugins: {
        title: {
          display: true,
          text: 'Price and Funding Told Only Part of the Story',
          font: { size: 17 },
          padding: { bottom: 4 }
        },
        legend: { display: false },   // an HTML legend is used instead
        tooltip: {
          callbacks: {
            label: function (context) {
              const r = robots[context.dataIndex];
              const value = VIEWS[currentView].format(context.parsed.y);
              return value + ' - ' + (currentView === 'price' ? r.priceNote : r.fundingNote);
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Robot' },
          ticks: { maxRotation: 45, minRotation: 0, font: { size: 14 } }
        },
        y: {
          beginAtZero: true,
          // Headroom so the tallest bar never touches the value label above it.
          grace: '18%',
          title: { display: true, text: VIEWS[currentView].axisLabel }
        }
      }
    },
    plugins: [annotationPlugin]
  });

  // Clicking a bar highlights that robot's outcome in the color key. A direct
  // canvas listener is used here because it reports the clicked bar reliably at
  // every canvas size.
  chart.canvas.style.cursor = 'pointer';
  chart.canvas.addEventListener('click', function (e) {
    const hits = chart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
    highlightLegendFor(hits.length > 0 ? hits[0].index : null);
  });
}

/* ------------------------------------------------------------------ */
/* 6. The Price / Funding toggle.                                      */
/* ------------------------------------------------------------------ */

function switchView(view) {
  currentView = view;
  chart.data.datasets[0].data = valuesFor(view);
  chart.options.scales.y.title.text = VIEWS[view].axisLabel;
  chart.update();   // Chart.js animates the bars between the two data sets

  const buttons = document.querySelectorAll('#toggle button');
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].classList.toggle('active', buttons[i].getAttribute('data-view') === view);
  }
  highlightLegendFor(highlightedRobot);
}

function initChart() {
  buildLegend();
  createChart();
  highlightLegendFor(null);

  const buttons = document.querySelectorAll('#toggle button');
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function () {
      switchView(this.getAttribute('data-view'));
    });
  }
}

window.addEventListener('DOMContentLoaded', initChart);
