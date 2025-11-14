const CONFIG = { questionCount: 10 };

// State
const state = {
  level: 'A',
  total: 0,
  correct: 0,
  startedAt: null,
  currentTask: null,
  selected: null,
};

// DOM
const el = {
  level: document.getElementById('level'),
  startBtn: document.getElementById('startBtn'),
  resetBtn: document.getElementById('resetBtn'),

  welcomePane: document.getElementById('welcomePane'),
  board: document.getElementById('board'),
  numberLine: document.getElementById('numberLine'),
  taskHeader: document.getElementById('taskHeader'),
  hint: document.getElementById('hint'),

  checkBtn: document.getElementById('checkBtn'),
  nextBtn: document.getElementById('nextBtn'),

  feedback: document.getElementById('feedback'),

  scoreLink: document.getElementById('scoreLink'),

  backToWelcomeBtn: document.getElementById('backToWelcomeBtn'),
};

//Helpers
const randInt = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

function setFeedback(text, ok = null) {
  el.feedback.textContent = text || '';
  el.feedback.classList.remove('text-success', 'text-danger');
  if (ok === true) el.feedback.classList.add('text-success');
  if (ok === false) el.feedback.classList.add('text-danger');
}
function clearFeedback() { setFeedback(''); }

function hideEndButtons() {
  if (el.scoreLink) el.scoreLink.classList.add('d-none');
  if (el.backToWelcomeBtn) el.backToWelcomeBtn.classList.add('d-none');
}

function ensureBackButton() {
  if (el.backToWelcomeBtn && el.backToWelcomeBtn instanceof HTMLElement) return el.backToWelcomeBtn;

  // Button
  const btn = document.createElement('button');
  btn.id = 'backToWelcomeBtn';
  btn.type = 'button';
  btn.className = 'btn btn-outline-secondary ms-2';
  btn.textContent = 'Palaa ohjeisiin';
  btn.addEventListener('click', showWelcome);

  if (el.scoreLink && el.scoreLink.parentElement) {
    el.scoreLink.parentElement.appendChild(btn);
  } else {
    const container = document.querySelector('.game-card') || document.body;
    const wrap = document.createElement('div');
    wrap.className = 'text-center mt-3';
    wrap.appendChild(btn);
    container.appendChild(wrap);
  }

  el.backToWelcomeBtn = btn;
  return btn;
}

//Number line rendering
function buildNumberLine() {
  el.numberLine.innerHTML = '';
  for (let n = 0; n <= 20; n++) {
    const cell = document.createElement('button');
    cell.type = 'button';
    cell.className = 'cell';
    cell.dataset.n = String(n);
    cell.textContent = String(n);
    el.numberLine.appendChild(cell);
  }
}

function markCell(n, cls) {
  const btn = el.numberLine.querySelector(`.cell[data-n="${n}"]`);
  if (!btn) return;
  btn.classList.add(cls);
}
function unmarkAll(cls) {
  el.numberLine.querySelectorAll(`.${cls}`).forEach(c => c.classList.remove(cls));
}

function placeMarker(n, type) {
  const btn = el.numberLine.querySelector(`.cell[data-n="${n}"]`);
  if (!btn) return;
  const mark = document.createElement('span');
  mark.className = `marker ${type}`;
  btn.appendChild(mark);
}
function clearMarkers() {
  el.numberLine.querySelectorAll('.marker').forEach(m => m.remove());
}

//Task generation
function genTask() {
  const L = state.level;

  if (L === 'A') {
    // a - b = ?, 0..20; b 1..10; a>=b
    const b = randInt(1, 10);
    const a = randInt(b, 20);
    const res = a - b;
    return { kind: 'A', a, b, res, header: `${a} − ${b} = ?`, startAt: a, endAt: res };
  }

  if (L === 'B') {
    // ? - b = c, 0..20; b 1..10; c 0..20; start = c + b <= 20
    const b = randInt(1, 10);
    const c = randInt(0, 20 - b);
    const start = c + b;
    return { kind: 'B', b, c, res: start, header: `? − ${b} = ${c}`, startAt: c, backwards: b };
  }

  // C: a - b - c = ?, 0..20; a >= b + c
  const b = randInt(1, 10);
  const c = randInt(1, 10);
  const a = randInt(b + c, 20);
  const res = a - b - c;
  return { kind: 'C', a, b, c, res, header: `${a} − ${b} − ${c} = ?`, startAt: a, endAt: res };
}

//Rendering a task
function renderTask() {
  state.currentTask = genTask();
  state.selected = null;
  clearFeedback();
  el.hint.textContent = '';
  el.nextBtn.classList.add('d-none');
  el.checkBtn.disabled = false;

  hideEndButtons();

  // Header
  el.taskHeader.textContent = state.currentTask.header;

  // Reset number line
  buildNumberLine();
  clearMarkers();
  unmarkAll('step');
  unmarkAll('active');

  // Place start marker
  const t = state.currentTask;
  if (t.kind === 'A') {
    placeMarker(t.startAt, 'start');
  } else if (t.kind === 'B') {
    placeMarker(t.startAt, 'start');
  } else if (t.kind === 'C') {
    placeMarker(t.startAt, 'start');
  }
}

//Flow
function showWelcome() {
  el.welcomePane.classList.remove('d-none');
  el.board.classList.add('d-none');
  el.taskHeader.classList.add('d-none');
  clearFeedback();
  hideEndButtons();

  if (el.backToWelcomeBtn) {
    el.backToWelcomeBtn.classList.add('d-none');
    el.backToWelcomeBtn.removeEventListener('click', showWelcome);
    el.backToWelcomeBtn.addEventListener('click', showWelcome);
  }
}

function startGame() {
  state.level = el.level?.value || state.level;
  state.total = 0;
  state.correct = 0;
  state.startedAt = Date.now();

  el.welcomePane.classList.add('d-none');
  el.board.classList.remove('d-none');
  el.taskHeader.classList.remove('d-none');

  hideEndButtons();
  renderTask();
}

function applyAnswer(ok) {
  state.total += 1;
  if (ok) state.correct += 1;

  setFeedback(ok ? 'Hienoa! ✔' : 'Väärin ✖', ok);
  el.checkBtn.disabled = true;
  el.nextBtn.classList.remove('d-none');

  hideEndButtons();
  el.nextBtn.textContent = (state.total >= CONFIG.questionCount) ? 'Lopeta' : 'Seuraava';
}

function nextStep() {
  if (state.total >= CONFIG.questionCount) {
  const elapsedMs = Date.now() - (state.startedAt || Date.now());
  const payload = {
    correct: state.correct,
    total: state.total,
    elapsedMs,
    elapsedSec: Math.round(elapsedMs / 1000),
    level: state.level,
    game: 'Vähennyslasku',
    whenISO: new Date().toISOString(),
  };

  const levelKey = `sub_${state.level}_last`;
  localStorage.setItem(levelKey, JSON.stringify(payload));

  localStorage.setItem('sub_last', JSON.stringify(payload));

  setFeedback(`Valmis! Oikein: ${state.correct}/${state.total}. Aika: ${payload.elapsedSec}s`, true);

  if (el.scoreLink) el.scoreLink.classList.remove('d-none');
  const backBtn = ensureBackButton();
  backBtn.classList.remove('d-none');

  el.nextBtn.classList.add('d-none');
  el.checkBtn.disabled = true;
  return;
}

  renderTask();
}

function resetGame() {
  state.total = 0;
  state.correct = 0;
  state.startedAt = null;
  showWelcome();
}

// Answer selection on line
function handleCellClick(target) {
  if (!target?.classList.contains('cell')) return;
  unmarkAll('active');
  target.classList.add('active');
  state.selected = Number(target.dataset.n);
  clearFeedback();
}

// Check logic
function checkAnswer() {
  const t = state.currentTask;
  if (!t) return;
  if (typeof state.selected !== 'number') {
    setFeedback('Valitse vastaus lukusuoralta.', false);
    return;
  }

  let correctNumber = t.res;
  if (t.kind === 'B') correctNumber = t.res;

  const ok = state.selected === correctNumber;
  unmarkAll('correct');
  unmarkAll('incorrect');

  const correctCell = el.numberLine.querySelector(`.cell[data-n="${correctNumber}"]`);
  const selectedCell = el.numberLine.querySelector(`.cell[data-n="${state.selected}"]`);

if (correctCell) correctCell.classList.add('correct');
if (!ok && selectedCell) selectedCell.classList.add('incorrect');

  // visualize path/finish
  clearMarkers();
  if (t.kind === 'A') {
  const start = t.startAt, end = t.endAt;
  placeMarker(start, 'start');
  for (let n = end; n <= start; n++) markCell(n, 'step');
  el.hint.textContent = `${t.a} − ${t.b} = ${end}`;
} else if (t.kind === 'B') {
  const start = t.startAt, end = t.res;
  placeMarker(start, 'start');
  for (let n = start; n <= end; n++) markCell(n, 'step');
  el.hint.textContent = `Koska ? − ${t.b} = ${t.c}, aloitusluku on ${t.c} + ${t.b} = ${end}`;
} else if (t.kind === 'C') {
  const start = t.startAt, end = t.endAt;
  placeMarker(start, 'start');
  for (let n = end; n <= start; n++) markCell(n, 'step');
  el.hint.textContent = `${t.a} − ${t.b} − ${t.c} = ${end}`;
}

  applyAnswer(ok);
}

// Events
document.addEventListener('click', (e) => {
  if (e.target.closest('.cell')) handleCellClick(e.target.closest('.cell'));
});
el.startBtn?.addEventListener('click', startGame);
el.resetBtn?.addEventListener('click', resetGame);
el.checkBtn?.addEventListener('click', checkAnswer);
el.nextBtn?.addEventListener('click', nextStep);

// first paint
document.addEventListener('DOMContentLoaded', showWelcome);
