// List vs Tuple vs Dictionary Comparison
// An interactive HTML/CSS/JS infographic for the Robot Faces intelligent textbook.
// Bloom level: Analyze (L4) - differentiate, distinguish
//
// CANVAS_HEIGHT: 570
//
// The three columns let a learner compare mutability, syntax, and access method.
// The scenario panel then asks them to apply that comparison to new cases, which
// is what an Analyze-level objective requires.

/* ------------------------------------------------------------------ */
/* 1. Scenarios. Each explanation names the rule that decided it:      */
/*    either mutability or access method.                              */
/* ------------------------------------------------------------------ */

const scenarios = [
  {
    prompt: 'You need to store a fixed background color that must never change while the program runs.',
    answer: 'tuple',
    why: 'A tuple is not changeable, so the color is protected from being edited later by accident.'
  },
  {
    prompt: 'You want to cycle through expression names in order, and add new expressions as you invent them.',
    answer: 'list',
    why: 'A list is changeable and keeps its order, so you can add expressions and still step through them by position.'
  },
  {
    prompt: 'You need to look up the eyebrow angle for one expression by its name, without counting positions.',
    answer: 'dict',
    why: 'A dictionary is accessed by key name, so you ask for "eyebrow_angle" directly instead of remembering its position.'
  },
  {
    prompt: 'You need to store your display\'s width and height, 128 and 64, which the hardware fixes permanently.',
    answer: 'tuple',
    why: 'A tuple is not changeable, which matches a pair of numbers set by the hardware and never edited in code.'
  },
  {
    prompt: 'You are building a blink animation and want to keep its frames in order, adding frames as you refine it.',
    answer: 'list',
    why: 'A list is changeable and ordered, so frames stay in sequence while you keep adding to them.'
  },
  {
    prompt: 'You need to store eye size, eyebrow angle, and mouth curve together as one named group of settings.',
    answer: 'dict',
    why: 'A dictionary is accessed by key name, which keeps a group of named settings readable instead of positional.'
  }
];

const typeLabels = { list: 'List', tuple: 'Tuple', dict: 'Dictionary' };

let scenarioIndex = 0;
let answered = false;

/* ------------------------------------------------------------------ */
/* 2. Column expand-on-click.                                          */
/* ------------------------------------------------------------------ */

function wireColumnHeaders() {
  const headers = document.querySelectorAll('.col-header');
  for (let i = 0; i < headers.length; i++) {
    headers[i].addEventListener('click', function () {
      this.parentNode.classList.toggle('open');
    });
  }
}

/* ------------------------------------------------------------------ */
/* 3. Scenario panel.                                                  */
/* ------------------------------------------------------------------ */

function clearColumnFeedback() {
  const cols = document.querySelectorAll('.col');
  for (let i = 0; i < cols.length; i++) {
    cols[i].classList.remove('correct', 'wrong');
  }
}

function setAnswerButtonsEnabled(enabled) {
  const buttons = document.querySelectorAll('#answers button[data-answer]');
  for (let i = 0; i < buttons.length; i++) {
    buttons[i].disabled = !enabled;
  }
}

function showScenario() {
  const current = scenarios[scenarioIndex];
  document.getElementById('scenario-text').textContent = current.prompt;

  const feedback = document.getElementById('feedback');
  feedback.className = '';
  feedback.textContent = 'Pick the collection type that fits this data best.';

  clearColumnFeedback();
  setAnswerButtonsEnabled(true);
  answered = false;
}

function checkAnswer(choice) {
  if (answered) { return; }
  answered = true;

  const current = scenarios[scenarioIndex];
  const isCorrect = (choice === current.answer);
  const chosenColumn = document.querySelector('.col[data-type="' + choice + '"]');
  const feedback = document.getElementById('feedback');

  clearColumnFeedback();

  if (isCorrect) {
    chosenColumn.classList.add('correct');
    feedback.className = 'correct';
    feedback.textContent = 'Correct. ' + current.why;
  } else {
    chosenColumn.classList.add('wrong');
    // Also outline the right answer so the contrast is visible side by side.
    document.querySelector('.col[data-type="' + current.answer + '"]').classList.add('correct');
    feedback.className = 'wrong';
    feedback.textContent = 'Not quite. The better fit is ' + typeLabels[current.answer] +
      '. ' + current.why;
  }

  setAnswerButtonsEnabled(false);
}

function nextScenario() {
  scenarioIndex = (scenarioIndex + 1) % scenarios.length;
  showScenario();
}

/* ------------------------------------------------------------------ */
/* 4. Start up once the page structure exists.                         */
/* ------------------------------------------------------------------ */

function initInfographic() {
  wireColumnHeaders();

  const answerButtons = document.querySelectorAll('#answers button[data-answer]');
  for (let i = 0; i < answerButtons.length; i++) {
    answerButtons[i].addEventListener('click', function () {
      checkAnswer(this.getAttribute('data-answer'));
    });
  }

  document.getElementById('next').addEventListener('click', nextScenario);

  showScenario();
}

window.addEventListener('DOMContentLoaded', initInfographic);
