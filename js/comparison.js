const CONFIG = { questionCount: 10 };

const state = {
  mode: 'sign',
  level: 'A',
  total: 0,
  correct: 0,
  startedAt: null,
  currentTask: null,
};

// DOM
const el = {
  mode: document.getElementById('mode'),
  level: document.getElementById('level'),
  startBtn: document.getElementById('startBtn'),
  resetBtn: document.getElementById('resetBtn'),
  feedback: document.getElementById('feedback'),
  welcomePane: document.getElementById('welcomePane'),
  boardSign: document.getElementById('board-sign'),
  boardMore: document.getElementById('board-more'),
  boardOrder: document.getElementById('board-order'),
  leftExpr: document.getElementById('leftExpr'),
  rightExpr: document.getElementById('rightExpr'),
  moreLeft: document.getElementById('moreLeft'),
  moreRight: document.getElementById('moreRight'),
  orderPool: document.getElementById('orderPool'),
  orderTarget: document.getElementById('orderTarget'),
  checkOrderBtn: document.getElementById('checkOrderBtn'),
  showScoresBtn: document.getElementById('showScoresBtn') || document.querySelector('.to-scores'),
};

// Utils
const randInt  = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const choice   = (arr) => arr[Math.floor(Math.random() * arr.length)];
const isMobile = () => window.matchMedia('(max-width: 576px)').matches;

function setFeedback(text, ok = null) {
  el.feedback.textContent = text || '';
  el.feedback.classList.remove('text-success', 'text-danger');
  if (ok === true) el.feedback.classList.add('text-success');
  if (ok === false) el.feedback.classList.add('text-danger');
}

function setBoardInputsDisabled(disabled) {
  document.querySelectorAll('.symbol-btn,[data-more],[draggable],#checkOrderBtn')
    .forEach(btn => { if (btn) btn.disabled = disabled; });
}
function setSelectsDisabled(disabled) {
  if (el.mode)  el.mode.disabled  = disabled;
  if (el.level) el.level.disabled = disabled;
}

function fitTextToBox(node, { min = 22, step = 0.9 } = {}) {
  if (!node) return;
  const box = node.parentElement;
  if (!box) return;

  let size = parseFloat(getComputedStyle(node).fontSize || '48');
  node.style.fontSize = size + 'px';

  let guard = 0;
  while ((node.scrollWidth > box.clientWidth || node.scrollHeight > box.clientHeight) &&
         size > min && guard < 30) {
    size = Math.max(min, Math.floor(size * step));
    node.style.fontSize = size + 'px';
    guard++;
  }
}

// Add zero-width break after +/− for soft wrap (mobile)
function softWrapExpr(expr) {
  return expr.replace(/([+\-])/g, '$1\u200B');
}

function toggleWrapForLevel() {
  const allowWrap = state.level === 'C' && isMobile();
  [el.leftExpr, el.rightExpr].forEach(n => {
    if (!n) return;
    n.classList.toggle('wrap-expr', allowWrap);
  });
}

// Welcome / Boards
function showWelcome() {
  el.boardSign.classList.add('d-none');
  el.boardMore.classList.add('d-none');
  el.boardOrder.classList.add('d-none');
  el.welcomePane.classList.remove('d-none');
  setFeedback('');
  setBoardInputsDisabled(true);
  setSelectsDisabled(false);
}

function renderBoard() {
  el.boardSign.classList.add('d-none');
  el.boardMore.classList.add('d-none');
  el.boardOrder.classList.add('d-none');
  if (state.mode === 'sign') el.boardSign.classList.remove('d-none');
  else if (state.mode === 'more') el.boardMore.classList.remove('d-none');
  else if (state.mode === 'order') el.boardOrder.classList.remove('d-none');
}

// Task generation
function levelPicker() {
  const A = () => ({ v: randInt(0, 20),  r: n => String(n) });
  const B = () => ({ v: randInt(0, 100), r: n => String(n) });
  const C = () => {
    const a = randInt(0, 50), b = randInt(0, 50);
    const op = choice(['+','-']);
    const expr = op === '+'
      ? `${a} + ${b}`
      : `${Math.max(a,b)} - ${Math.min(a,b)}`;
    const val = op === '+' ? a + b : Math.abs(a - b);
    return { v: val, r: () => expr };
  };
  return state.level === 'A' ? A : state.level === 'B' ? B : C;
}

function genSignTask() {
  const pick = levelPicker();
  const L = pick(), R = pick();
  return {
    valueLeft: L.v, valueRight: R.v,
    renderLeft: L.r(L.v), renderRight: R.r(R.v),
  };
}

/* Kumpi on enemmän?
   A
   B
   C
*/
function genMoreTask() {
  if (state.level === 'A') {
    const L = randInt(1, 12);
    const R = randInt(1, 12);
    return { kind: 'dots', L, R };
  }
  if (state.level === 'B') {
    const L = randInt(8, 20);
    const R = randInt(8, 20);
    return { kind: 'dots', L, R };
  }

  const makeExprSide = () => {
    const op = choice(['+','-']);
    if (op === '+') {
      const total = randInt(0, 20);
      const a = randInt(0, total);
      const b = total - a;
      return { op, a, b, value: total };
    } else {
      const a = randInt(0, 20);
      const b = randInt(0, a);
      return { op, a, b, value: a - b };
    }
  };

  const left  = makeExprSide();
  const right = makeExprSide();
  return {
    kind: 'exprDots3',
    leftOp:  left.op,
    rightOp: right.op,
    leftA:   left.a,
    leftB:   left.b,
    rightA:  right.a,
    rightB:  right.b,
    L:       left.value,
    R:       right.value,
  };
}

/* Järjestä luvut
   A
   B
   C
*/
function genOrderTask() {
  const count = 4 + (Math.random() > 0.6 ? 1 : 0);

  if (state.level === 'A' || state.level === 'B') {
    const max = state.level === 'A' ? 20 : 100;
    const arr = Array.from({ length: count }, () => randInt(0, max));
    return {
      kind: 'numbers',
      items: arr.map(v => ({
        value: v,
        labelInline: String(v),
        labelStack: String(v),
      })),
      answer: [...arr].sort((a,b)=>a-b)
    };
  }

  const makeExpr = () => {
    const op = choice(['+','-']);
    if (op === '+') {
      const total = randInt(0, 20);
      const a = randInt(0, total);
      const b = total - a;
      return {
        a, b, op, value: total,
        labelInline: `${a} + ${b}`,
        labelStack: `${a}\n+\n${b}`,
      };
    } else {
      const a = randInt(0, 20);
      const b = randInt(0, a);
      return {
        a, b, op, value: a - b,
        labelInline: `${a} - ${b}`,
        labelStack: `${a}\n-\n${b}`,
      };
    }
  };

  const items = Array.from({ length: count }, makeExpr);
  const answer = [...items.map(it => it.value)].sort((a,b)=>a-b);
  return { kind: 'expr', items, answer };
}

// Render tasks
function renderSignTask(task) {
  const useSoftWrap = state.level === 'C' && isMobile();
  const left  = useSoftWrap ? softWrapExpr(task.renderLeft)  : task.renderLeft;
  const right = useSoftWrap ? softWrapExpr(task.renderRight) : task.renderRight;

  el.leftExpr.textContent  = left;
  el.rightExpr.textContent = right;

  toggleWrapForLevel();

  el.leftExpr.classList.add('animate');
  el.rightExpr.classList.add('animate');
  setTimeout(() => {
    el.leftExpr.classList.remove('animate');
    el.rightExpr.classList.remove('animate');
  }, 250);

  const minAB = isMobile() ? 26 : 32;
  const minC  = isMobile() ? 16 : 20;
  const min   = state.level === 'C' ? minC : minAB;

  fitTextToBox(el.leftExpr,  { min, step: 0.9 });
  fitTextToBox(el.rightExpr, { min, step: 0.9 });
}

function renderMoreTask(task) {
  const makeDot = () => {
    const d = document.createElement('span');
    d.className = 'dot';
    return d;
  };

  const makeDotRows = (n, perRow = 10, maxRows = 3) => {
    const wrap = document.createElement('div');
    wrap.className = 'dot-block';
    let left = n, rows = 0;
    while (left > 0 && rows < maxRows) {
      const row = document.createElement('div');
      row.className = 'dot-row';
      const take = Math.min(perRow, left);
      for (let i = 0; i < take; i++) row.appendChild(makeDot());
      wrap.appendChild(row);
      left -= take;
      rows += 1;
    }
    return wrap;
  };

  const makeVerticalExpr = (a, op, b) => {
    const box = document.createElement('div');
    box.className = 'more-expr-vertical';
    box.setAttribute('aria-label', `${a} ${op} ${b} pistettä`);
    const topDots = makeDotRows(a);
    const opLine  = document.createElement('div');
    opLine.className = 'op-line';
    opLine.textContent = op;
    const bottomDots = makeDotRows(b);
    box.appendChild(topDots);
    box.appendChild(opLine);
    box.appendChild(bottomDots);
    return box;
  };

  el.moreLeft.innerHTML = '';
  el.moreRight.innerHTML = '';

  if (task.kind === 'dots') {
    el.moreLeft.appendChild(makeDotRows(task.L));
    el.moreRight.appendChild(makeDotRows(task.R));
  } else if (task.kind === 'exprDots3') {
    const leftExpr  = makeVerticalExpr(task.leftA,  task.leftOp,  task.leftB);
    const rightExpr = makeVerticalExpr(task.rightA, task.rightOp, task.rightB);
    el.moreLeft.appendChild(leftExpr);
    el.moreRight.appendChild(rightExpr);
  }
}

// Order rendering helpers (for Level C)
function setOrderCardLabel(btn) {
  const inline = btn.dataset.labelInline;
  const stack  = btn.dataset.labelStack;
  if (isMobile() && stack && stack.includes('\n')) {
    const [a, op, b] = stack.split('\n');
    btn.innerHTML = `<span class="order-line">${a}</span><span class="order-line">${op}</span><span class="order-line">${b}</span>`;
    btn.classList.add('order-stack');
  } else {
    btn.textContent = inline || btn.textContent;
    btn.classList.remove('order-stack');
  }
}

function updateOrderCardLabels() {
  document.querySelectorAll('#board-order button[data-label-inline]')
    .forEach(setOrderCardLabel);
}

function renderOrderTask(task) {
  el.orderPool.innerHTML = '';
  el.orderTarget.innerHTML = '';

  if (task.kind === 'numbers') {
    task.items.forEach(({ value, labelInline }) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'btn btn-outline-primary';
      card.textContent = labelInline;
      card.draggable = true;
      card.dataset.value = value;
      card.addEventListener('dragstart', (e)=>e.dataTransfer.setData('text/plain', String(value)));
      card.addEventListener('click', ()=> el.orderTarget.appendChild(card));
      el.orderPool.appendChild(card);
    });
  } else {

    task.items.forEach(({ value, labelInline, labelStack }) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'btn btn-outline-primary';
      card.draggable = true;
      card.dataset.value = value;
      card.dataset.labelInline = labelInline;
      card.dataset.labelStack  = labelStack;
      setOrderCardLabel(card);
      card.addEventListener('dragstart', (e)=>e.dataTransfer.setData('text/plain', String(value)));
      card.addEventListener('click', ()=> el.orderTarget.appendChild(card));
      el.orderPool.appendChild(card);
    });
  }

  [el.orderPool, el.orderTarget].forEach((zone)=>{
    zone.addEventListener('dragover',(e)=>{ e.preventDefault(); zone.classList.add('visually-strong'); });
    zone.addEventListener('dragleave',()=> zone.classList.remove('visually-strong'));
    zone.addEventListener('drop',(e)=>{
      e.preventDefault(); zone.classList.remove('visually-strong');
      const value = e.dataTransfer.getData('text/plain');
      const btn = [...document.querySelectorAll('#board-order [data-value]')].find(b=>b.dataset.value===value);
      if (btn) zone.appendChild(btn);
    });
  });

  updateOrderCardLabels();
}

// Flow
function renderTask(){
  setFeedback('');
  if (state.mode === 'sign') { state.currentTask = genSignTask();  renderSignTask(state.currentTask); }
  else if (state.mode === 'more') { state.currentTask = genMoreTask(); renderMoreTask(state.currentTask); }
  else { state.currentTask = genOrderTask(); renderOrderTask(state.currentTask); }
}

function applyAnswer(ok){
  state.total += 1;
  if (ok) state.correct += 1;
  if (state.total >= CONFIG.questionCount) finalizeRun();
  else {
    setFeedback(ok ? 'Hienoa! ✔' : 'Väärin ✖', ok);
    setTimeout(renderTask, ok ? 400 : 700);
  }
}

// Handlers
function handleSignAnswer(symbol){
  const { valueLeft: L, valueRight: R } = state.currentTask || {};
  const ok = (symbol==='<' && L<R) || (symbol==='>' && L>R) || (symbol==='=' && L===R);
  applyAnswer(ok);
}
function handleMoreAnswer(which){
  const { L, R } = state.currentTask || {};
  const ok = (which==='left' && L>R) || (which==='right' && R>L) || (which==='equal' && L===R);
  applyAnswer(ok);
}
function handleOrderCheck(){
  const got = [...el.orderTarget.querySelectorAll('[data-value]')].map(b=>Number(b.dataset.value));
  const expected = state.currentTask?.answer || [];
  const ok = got.length===expected.length && got.every((v,i)=>v===expected[i]);
  applyAnswer(ok);
}

// Start / Reset / Finish
function startGame(){
  state.mode  = el.mode?.value  || state.mode;
  state.level = el.level?.value || state.level;
  state.total = 0;
  state.correct = 0;
  state.startedAt = Date.now();

  el.welcomePane.classList.add('d-none');
  renderBoard();
  setBoardInputsDisabled(false);
  setSelectsDisabled(true);
  setFeedback('');
  renderTask();
}

function finalizeRun(){
  setBoardInputsDisabled(true);
  setSelectsDisabled(false);

  const elapsedMs = state.startedAt ? Date.now() - state.startedAt : 0;
  const payload = {
    correct: state.correct,
    total: state.total,
    elapsedMs,
    elapsedSec: Math.round(elapsedMs/1000),
    mode: state.mode,
    level: state.level,
    whenISO: new Date().toISOString(),
    game: 'Vertailutehtävät'
  };
  localStorage.setItem('cmp_last', JSON.stringify(payload));

  setFeedback(`Valmis! Oikein: ${state.correct}/${state.total}. Aika: ${payload.elapsedSec}s`, true);
  setTimeout(showWelcome, 800);
}

function resetGame(){
  setFeedback('Nollattu.');
  state.total = 0;
  state.correct = 0;
  state.startedAt = null;
  setBoardInputsDisabled(true);
  setSelectsDisabled(false);
  showWelcome();
}

// Events
document.addEventListener('click', (e)=>{
  const sym = e.target.closest('.symbol-btn');
  if (sym && !sym.disabled) handleSignAnswer(sym.dataset.symbol || sym.textContent.trim());
  const more = e.target.closest('[data-more]');
  if (more && !more.disabled) handleMoreAnswer(more.dataset.more);
});
if (el.checkOrderBtn) el.checkOrderBtn.addEventListener('click', handleOrderCheck);
if (el.startBtn) el.startBtn.addEventListener('click', startGame);
if (el.resetBtn) el.resetBtn.addEventListener('click', resetGame);
document.addEventListener('DOMContentLoaded', showWelcome);

// Resize
window.addEventListener('resize', ()=>{
  toggleWrapForLevel();
  if (state.mode === 'order') updateOrderCardLabels();
  if (!el.boardSign.classList.contains('d-none')) {
    const minAB = isMobile() ? 26 : 32;
    const minC  = isMobile() ? 16 : 20;
    const min   = state.level === 'C' ? minC : minAB;
    fitTextToBox(el.leftExpr,  { min });
    fitTextToBox(el.rightExpr, { min });
  }
});