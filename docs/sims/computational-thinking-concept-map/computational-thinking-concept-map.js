// Computational Thinking Concept Map
// An interactive vis-network diagram for the Robot Faces intelligent textbook.
// Chapter 16: Computational Thinking & Capstone Design
// Bloom level: Understand (L2) / Analyze (L4) - explain, relate, differentiate
//
// CANVAS_HEIGHT: 600
//
// One hub, six thinking skills, and six earlier chapters. Clicking a skill
// shows what it means and lights the path to the place you already used it.
// Clicking an example works the other way around, from the code back to the
// skill it demonstrates.

// ---------------------------------------------------------------------
// Colors. Coral and teal come from the book's mascot identity; the outer
// example nodes stay a neutral gray-blue so they never compete with them.
// ---------------------------------------------------------------------
const HUB_COLOR = { background: '#FF7043', border: '#D84315', highlight: '#FF8A65' };
const SKILL_COLOR = { background: '#00897B', border: '#00695C', highlight: '#26A69A' };
const EXAMPLE_COLOR = { background: '#90A4AE', border: '#546E7A', highlight: '#B0BEC5' };

const DIM_NODE = { background: '#ECEFF1', border: '#CFD8DC' };
const DIM_FONT = '#B0BEC5';

const EDGE_COLOR = '#78909C';
const EDGE_HIGHLIGHT = '#FF7043';   // coral, matching the hub
const EDGE_DIM = '#DDE3E7';

const HUB_ID = 'hub';

// Matches the max-width breakpoint in main.html, where the infobox stops
// sitting beside the map and moves below it.
const NARROW_WIDTH = 680;

// ---------------------------------------------------------------------
// The six skills. Each one carries a plain-language definition, the role
// that separates it from the other five, and the earlier chapter example
// that proves the student already practiced it.
//
// Positions are laid out on two rings around the hub at (0, 0). Physics
// refines them, and the Reset Layout button puts them back here.
// ---------------------------------------------------------------------
const SKILLS = [
  {
    id: 'abstraction',
    label: 'Abstraction',
    angle: -90,
    definition: 'Abstraction means representing something complex, like a ' +
      'human facial expression, with a small set of numbers instead of a ' +
      'full picture.',
    role: 'It decides how much detail to keep. The other skills all work on ' +
      'whatever abstraction hands them.',
    example: {
      id: 'ex-face-state',
      label: 'Ch 9\nface_state dict',
      tag: 'Chapter 9',
      what: 'The face_state dictionary.',
      detail: 'A feeling as rich as "surprised" was reduced to a handful of ' +
        'key-value pairs. Three well-chosen numbers turned out to be exactly ' +
        'enough for a viewer to read the emotion correctly.',
      code: 'face_state = {\n    "eyebrow_angle": 10,\n    "eye_size": 18,\n' +
        '    "mouth_curvature": 4\n}'
    }
  },
  {
    id: 'decomposition',
    label: 'Decomposition',
    angle: -30,
    definition: 'Decomposition means breaking a complicated whole into ' +
      'smaller, independent pieces that are each easier to design and build.',
    role: 'It splits the problem up. Abstraction chooses the numbers; ' +
      'decomposition chooses the parts.',
    example: {
      id: 'ex-face-parts',
      label: 'Ch 9\neyes, brows, mouth',
      tag: 'Chapter 9',
      what: 'Splitting one face into three drawable parts.',
      detail: 'Because eyes, eyebrows, and a mouth were separate pieces, ' +
        'Chapter 11 could research each one as its own signaling question, ' +
        'and a broken eyebrow never forced you to touch the mouth code.',
      code: 'draw_eyebrows(fb, state["eyebrow_angle"])\n' +
        'draw_eyes(fb, state["eye_size"])\n' +
        'draw_mouth(fb, state["mouth_curvature"])'
    }
  },
  {
    id: 'modularity',
    label: 'Modularity',
    angle: 30,
    definition: 'Modularity means writing one reusable function instead of ' +
      'duplicating separate code for every situation it has to handle.',
    role: 'It turns the parts into one callable unit. Decomposition finds ' +
      'the pieces; modularity packages them.',
    example: {
      id: 'ex-draw-face',
      label: 'Ch 9\ndraw_face()',
      tag: 'Chapter 9',
      what: 'The single draw_face(fb, state) function.',
      detail: 'One function, called with a different state dictionary, draws ' +
        'a completely different expression every time. Without it, thirteen ' +
        'expressions would have needed thirteen near-identical functions.',
      code: 'def draw_face(fb, state):\n    draw_eyebrows(fb, state["eyebrow_angle"])\n' +
        '    draw_eyes(fb, state["eye_size"])\n' +
        '    draw_mouth(fb, state["mouth_curvature"])'
    }
  },
  {
    id: 'pattern-recognition',
    label: 'Pattern Recognition',
    angle: 90,
    definition: 'Pattern recognition means noticing that many ' +
      'different-looking problems actually share the same underlying ' +
      'structure.',
    role: 'It spots the sameness. Modularity gives you one function; pattern ' +
      'recognition tells you how far that one function reaches.',
    example: {
      id: 'ex-thirteen',
      label: 'Ch 10\n13 expressions',
      tag: 'Chapter 10',
      what: 'The thirteen core expressions.',
      detail: 'Happy, sad, angry, and surprised are not thirteen unrelated ' +
        'drawing problems. They are the same three parameters set to thirteen ' +
        'different combinations of values.',
      code: 'EXPRESSIONS = {\n    "happy":     {"eyebrow_angle": 6,  "mouth_curvature": 8},\n' +
        '    "sad":       {"eyebrow_angle": 4,  "mouth_curvature": -7},\n' +
        '    "surprised": {"eyebrow_angle": 11, "mouth_curvature": 4}\n}'
    }
  },
  {
    id: 'algorithm-design',
    label: 'Algorithm Design',
    angle: 150,
    definition: 'Algorithm design means planning a clear, ordered, ' +
      'step-by-step procedure for a problem before worrying about the exact ' +
      'code that implements it.',
    role: 'It handles what happens over time. The other skills shape one ' +
      'still frame; this one sequences many of them.',
    example: {
      id: 'ex-timing',
      label: 'Ch 12-14\ntiming & states',
      tag: 'Chapters 12-14',
      what: 'Blink timing, gaze animation, and button state machines.',
      detail: 'The blink routine is a numbered list of steps long before it ' +
        'is MicroPython: close the eyelids over a few frames, hold, then ' +
        'reopen, all timed with ticks_ms() instead of a blocking sleep().',
      code: 'if ticks_diff(ticks_ms(), last_blink) > 3000:\n' +
        '    start_blink()\n    last_blink = ticks_ms()'
    }
  },
  {
    id: 'code-reuse',
    label: 'Code Reuse',
    angle: -150,
    definition: 'Code reuse means building new work on top of code that ' +
      'already exists and already works, instead of starting from a blank file.',
    role: 'It is the payoff. The other five skills are what make code worth ' +
      'reusing in the first place.',
    example: {
      id: 'ex-capstone',
      label: 'Ch 16\nyour capstone',
      tag: 'Chapter 16',
      what: 'Your own capstone project.',
      detail: 'Your capstone does not need a new drawing engine. It reuses ' +
        'the exact draw_face() function and parameter system you have ' +
        'trusted since Chapter 9, which is what makes eight expressions ' +
        'possible in the time you actually have.',
      code: 'for name in my_expressions:\n    draw_face(fb, my_expressions[name])'
    }
  }
];

const SKILL_RADIUS = 130;
const EXAMPLE_RADIUS = 250;

const DEFAULT_PANEL_BODY =
  '<p>Click any node to learn what it connects to.</p>' +
  '<p>The coral hub in the middle is the whole idea. The six teal nodes are ' +
  'the thinking skills inside it, and each gray node names the earlier ' +
  'chapter where you already used that skill.</p>' +
  '<p>Drag a node to move it, and press Reset Layout to put everything back.</p>';

let network = null;
let nodes = null;
let edges = null;

// ---------------------------------------------------------------------
// Environment detection
// ---------------------------------------------------------------------

// True when the page is embedded in an iframe, which is the normal case for
// a textbook page. Mouse zoom and pan stay off there so the reader can still
// scroll the chapter; the navigation buttons do the same job safely.
function isInIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

// ---------------------------------------------------------------------
// Graph data
// ---------------------------------------------------------------------

// Place a node on a ring of the given radius at the given angle in degrees.
function ringPosition(angleDegrees, radius) {
  const radians = angleDegrees * Math.PI / 180;
  return {
    x: Math.round(Math.cos(radians) * radius),
    y: Math.round(Math.sin(radians) * radius)
  };
}

function buildNodes() {
  const list = [];

  list.push({
    id: HUB_ID,
    label: 'Computational\nThinking',
    x: 0,
    y: 0,
    kind: 'hub',
    title: 'The name for all six habits together',
    color: {
      background: HUB_COLOR.background,
      border: HUB_COLOR.border,
      highlight: { background: HUB_COLOR.highlight, border: '#212121' }
    },
    font: { color: 'white', size: 23, face: 'Arial', bold: { color: 'white' } },
    margin: 16
  });

  for (let i = 0; i < SKILLS.length; i++) {
    const skill = SKILLS[i];
    const skillPos = ringPosition(skill.angle, SKILL_RADIUS);
    const examplePos = ringPosition(skill.angle, EXAMPLE_RADIUS);

    list.push({
      id: skill.id,
      label: skill.label,
      x: skillPos.x,
      y: skillPos.y,
      kind: 'skill',
      title: skill.label + ': click for a plain-language definition',
      color: {
        background: SKILL_COLOR.background,
        border: SKILL_COLOR.border,
        highlight: { background: SKILL_COLOR.highlight, border: '#212121' }
      },
      font: { color: 'white', size: 19, face: 'Arial' }
    });

    list.push({
      id: skill.example.id,
      label: skill.example.label,
      x: examplePos.x,
      y: examplePos.y,
      kind: 'example',
      title: skill.example.tag + ': click to see which skill this demonstrates',
      color: {
        background: EXAMPLE_COLOR.background,
        border: EXAMPLE_COLOR.border,
        highlight: { background: EXAMPLE_COLOR.highlight, border: '#212121' }
      },
      font: { color: '#212121', size: 17, face: 'Arial' }
    });
  }

  return list;
}

// Two edges per skill: one in to the hub, one out to its example. No
// arrowheads, because this is a relationship map and not a flowchart.
function buildEdges() {
  const list = [];
  for (let i = 0; i < SKILLS.length; i++) {
    const skill = SKILLS[i];
    list.push({
      id: 'hub-' + skill.id,
      from: HUB_ID,
      to: skill.id,
      skillId: skill.id,
      color: { color: EDGE_COLOR }
    });
    list.push({
      id: skill.id + '-example',
      from: skill.id,
      to: skill.example.id,
      skillId: skill.id,
      color: { color: EDGE_COLOR }
    });
  }
  return list;
}

// Look-ups used by the click handlers.
function skillById(id) {
  return SKILLS.find(function (s) { return s.id === id; });
}

function skillByExampleId(id) {
  return SKILLS.find(function (s) { return s.example.id === id; });
}

// ---------------------------------------------------------------------
// Side panel
// ---------------------------------------------------------------------

// Escape any characters that would otherwise be read as HTML markup.
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function setPanel(title, bodyHtml, accentColor) {
  const titleEl = document.getElementById('panel-title');
  const bodyEl = document.getElementById('panel-body');
  titleEl.textContent = title;
  titleEl.style.borderLeftColor = accentColor;
  bodyEl.innerHTML = bodyHtml;
}

function clearPanel() {
  setPanel('Explore the map', DEFAULT_PANEL_BODY, '#B0BEC5');
}

function showHubDetail() {
  setPanel(
    'Computational Thinking',
    '<p>Computational thinking is the general name for the problem-solving ' +
    'habits that let a person break a complicated real-world problem into ' +
    'pieces a computer can actually solve.</p>' +
    '<p>It is not a new topic. It is a label for six habits you have been ' +
    'practicing since your very first <code>draw_face()</code> call.</p>' +
    '<p>Click any teal skill to see what makes it different from the other ' +
    'five.</p>',
    HUB_COLOR.background
  );
}

function showSkillDetail(skillId) {
  const skill = skillById(skillId);
  if (!skill) { return; }

  setPanel(
    skill.label,
    '<p><span class="panel-label">What it means</span><br>' +
      skill.definition + '</p>' +
      '<p><span class="panel-label">Its own job</span><br>' + skill.role + '</p>' +
      '<p><span class="panel-label">Where you used it</span><br>' +
      skill.example.tag + ' - ' + skill.example.what + '</p>',
    SKILL_COLOR.background
  );
}

function showExampleDetail(exampleId) {
  const skill = skillByExampleId(exampleId);
  if (!skill) { return; }

  setPanel(
    skill.example.tag,
    '<p><span class="panel-label">What this is</span><br>' +
      skill.example.what + '</p>' +
      '<p>' + skill.example.detail + '</p>' +
      '<p><span class="panel-label">In code</span></p>' +
      '<pre>' + escapeHtml(skill.example.code) + '</pre>' +
      '<p><span class="panel-label">The skill it demonstrates</span><br>' +
      skill.label + '</p>',
    EXAMPLE_COLOR.border
  );
}

// ---------------------------------------------------------------------
// Highlighting. Only one skill's connections are lit at a time, so the
// path from an idea to the code that proves it stays easy to trace.
// ---------------------------------------------------------------------

// Put every node and edge back to its normal color.
function clearHighlight() {
  const nodeUpdates = nodes.get().map(function (node) {
    return { id: node.id, color: normalNodeColor(node.kind),
      font: normalFont(node.kind) };
  });
  nodes.update(nodeUpdates);

  const edgeUpdates = edges.get().map(function (edge) {
    return { id: edge.id, color: { color: EDGE_COLOR }, width: 2 };
  });
  edges.update(edgeUpdates);
}

function normalNodeColor(kind) {
  const base = kind === 'hub' ? HUB_COLOR
    : (kind === 'skill' ? SKILL_COLOR : EXAMPLE_COLOR);
  return {
    background: base.background,
    border: base.border,
    highlight: { background: base.highlight, border: '#212121' }
  };
}

function normalFont(kind) {
  if (kind === 'hub') return { color: 'white', size: 23 };
  if (kind === 'skill') return { color: 'white', size: 19 };
  return { color: '#212121', size: 17 };
}

function dimFont(kind) {
  const size = kind === 'hub' ? 23 : (kind === 'skill' ? 19 : 17);
  return { color: DIM_FONT, size: size };
}

// Light the hub, the chosen skill, and its example; fade everything else.
function highlightSkill(skillId) {
  const skill = skillById(skillId);
  if (!skill) { return; }

  const lit = [HUB_ID, skill.id, skill.example.id];

  const nodeUpdates = nodes.get().map(function (node) {
    const isLit = lit.indexOf(node.id) >= 0;
    return {
      id: node.id,
      color: isLit ? normalNodeColor(node.kind)
        : { background: DIM_NODE.background, border: DIM_NODE.border,
            highlight: { background: DIM_NODE.background, border: DIM_NODE.border } },
      font: isLit ? normalFont(node.kind) : dimFont(node.kind)
    };
  });
  nodes.update(nodeUpdates);

  const edgeUpdates = edges.get().map(function (edge) {
    const isLit = edge.skillId === skillId;
    return {
      id: edge.id,
      color: { color: isLit ? EDGE_HIGHLIGHT : EDGE_DIM },
      width: isLit ? 4 : 1
    };
  });
  edges.update(edgeUpdates);
}

// ---------------------------------------------------------------------
// Network setup
// ---------------------------------------------------------------------

// Fit the whole map, then shrink and pan it left so the right-hand infobox
// never covers a node. Stabilization finishes inside the vis.Network
// constructor, so the first afterDrawing event is the earliest safe moment.
function fitIntoLeftArea() {
  const container = document.getElementById('network');
  const fullWidth = container.offsetWidth || 800;
  const fullHeight = container.offsetHeight || 540;
  // Below the CSS breakpoint the infobox sits under the map, so it costs
  // height instead of width. Above it, it costs width instead.
  const stacked = fullWidth <= NARROW_WIDTH;
  const panelWidth = stacked ? 0 : 285;
  const panelHeight = stacked ? 148 : 0;

  // Measure the settled graph in its own coordinates, padded for node size.
  const positions = network.getPositions();
  const ids = Object.keys(positions);
  if (ids.length === 0) { return; }
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < ids.length; i++) {
    const p = positions[ids[i]];
    minX = Math.min(minX, p.x);
    maxX = Math.max(maxX, p.x);
    minY = Math.min(minY, p.y);
    maxY = Math.max(maxY, p.y);
  }
  const graphWidth = (maxX - minX) + 215;    // allow for the widest node boxes
  const graphHeight = (maxY - minY) + 130;
  const titleBand = 52;                      // height of the title overlay

  // Room left of the panel (or above it), and below the title bar.
  const usableWidth = Math.max(180, fullWidth - panelWidth - 24);
  const usableHeight = Math.max(150, fullHeight - titleBand - panelHeight);

  const scale = Math.min(usableWidth / graphWidth, usableHeight / graphHeight, 1.1);

  network.moveTo({
    scale: scale,
    // Moving the camera right makes the diagram sit left of the panel;
    // moving it down makes the diagram sit above a stacked panel.
    position: {
      x: (minX + maxX) / 2 + (panelWidth / 2) / scale,
      y: (minY + maxY) / 2 - (titleBand / 2) / scale + (panelHeight / 2) / scale
    },
    animation: false
  });
}

function fitAfterStabilization() {
  network.once('afterDrawing', fitIntoLeftArea);
}

function initializeNetwork() {
  // Mouse pan and zoom are enabled only when the page is opened on its own,
  // never inside the chapter iframe where they would capture page scrolling.
  // The navigation buttons give the same control without that side effect.
  const enableMouseInteraction = !isInIframe();

  // On a phone-width screen the stacked infobox sits where the navigation
  // buttons would be, and the whole map already fits, so they are dropped.
  const container0 = document.getElementById('network');
  const showNavButtons = (container0.offsetWidth || 800) > NARROW_WIDTH;

  nodes = new vis.DataSet(buildNodes());
  edges = new vis.DataSet(buildEdges());

  const options = {
    layout: { improvedLayout: false, randomSeed: 7 },
    // A gentle force-directed layout. Physics stays on after the first
    // settle, so dragging one node nudges its neighbors instead of tearing
    // the map apart.
    physics: {
      enabled: true,
      solver: 'barnesHut',
      barnesHut: {
        gravitationalConstant: -1600,
        centralGravity: 0.55,
        springLength: 100,
        springConstant: 0.05,
        damping: 0.6,
        avoidOverlap: 0.35
      },
      stabilization: { enabled: true, iterations: 400, fit: false },
      minVelocity: 0.6
    },
    interaction: {
      hover: true,
      selectConnectedEdges: false,
      dragNodes: true,
      dragView: enableMouseInteraction,
      zoomView: enableMouseInteraction,
      navigationButtons: showNavButtons,
      keyboard: { enabled: false }
    },
    nodes: {
      shape: 'box',
      shapeProperties: { borderRadius: 10 },
      margin: 11,
      widthConstraint: { maximum: 170 },
      borderWidth: 3,
      borderWidthSelected: 5,
      shadow: { enabled: true, color: 'rgba(0,0,0,0.2)', size: 5, x: 2, y: 2 }
    },
    edges: {
      arrows: { to: { enabled: false } },   // a relationship map, not a flowchart
      width: 2,
      selectionWidth: 0,
      smooth: { type: 'continuous', roundness: 0.2 }
    }
  };

  const container = document.getElementById('network');
  network = new vis.Network(container, { nodes: nodes, edges: edges }, options);

  // One click handler covers all four cases: the hub, a skill, an example,
  // or the background, which clears the highlight and the panel.
  network.on('click', function (params) {
    if (params.nodes.length > 0) {
      const clicked = params.nodes[0];
      if (clicked === HUB_ID) {
        clearHighlight();
        showHubDetail();
      } else if (skillById(clicked)) {
        highlightSkill(clicked);
        showSkillDetail(clicked);
      } else {
        const owner = skillByExampleId(clicked);
        if (owner) {
          highlightSkill(owner.id);
          showExampleDetail(clicked);
        }
      }
    } else {
      network.unselectAll();
      clearHighlight();
      clearPanel();
    }
  });

  fitAfterStabilization();
}

// Put every node back on its starting ring and let physics settle again.
function resetLayout() {
  network.unselectAll();
  nodes.update(buildNodes());
  edges.update(buildEdges());
  clearHighlight();
  clearPanel();
  fitAfterStabilization();
  network.stabilize(400);
}

document.addEventListener('DOMContentLoaded', function () {
  clearPanel();
  initializeNetwork();
  document.getElementById('reset-btn').addEventListener('click', resetLayout);

  // A resized container changes how much room the infobox takes, so refit and
  // re-decide whether the navigation buttons still have a clear corner to sit in.
  window.addEventListener('resize', function () {
    if (!network) { return; }
    const wide = (document.getElementById('network').offsetWidth || 800) > NARROW_WIDTH;
    network.setOptions({ interaction: { navigationButtons: wide } });
    fitIntoLeftArea();
  });
});
