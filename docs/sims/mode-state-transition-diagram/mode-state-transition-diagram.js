// Mode State Transition Diagram
// An interactive vis-network MicroSim for the Robot Faces intelligent textbook.
// Chapter 13: Interactive Controls - Inputs & Concurrency
// Bloom level: Understand (L2) - explain, interpret
//
// CANVAS_HEIGHT: 480
//
// Three modes, one button, one variable. Clicking a mode or an arrow opens a
// side panel with the constant value, what the face does, and the exact line
// of MicroPython that sets current_mode.

// ---------------------------------------------------------------------
// Colors. Teal and coral come from the book's mascot identity; the third
// mode uses a neutral gray-blue so no two modes look alike.
// ---------------------------------------------------------------------
const MODE_COLORS = {
  NEUTRAL_MODE: { background: '#00897B', border: '#00695C', highlight: '#26A69A' },
  GAZE_MODE: { background: '#FF7043', border: '#D84315', highlight: '#FF8A65' },
  ADJUST_MODE: { background: '#78909C', border: '#455A64', highlight: '#90A4AE' }
};

const EDGE_COLOR = '#37474F';
const EDGE_HIGHLIGHT = '#1565C0';

// ---------------------------------------------------------------------
// The three modes. Positions sit on a circle so the cycle is visible at a
// glance, and they are shifted left to leave room for the side panel.
// ---------------------------------------------------------------------
const modeData = [
  {
    id: 'NEUTRAL_MODE',
    label: 'NEUTRAL_MODE\n(0)',
    x: -120, y: -130,
    value: 0,
    behavior: 'The face sits calm and still. Nothing tracks a target, and the ' +
      'potentiometer is ignored.',
    code: 'NEUTRAL_MODE = 0\n\ncurrent_mode = NEUTRAL_MODE'
  },
  {
    id: 'GAZE_MODE',
    label: 'GAZE_MODE\n(1)',
    x: 18, y: 65,
    value: 1,
    behavior: 'The pupils track a simulated target, so the eyes sweep back and ' +
      'forth across the display.',
    code: 'GAZE_MODE = 1\n\ncurrent_mode = GAZE_MODE'
  },
  {
    id: 'ADJUST_MODE',
    label: 'ADJUST_MODE\n(2)',
    x: -258, y: 65,
    value: 2,
    behavior: 'The potentiometer drives eyebrow_angle live, so turning the knob ' +
      'reshapes the eyebrows as you watch.',
    code: 'ADJUST_MODE = 2\n\ncurrent_mode = ADJUST_MODE'
  }
];

// ---------------------------------------------------------------------
// The three transitions. Every one of them is the same trigger, which is
// exactly what makes this cycle easy to remember.
// ---------------------------------------------------------------------
const TRIGGER_TEXT = 'A single short button press, detected on the ' +
  'HIGH-to-LOW edge as the button pin falls from 1 to 0.';

const transitionData = [
  {
    id: 'to-gaze',
    from: 'NEUTRAL_MODE',
    to: 'GAZE_MODE',
    result: 'current_mode becomes 1.',
    code: 'if current_mode == NEUTRAL_MODE:\n    current_mode = GAZE_MODE'
  },
  {
    id: 'to-adjust',
    from: 'GAZE_MODE',
    to: 'ADJUST_MODE',
    result: 'current_mode becomes 2.',
    code: 'elif current_mode == GAZE_MODE:\n    current_mode = ADJUST_MODE'
  },
  {
    id: 'to-neutral',
    from: 'ADJUST_MODE',
    to: 'NEUTRAL_MODE',
    result: 'current_mode wraps back around to 0.',
    code: 'else:\n    current_mode = NEUTRAL_MODE'
  }
];

const DEFAULT_PANEL_BODY =
  '<p>Every arrow here is the same single button press. The press moves ' +
  '<code>current_mode</code> forward one step, and the cycle wraps around ' +
  'at the end.</p>' +
  '<p>Click a mode box to see its constant value and what the face does. ' +
  'Click an arrow to see the line of code that performs the change.</p>';

let network = null;
let nodes = null;
let edges = null;

// ---------------------------------------------------------------------
// Environment detection
// ---------------------------------------------------------------------

// True when the page is embedded in an iframe, which is the normal case for
// a textbook page. Mouse zoom and pan stay off there so the reader can still
// scroll the chapter.
function isInIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
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
  setPanel('Explore the state machine', DEFAULT_PANEL_BODY, '#B0BEC5');
}

function showModeDetail(modeId) {
  const mode = modeData.find(function (m) { return m.id === modeId; });
  if (!mode) { return; }

  setPanel(
    mode.id + ' (' + mode.value + ')',
    '<p><span class="panel-label">What the face does</span><br>' +
      mode.behavior + '</p>' +
      '<p><span class="panel-label">In code</span></p>' +
      '<pre>' + escapeHtml(mode.code) + '</pre>' +
      '<p>While <code>current_mode</code> holds ' + mode.value +
      ', only this mode is active. One variable can store just one mode ' +
      'at a time.</p>',
    MODE_COLORS[mode.id].background
  );
}

function showTransitionDetail(edgeId) {
  const transition = transitionData.find(function (t) { return t.id === edgeId; });
  if (!transition) { return; }

  setPanel(
    transition.from + ' to ' + transition.to,
    '<p><span class="panel-label">Trigger</span><br>' + TRIGGER_TEXT + '</p>' +
      '<p><span class="panel-label">Result</span><br>' + transition.result + '</p>' +
      '<p><span class="panel-label">In code</span></p>' +
      '<pre>' + escapeHtml(transition.code) + '</pre>',
    EDGE_HIGHLIGHT
  );
}

// ---------------------------------------------------------------------
// Network setup
// ---------------------------------------------------------------------
function buildNodes() {
  return modeData.map(function (mode) {
    const c = MODE_COLORS[mode.id];
    return {
      id: mode.id,
      label: mode.label,
      x: mode.x,
      y: mode.y,
      // The plain-text tooltip names the node before the learner clicks it.
      title: mode.id + ' stores the value ' + mode.value,
      color: {
        background: c.background,
        border: c.border,
        highlight: { background: c.highlight, border: '#212121' }
      },
      font: { color: 'white', size: 15, face: 'Arial', multi: false }
    };
  });
}

function buildEdges() {
  return transitionData.map(function (transition) {
    return {
      id: transition.id,
      from: transition.from,
      to: transition.to,
      label: 'button press',
      title: 'Button press: ' + transition.from + ' to ' + transition.to,
      color: { color: EDGE_COLOR, highlight: EDGE_HIGHLIGHT }
    };
  });
}

// vis-network centers the graph itself after the first render, so the pan
// that clears the right-hand panel has to wait for that to finish.
function setupViewPosition() {
  network.once('afterDrawing', function () {
    const pos = network.getViewPosition();
    network.moveTo({
      position: { x: pos.x + 70, y: pos.y },
      animation: false
    });
  });
}

function initializeNetwork() {
  // Mouse pan and zoom are enabled only when the page is opened on its own,
  // never inside the chapter iframe where they would capture page scrolling.
  const enableMouseInteraction = !isInIframe();

  nodes = new vis.DataSet(buildNodes());
  edges = new vis.DataSet(buildEdges());

  const options = {
    layout: { improvedLayout: false },
    physics: { enabled: false },   // fixed positions keep the cycle readable
    interaction: {
      hover: true,
      selectConnectedEdges: false,
      dragNodes: true,             // learners may rearrange the three modes
      dragView: enableMouseInteraction,
      zoomView: enableMouseInteraction,
      navigationButtons: true,
      keyboard: { enabled: false }
    },
    nodes: {
      shape: 'box',
      shapeProperties: { borderRadius: 10 },
      margin: 12,
      widthConstraint: { minimum: 130 },
      borderWidth: 3,
      borderWidthSelected: 6,
      shadow: { enabled: true, color: 'rgba(0,0,0,0.2)', size: 5, x: 2, y: 2 }
    },
    edges: {
      arrows: { to: { enabled: true, scaleFactor: 1.2 } },
      width: 2,
      selectionWidth: 3,
      font: { size: 13, align: 'horizontal', background: 'aliceblue' },
      smooth: { type: 'curvedCW', roundness: 0.22 }
    }
  };

  const container = document.getElementById('network');
  network = new vis.Network(container, { nodes: nodes, edges: edges }, options);

  // One click handler covers all three cases: a mode, an arrow, or the
  // background, which clears the selection and the panel.
  network.on('click', function (params) {
    if (params.nodes.length > 0) {
      showModeDetail(params.nodes[0]);
    } else if (params.edges.length > 0) {
      network.selectEdges([params.edges[0]]);
      showTransitionDetail(params.edges[0]);
    } else {
      network.unselectAll();
      clearPanel();
    }
  });

  setupViewPosition();
}

document.addEventListener('DOMContentLoaded', function () {
  clearPanel();
  initializeNetwork();
});
