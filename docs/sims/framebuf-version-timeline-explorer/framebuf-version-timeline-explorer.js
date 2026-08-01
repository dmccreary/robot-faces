// FrameBuf Version Timeline
// Chapter 8: A History of MicroPython's FrameBuf Drawing Support
// Bloom level: Understand (L2) - summarize, interpret
//
// CANVAS_HEIGHT: 610
//
// The learner hovers for a preview, clicks for the full story, and flips the
// "Show only stable releases" switch to compare the official release history
// against the full history. That step-through pattern fits an Understand-level
// objective better than an animation would.

/* ------------------------------------------------------------------ */
/* 1. The data. One object per milestone drives the timeline, the      */
/*    tooltip, and the detail panel below it.                          */
/* ------------------------------------------------------------------ */

// kind keys: 'baseline', 'stable', 'dev', plus 'ghost' spacers
const kindNames = {
  baseline: 'Method availability',
  stable: 'Official stable release',
  dev: 'Development branch, not yet released'
};

const milestones = [
  // Invisible left spacer so the first real label is not clipped by the edge.
  { id: 0, start: [2015, 0], kind: 'ghost' },

  {
    id: 1,
    start: [2017, 0],
    end: [2021, 6],
    kind: 'baseline',
    title: 'Basic shapes only',
    fullTitle: 'Basic Shapes Only: No ellipse(), No poly()',
    short: 'framebuf can draw only straight lines, rectangles, text, and pixels.',
    long: 'For years, framebuf shipped with nine drawing methods: fill, pixel, hline, vline, line, rect, scroll, blit, and text. Neither ellipse() nor poly() existed, and blit() could only copy between frame buffers that used the exact same color format.',
    why: 'Anyone who wanted a curve in this era had to fake one with a loop full of short line segments and trigonometry.'
  },
  {
    id: 2,
    start: [2021, 8],
    kind: 'stable',
    title: 'v1.17: blit() crosses formats',
    fullTitle: 'v1.17: blit() Learns to Cross Color Formats',
    short: 'blit() learns to copy between different color formats and palettes.',
    long: 'MicroPython v1.17 shipped in 2021 with a more capable blit(). From this release on, blit() could copy between frame buffers that use different color formats, converting colors through a palette you supply.',
    why: 'This is proof the story is not a single event: framebuf has been improving one contributed change at a time for years.'
  },
  {
    id: 3,
    start: [2022, 7],
    kind: 'dev',
    title: 'ellipse() merged to dev',
    fullTitle: 'August 2022: ellipse() and poly() Merged into the Development Branch',
    short: 'The pull request adding ellipse() and poly() is merged into the development branch.',
    long: 'In August 2022, maintainers reviewed, approved, and merged the pull request that added ellipse() and poly() to framebuf. The code now existed and worked, but it lived only in the development branch.',
    why: 'Merged is not the same as released. On this date no official download you could install yet contained ellipse().'
  },
  {
    id: 4,
    start: [2022, 7],
    end: [2023, 3],
    kind: 'dev',
    title: 'Nightly builds only',
    fullTitle: 'The Eight-Month Gap: Nightly Builds Only',
    short: 'Only unofficial nightly build firmware offered ellipse() during this stretch.',
    long: 'For about eight months, the only way to use ellipse() and poly() was to flash a nightly build: unofficial firmware generated automatically from the newest development code. Nightly builds change daily and skip the full testing an official release receives.',
    why: 'This gap is the heart of the chapter. A feature can be finished and still be out of reach for anyone who wants stable, supported firmware.'
  },
  {
    id: 5,
    start: [2023, 3],
    kind: 'stable',
    title: 'v1.20.0: ellipse() ships',
    fullTitle: 'v1.20.0: ellipse() and poly() Reach a Stable Release',
    short: 'The first official stable release to include ellipse() and poly() in framebuf.',
    long: 'MicroPython v1.20.0 arrived in April 2023 as the first official, stable release containing ellipse() and poly(). This is the version this book assumes you have installed on your board.',
    why: 'Install v1.20.0 or newer and every quadrant-fill and point-array technique in Chapter 7 simply works, with no risky firmware and no waiting.'
  },
  {
    id: 6,
    start: [2024, 10],
    kind: 'stable',
    title: 'v1.24.1: ellipse() bug fix',
    fullTitle: 'v1.24.1: A Patch Release Fixes an ellipse() Edge Case',
    short: 'A patch release corrects an edge case in how ellipse() draws.',
    long: 'In 2024, the patch release v1.24.1 fixed a specific edge-case bug in ellipse(). The third number in a version string marks a patch, so this release changed no features and added nothing new.',
    why: 'Shipping is not the end of a feature. Keeping your firmware reasonably current is how you collect fixes like this one.'
  },

  // Invisible right spacer.
  { id: 99, start: [2026, 6], kind: 'ghost' }
];

/* ------------------------------------------------------------------ */
/* 2. Build the vis-timeline items.                                    */
/* ------------------------------------------------------------------ */

let timeline = null;      // the vis.Timeline instance
let timelineData = null;  // the vis.DataSet the timeline renders
let allItems = [];        // every item, ghosts included (used for the window math)
let visibleItems = [];    // only the real milestones (used for filtering)
let stableOnly = false;

// Dates arrive as [year, monthIndex] pairs, which keeps the data readable.
function toDate(pair) {
  return new Date(pair[0], pair[1], 15);
}

function buildItems() {
  allItems = milestones.map(function (ev) {
    const item = {
      id: ev.id,
      // Ghost spacers render nothing; they only widen the visible window.
      content: ev.kind === 'ghost' ? '' : ev.title,
      start: toDate(ev.start),
      className: ev.kind,
      title: ev.short || ''
    };
    if (ev.end) {
      item.end = toDate(ev.end);
      item.type = 'range';
    }
    return item;
  });
  visibleItems = allItems.filter(function (i) { return i.className !== 'ghost'; });
}

/* ------------------------------------------------------------------ */
/* 3. Window helpers. The ghost items supply the edge padding, so the  */
/*    earliest and latest labels are never cut off by the container.   */
/* ------------------------------------------------------------------ */

function fitToData() {
  const stamps = allItems.map(function (i) { return i.start.getTime(); });
  const minDate = Math.min.apply(null, stamps);
  const maxDate = Math.max.apply(null, stamps);
  timeline.setWindow(new Date(minDate), new Date(maxDate), { animation: false });
}

function panWindow(fraction) {
  const win = timeline.getWindow();
  const span = win.end - win.start;
  const shift = span * fraction;
  timeline.setWindow(
    new Date(win.start.valueOf() + shift),
    new Date(win.end.valueOf() + shift),
    { animation: false }
  );
}

function zoomWindow(factor) {
  const win = timeline.getWindow();
  const center = (win.start.valueOf() + win.end.valueOf()) / 2;
  const half = ((win.end - win.start) * factor) / 2;
  timeline.setWindow(new Date(center - half), new Date(center + half), { animation: false });
}

/* ------------------------------------------------------------------ */
/* 4. The detail panel below the timeline.                             */
/* ------------------------------------------------------------------ */

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];

function dateLabel(ev) {
  const startLabel = MONTHS[ev.start[1]] + ' ' + ev.start[0];
  if (!ev.end) return startLabel;
  return startLabel + ' to ' + MONTHS[ev.end[1]] + ' ' + ev.end[0];
}

function showEventDetails(itemId) {
  const ev = milestones.find(function (e) { return e.id === itemId; });
  const panel = document.getElementById('details');
  if (!ev || ev.kind === 'ghost') { return; }

  panel.className = 'details ' + ev.kind;
  panel.innerHTML =
    '<h3>' + ev.fullTitle + '</h3>' +
    '<p class="kind">' + dateLabel(ev) + ' &mdash; ' + kindNames[ev.kind] + '</p>' +
    '<p>' + ev.long + '</p>' +
    '<p class="why"><strong>Why it matters:</strong> ' + ev.why + '</p>';
}

function clearEventDetails() {
  const panel = document.getElementById('details');
  panel.className = 'details';
  panel.innerHTML =
    '<h3>Click any milestone to read more</h3>' +
    '<p>Hover a milestone for a one-sentence preview. Click it to see the full ' +
    'description and a note on why that moment mattered.</p>' +
    '<p>Then check <strong>Show only stable releases</strong> and watch the ' +
    'eight-month gap between the merge and the release disappear from the story.</p>';
}

/* ------------------------------------------------------------------ */
/* 5. The stable-releases-only filter.                                 */
/* ------------------------------------------------------------------ */

function applyFilter() {
  // Hiding the development-branch milestones leaves the tidy release history a
  // version list would show. Comparing the two views is the point of the sim.
  const shown = stableOnly
    ? visibleItems.filter(function (i) { return i.className !== 'dev'; })
    : visibleItems;

  timelineData.clear();
  timelineData.add(shown);

  // Keep the same window in both views so the learner can compare positions
  // without the scale shifting under them.
  fitToData();
  clearEventDetails();
}

/* ------------------------------------------------------------------ */
/* 6. Start everything once the page structure exists.                 */
/* ------------------------------------------------------------------ */

function initTimeline() {
  buildItems();

  const container = document.getElementById('timeline');
  timelineData = new vis.DataSet(visibleItems);

  const options = {
    width: '100%',
    height: '300px',
    margin: { item: { horizontal: 12, vertical: 6 }, axis: 26 },
    orientation: 'top',
    zoomMin: 1000 * 60 * 60 * 24 * 365 * 2,    // do not zoom closer than 2 years
    zoomMax: 1000 * 60 * 60 * 24 * 365 * 30,   // do not zoom out past 30 years
    min: new Date(2012, 0, 1),                 // panning limits, wider than the ghosts
    max: new Date(2030, 0, 1),
    tooltip: { followMouse: true },
    stack: true,
    selectable: true,
    showCurrentTime: false,
    moveable: true,     // click and drag pans the timeline
    zoomable: false,    // scroll-wheel zoom off, so the host page can still scroll
    align: 'center'
  };

  timeline = new vis.Timeline(container, timelineData, options);

  // Let a vertical mouse wheel scroll the host page instead of being swallowed
  // by the timeline. A horizontal wheel gesture pans the timeline instead.
  container.addEventListener('wheel', function (e) {
    const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
    if (!isHorizontal) {
      e.stopImmediatePropagation();
    } else {
      e.preventDefault();
      panWindow(e.deltaX / container.clientWidth);
    }
  }, true);

  timeline.on('select', function (properties) {
    if (properties.items.length > 0) {
      showEventDetails(properties.items[0]);
    }
  });

  document.getElementById('stable-only').addEventListener('change', function () {
    stableOnly = this.checked;
    applyFilter();
  });

  // Wire the pan, zoom, and fit buttons.
  document.getElementById('pan-left').addEventListener('click', function () { panWindow(-0.3); });
  document.getElementById('pan-right').addEventListener('click', function () { panWindow(0.3); });
  document.getElementById('zoom-in').addEventListener('click', function () { zoomWindow(0.5); });
  document.getElementById('zoom-out').addEventListener('click', function () { zoomWindow(2.0); });
  document.getElementById('fit-all').addEventListener('click', function () { fitToData(); });

  fitToData();
  clearEventDetails();
}

window.addEventListener('DOMContentLoaded', initTimeline);
