// Screen-Based Robot Face Timeline
// An interactive vis-timeline MicroSim for the Robot Faces intelligent textbook.
// Bloom level: Understand (L2) - summarize, interpret
//
// CANVAS_HEIGHT: 580
//
// The learner filters by company, clicks an event dot, and reads the expanded
// description. That step-through pattern fits an Understand-level objective
// better than an animation would.

/* ------------------------------------------------------------------ */
/* 1. The data. One object per milestone drives both the timeline and  */
/*    the detail panel below it.                                       */
/* ------------------------------------------------------------------ */

// company keys: 'anki', 'emotix', 'bluefrog', plus 'ghost' spacers
const companyNames = {
  anki: 'Anki (Cozmo and Vector)',
  emotix: 'Emotix (Miko)',
  bluefrog: 'Blue Frog Robotics (Buddy)'
};

const timelineEvents = [
  // Invisible left spacer so the first real label is not clipped by the edge.
  { id: 0, year: 2007, company: 'ghost' },

  {
    id: 1,
    year: 2010,
    company: 'anki',
    title: 'Anki Founded',
    short: 'Three Carnegie Mellon robotics graduates start Anki.',
    long: 'Anki began in 2010 when a group of robotics graduates from Carnegie Mellon University turned their research into a consumer company. They wanted to put university-grade robotics into products that ordinary families could buy.',
    why: 'Every clever behavior you will see in Cozmo and Vector started as academic robotics research, not as a toy idea.'
  },
  {
    id: 2,
    year: 2015,
    company: 'bluefrog',
    title: 'Buddy Announced on Indiegogo',
    short: 'Blue Frog Robotics announces Buddy and opens crowdfunding.',
    long: 'Blue Frog Robotics announced Buddy in 2015 and launched an Indiegogo campaign to fund it. Backers pledged money up front, years before any robot was ready to ship.',
    why: 'Crowdfunding proved that people wanted a screen-faced home robot, but it also set a delivery date the company could not meet.'
  },
  {
    id: 3,
    year: 2016,
    company: 'anki',
    title: 'Cozmo Released',
    short: 'Anki ships Cozmo, its first screen-faced robot.',
    long: 'Cozmo reached stores in 2016 with a small animated screen for a face. Its eyes squinted, widened, and drooped, giving a palm-sized robot a surprisingly readable personality.',
    why: 'Cozmo showed that two animated eyes on a tiny screen can carry an entire emotional performance.'
  },
  {
    id: 4,
    year: 2017,
    company: 'emotix',
    title: 'Miko Released in India',
    short: 'Emotix launches Miko for the education market in India.',
    long: 'Emotix released Miko in India in 2017 as a companion robot aimed at children and classrooms. Its round screen face was designed for teaching and conversation rather than play alone.',
    why: 'Miko aimed at education instead of entertainment, and that different market choice shaped how long the product survived.'
  },
  {
    id: 5,
    year: 2018,
    company: 'anki',
    title: 'Vector Released',
    short: 'Anki ships Vector, a more independent screen-faced robot.',
    long: 'Vector arrived in 2018 as a robot meant to live on a desk full time rather than be taken out to play. It answered questions, recognized faces, and expressed itself through the same style of animated eyes as Cozmo.',
    why: 'Vector pushed the same face design further, which makes it the clearest example of reusing one expression system across products.'
  },
  {
    id: 6,
    year: 2019,
    company: 'anki',
    title: 'Anki Shuts Down',
    short: 'Anki runs out of funding and closes its operations.',
    long: 'Anki shut down in 2019, less than a year after Vector shipped. The company had raised a large amount of investment, but it could not reach the sales it needed to keep going.',
    why: 'Notice the timing: the shutdown came right after the most advanced robot launched, not before it.'
  },
  {
    id: 7,
    year: 2019,
    endYear: 2020,
    company: 'anki',
    title: 'Vector Acquired and Relaunched',
    short: 'A new company buys Vector and brings the robot back.',
    long: 'After the shutdown, another company acquired the assets behind Vector and relaunched the robot. Existing owners kept their robots working, and new units returned to sale.',
    why: 'A product can outlive the company that made it, so a shutdown is not always the end of a robot face.'
  },
  {
    id: 8,
    year: 2021,
    company: 'bluefrog',
    title: 'Blue Frog Restructures',
    short: 'Blue Frog Robotics restructures while still developing Buddy.',
    long: 'Blue Frog Robotics went through financial restructuring in 2021 while continuing work on Buddy. The robot had been promised years earlier and was still not widely delivered.',
    why: 'Long delays cost a company money and trust, even when the engineering eventually works.'
  },
  {
    id: 9,
    year: 2020,
    endYear: 2023,
    company: 'emotix',
    title: 'Miko Keeps Shipping New Models',
    short: 'Emotix continues releasing new Miko models through the 2020s.',
    long: 'Through the 2020s, Emotix kept releasing updated Miko models for the educational robotics market. The product line grew steadily while two better-funded competitors stumbled.',
    why: 'Steady shipping to a clear audience outlasted both the biggest funding total and the loudest crowdfunding launch.'
  },

  // Invisible right spacer.
  { id: 99, year: 2026, company: 'ghost' }
];

/* ------------------------------------------------------------------ */
/* 2. Build the vis-timeline items.                                    */
/* ------------------------------------------------------------------ */

let timeline = null;      // the vis.Timeline instance
let timelineData = null;  // the vis.DataSet the timeline renders
let allItems = [];        // every item, ghosts included (used for the window math)
let visibleItems = [];    // only the real events (used for rendering and filtering)
let activeFilter = 'all';

function buildItems() {
  allItems = timelineEvents.map(function (ev) {
    const item = {
      id: ev.id,
      // Ghost spacers render nothing; they only widen the visible window.
      content: ev.company === 'ghost' ? '' : ev.title,
      start: new Date(ev.year, 5, 30),
      className: ev.company,
      title: ev.short || ''
    };
    if (ev.endYear) {
      item.end = new Date(ev.endYear, 5, 30);
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

function yearLabel(ev) {
  return ev.endYear ? ev.year + '-' + ev.endYear : String(ev.year);
}

function showEventDetails(itemId) {
  const ev = timelineEvents.find(function (e) { return e.id === itemId; });
  const panel = document.getElementById('details');
  if (!ev || ev.company === 'ghost') { return; }

  panel.className = 'details ' + ev.company;
  panel.innerHTML =
    '<h3>' + yearLabel(ev) + ' &mdash; ' + ev.title + '</h3>' +
    '<p class="company">' + companyNames[ev.company] + '</p>' +
    '<p>' + ev.long + '</p>' +
    '<p class="why"><strong>Why it matters:</strong> ' + ev.why + '</p>';
}

function clearEventDetails() {
  const panel = document.getElementById('details');
  panel.className = 'details';
  panel.innerHTML =
    '<h3>Click any event to read more</h3>' +
    '<p>Hover an event for a one-sentence preview. Click it to see the full ' +
    'description and a note on why that moment mattered.</p>';
}

/* ------------------------------------------------------------------ */
/* 5. Company filter buttons.                                          */
/* ------------------------------------------------------------------ */

function applyFilter(company) {
  activeFilter = company;

  const shown = (company === 'all')
    ? visibleItems
    : visibleItems.filter(function (i) { return i.className === company; });

  timelineData.clear();
  timelineData.add(shown);

  // Keep the same window for every filter so learners can compare positions
  // across companies without the scale shifting under them.
  fitToData();

  const buttons = document.querySelectorAll('#filters button');
  for (let i = 0; i < buttons.length; i++) {
    const isActive = buttons[i].getAttribute('data-company') === company;
    buttons[i].classList.toggle('active', isActive);
  }
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
    height: '265px',
    margin: { item: { horizontal: 12, vertical: 6 }, axis: 26 },
    orientation: 'top',
    zoomMin: 1000 * 60 * 60 * 24 * 365 * 3,    // do not zoom closer than 3 years
    zoomMax: 1000 * 60 * 60 * 24 * 365 * 40,   // do not zoom out past 40 years
    min: new Date(2004, 0, 1),                 // panning limits, wider than the ghosts
    max: new Date(2032, 0, 1),
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

  // Wire the filter buttons.
  const filterButtons = document.querySelectorAll('#filters button');
  for (let i = 0; i < filterButtons.length; i++) {
    filterButtons[i].addEventListener('click', function () {
      applyFilter(this.getAttribute('data-company'));
    });
  }

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
