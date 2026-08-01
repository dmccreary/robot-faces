// Four Robots, Four Bets on a Screen Face - infographic MicroSim
// Chapter 2: A History of Screen-Based Robot Faces
// Bloom level: Analyze (L4) - differentiate, contrast
// CANVAS_HEIGHT: 810
// Learning objective: differentiate the four robots' design approaches - face
// style, mobility, target buyer, and interaction mode - and contrast which
// choices coincided with which business outcome.
// Plain HTML, CSS, and JavaScript. No charting library is needed.

// Outcome color key. These colors appear only while "Compare Outcome" is on,
// so the company accent colors and the outcome colors never compete.
const OUTCOME_COLORS = {
  active: '#2E7D32',      // green  - still in production
  revived: '#EF6C00',     // orange - discontinued, then revived by someone else
  shutdown: '#C62828',    // red    - discontinued when the company closed
  delayed: '#757575'      // gray   - long delays and financial restructuring
};

const OUTCOME_LABELS = {
  active: 'Still in production',
  revived: 'Discontinued, then revived',
  shutdown: 'Discontinued with company shutdown',
  delayed: 'Delayed, then restructured'
};

// One record per robot. Every field is a comparable design dimension, which is
// what makes a side-by-side analysis possible.
const ROBOTS = [
  {
    id: 'cozmo',
    name: 'Cozmo',
    maker: 'Anki, 2016',
    accent: '#00897B',
    bet: 'The bet: a toy-priced robot with enough personality to feel alive.',
    faceCaption: 'Blocky animated eyes on a small screen, riding a tracked body',
    faceStyle: 'Monochrome-style animated eyes on a small rectangular screen.',
    mobility: 'Tank treads on a tracked-vehicle body.',
    interaction: 'Camera-based recognition of its cubes and of human faces.',
    buyer: 'General consumer and toy market.',
    outcome: 'shutdown',
    outcomeText: 'Discontinued when Anki shut down in 2019.'
  },
  {
    id: 'vector',
    name: 'Vector',
    maker: 'Anki, 2018',
    accent: '#00897B',
    bet: 'The bet: an always-on desk companion you talk to, not a toy you play with.',
    faceCaption: 'A color animated face on an always-listening desk companion',
    faceStyle: 'Color animated face with expressive, constantly moving eyes.',
    mobility: 'Stationary to lightly mobile; it stays on its home surface.',
    interaction: 'Voice-activated, always-on, backed by cloud-connected AI.',
    buyer: 'Tech-enthusiast consumers.',
    outcome: 'revived',
    outcomeText: 'Discontinued in 2019, then revived by a new company.'
  },
  {
    id: 'miko',
    name: 'Miko',
    maker: 'Miko, 2017',
    accent: '#FF7043',
    bet: 'The bet: a screen face is a teaching tool, and parents will pay for teaching.',
    faceCaption: 'A round color screen face for kids, on a rotating wheeled base',
    faceStyle: 'Round color animated face built for warm, kid-friendly expressions.',
    mobility: 'Simple wheeled rotation rather than full room navigation.',
    interaction: 'Curated educational content plus voice conversation.',
    buyer: 'Parents of school-age children.',
    outcome: 'active',
    outcomeText: 'Still in active production, with newer models released.'
  },
  {
    id: 'buddy',
    name: 'Buddy',
    maker: 'Blue Frog Robotics, announced 2015',
    accent: '#7E57C2',
    bet: 'The bet: one robot that navigates the whole house and watches over it.',
    faceCaption: 'Cartoon eyes on a tablet-style face, mounted on a room-navigating base',
    faceStyle: 'Tablet-style animated face, large enough to read across a room.',
    mobility: 'Full wheeled mobile base designed for room-to-room navigation.',
    interaction: 'Home monitoring and companionship features.',
    buyer: 'Households wanting a general-purpose home companion.',
    outcome: 'delayed',
    outcomeText: 'Severely delayed for years, followed by a financial restructuring.'
  }
];

// ---------- View state ----------
const expanded = new Set();     // ids of the cards the student has opened
let compareMobility = false;
let compareOutcome = false;

// ---------------------------------------------------------------------------
// Simple icon-style illustrations, one per robot
// ---------------------------------------------------------------------------

function faceSvg(robot) {
  const a = robot.accent;
  if (robot.id === 'cozmo') {
    // Small screen face on a tracked body with a lift arm
    return `<svg viewBox="0 0 130 92" role="img" aria-label="Cozmo icon">
      <rect x="30" y="14" width="58" height="40" rx="6" fill="${a}"/>
      <rect x="38" y="22" width="42" height="24" rx="3" fill="#101820"/>
      <rect x="44" y="28" width="10" height="12" rx="2" fill="#7FDBFF"/>
      <rect x="64" y="28" width="10" height="12" rx="2" fill="#7FDBFF"/>
      <rect x="90" y="20" width="8" height="34" rx="3" fill="#9e9e9e"/>
      <rect x="24" y="58" width="76" height="20" rx="10" fill="#37474F"/>
      <circle cx="36" cy="68" r="7" fill="#B0BEC5"/>
      <circle cx="60" cy="68" r="7" fill="#B0BEC5"/>
      <circle cx="86" cy="68" r="7" fill="#B0BEC5"/>
    </svg>`;
  }
  if (robot.id === 'vector') {
    // Screen face plus sound waves for the voice-first interaction
    return `<svg viewBox="0 0 130 92" role="img" aria-label="Vector icon">
      <rect x="34" y="16" width="54" height="38" rx="6" fill="${a}"/>
      <rect x="41" y="23" width="40" height="24" rx="3" fill="#0B1020"/>
      <rect x="47" y="29" width="9" height="12" rx="4" fill="#4FC3F7"/>
      <rect x="66" y="29" width="9" height="12" rx="4" fill="#4FC3F7"/>
      <path d="M96 24 A16 16 0 0 1 96 46" fill="none" stroke="${a}" stroke-width="3"/>
      <path d="M104 18 A24 24 0 0 1 104 52" fill="none" stroke="${a}"
            stroke-width="3" opacity="0.6"/>
      <rect x="30" y="58" width="62" height="16" rx="8" fill="#37474F"/>
      <circle cx="42" cy="66" r="6" fill="#B0BEC5"/>
      <circle cx="80" cy="66" r="6" fill="#B0BEC5"/>
    </svg>`;
  }
  if (robot.id === 'miko') {
    // Round color face on a small wheeled base
    return `<svg viewBox="0 0 130 92" role="img" aria-label="Miko icon">
      <circle cx="65" cy="34" r="26" fill="${a}"/>
      <circle cx="65" cy="34" r="19" fill="#101820"/>
      <circle cx="57" cy="32" r="5" fill="#FFE082"/>
      <circle cx="73" cy="32" r="5" fill="#FFE082"/>
      <path d="M56 42 Q65 50 74 42" fill="none" stroke="#FFE082" stroke-width="3"
            stroke-linecap="round"/>
      <rect x="44" y="60" width="42" height="16" rx="6" fill="#455A64"/>
      <circle cx="52" cy="78" r="6" fill="#B0BEC5"/>
      <circle cx="78" cy="78" r="6" fill="#B0BEC5"/>
    </svg>`;
  }
  // Buddy: a tablet face on a tall body with a driving base
  return `<svg viewBox="0 0 130 92" role="img" aria-label="Buddy icon">
    <rect x="36" y="8" width="58" height="42" rx="6" fill="${a}"/>
    <rect x="42" y="14" width="46" height="30" rx="3" fill="#0B1020"/>
    <circle cx="56" cy="27" r="6" fill="#80DEEA"/>
    <circle cx="74" cy="27" r="6" fill="#80DEEA"/>
    <rect x="52" y="50" width="26" height="14" fill="#607D8B"/>
    <path d="M34 64 L96 64 L88 80 L42 80 Z" fill="#455A64"/>
    <circle cx="50" cy="80" r="7" fill="#B0BEC5"/>
    <circle cx="80" cy="80" r="7" fill="#B0BEC5"/>
  </svg>`;
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

function buildBoard() {
  const board = document.getElementById('board');
  board.innerHTML = '';

  for (const robot of ROBOTS) {
    const card = document.createElement('div');
    card.className = 'card';
    card.id = 'card-' + robot.id;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('aria-expanded', 'false');
    card.dataset.id = robot.id;

    card.innerHTML =
      '<div class="face">' + faceSvg(robot) +
        '<span class="face-cap">' + robot.faceCaption + '</span>' +
      '</div>' +
      '<p class="robot-name">' + robot.name + '</p>' +
      '<p class="maker">' + robot.maker + '</p>' +
      '<p class="bet">' + robot.bet + '</p>' +
      '<div class="compare-slot"></div>' +
      '<div class="detail-slot"></div>' +
      '<p class="hint"></p>';

    card.addEventListener('click', () => toggleCard(robot.id));
    card.addEventListener('keydown', (evt) => {
      // Space and Enter open a card, so the sim works without a mouse.
      if (evt.key === 'Enter' || evt.key === ' ') {
        evt.preventDefault();
        toggleCard(robot.id);
      }
    });

    board.appendChild(card);
  }
  refreshCards();
}

function toggleCard(id) {
  if (expanded.has(id)) {
    expanded.delete(id);
  } else {
    expanded.add(id);
  }
  refreshCards();
}

// Redraw the changing parts of every card: border color, comparison strips,
// and the expanded detail list.
function refreshCards() {
  for (const robot of ROBOTS) {
    const card = document.getElementById('card-' + robot.id);
    const isOpen = expanded.has(robot.id);

    // Border: company accent normally, outcome color while comparing outcomes.
    card.style.borderColor = compareOutcome
      ? OUTCOME_COLORS[robot.outcome]
      : robot.accent;
    card.querySelector('.maker').style.color = compareOutcome
      ? OUTCOME_COLORS[robot.outcome]
      : robot.accent;
    card.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

    // Comparison strips let a student read one dimension straight across.
    let strips = '';
    if (compareMobility) {
      strips += '<div class="strip"><span class="strip-label">Mobility</span>' +
                robot.mobility + '</div>';
    }
    if (compareOutcome) {
      strips += '<div class="strip" style="background-color:#f2f2f2;' +
                'border-left-color:' + OUTCOME_COLORS[robot.outcome] + '">' +
                '<span class="strip-label">Outcome</span>' +
                robot.outcomeText + '</div>';
    }
    card.querySelector('.compare-slot').innerHTML = strips;

    // The full record, revealed on click.
    card.querySelector('.detail-slot').innerHTML = isOpen
      ? detailHtml(robot)
      : '';
    card.querySelector('.hint').textContent = isOpen
      ? 'Click to collapse'
      : 'Click to see all four design choices';
  }

  const legend = document.getElementById('legend');
  legend.classList.toggle('visible', compareOutcome);
}

// A dimension already shown in a comparison strip is left out of the detail
// list, so the same sentence never appears twice on one card.
function detailHtml(robot) {
  let rows = '<dt>Face style</dt><dd>' + robot.faceStyle + '</dd>';
  if (!compareMobility) {
    rows += '<dt>Mobility</dt><dd>' + robot.mobility + '</dd>';
  }
  rows += '<dt>Primary interaction</dt><dd>' + robot.interaction + '</dd>' +
          '<dt>Target buyer</dt><dd>' + robot.buyer + '</dd>';
  if (!compareOutcome) {
    rows += '<dt>Outcome</dt><dd>' + robot.outcomeText + '</dd>';
  }
  return '<div class="detail"><dl>' + rows + '</dl></div>';
}

function buildLegend() {
  const legend = document.getElementById('legend');
  legend.innerHTML = Object.keys(OUTCOME_COLORS).map((key) =>
    '<span><span class="key" style="background-color:' +
    OUTCOME_COLORS[key] + '"></span>' + OUTCOME_LABELS[key] + '</span>'
  ).join('');
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------

function wireControls() {
  const mobilityToggle = document.getElementById('mobilityToggle');
  const outcomeToggle = document.getElementById('outcomeToggle');
  const resetButton = document.getElementById('resetButton');

  mobilityToggle.addEventListener('click', () => {
    compareMobility = !compareMobility;
    mobilityToggle.classList.toggle('active', compareMobility);
    refreshCards();
  });

  outcomeToggle.addEventListener('click', () => {
    compareOutcome = !compareOutcome;
    outcomeToggle.classList.toggle('active', compareOutcome);
    refreshCards();
  });

  resetButton.addEventListener('click', () => {
    compareMobility = false;
    compareOutcome = false;
    expanded.clear();
    mobilityToggle.classList.remove('active');
    outcomeToggle.classList.remove('active');
    refreshCards();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  buildLegend();
  buildBoard();
  wireControls();
});
