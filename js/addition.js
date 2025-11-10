const CONFIG = {
  questionCount: 10,
  domainMin: 0,
  domainMax: 20,
  bRowsPerQuestion: 3,
  bChoicesPerQuestion: 4,
};

const state = {
  level: "A",
  total: 0,
  correct: 0,
  startedAt: null,
  bPending: 0,
  current: null,
};

// DOM
const el = {
  level: document.getElementById("level"),
  startBtn: document.getElementById("startBtn"),
  resetBtn: document.getElementById("resetBtn"),

  welcomePane: document.getElementById("welcomePane"),
  boardA: document.getElementById("board-A"),
  boardB: document.getElementById("board-B"),
  boardC: document.getElementById("board-C"),

  aExpr: document.getElementById("aExpr"),
  aOptions: document.getElementById("aOptions"),

  bRows: document.getElementById("bRows"),
  bBank: document.getElementById("bBank"),

  cTarget: document.getElementById("cTarget"),
  cOptions: document.getElementById("cOptions"),

  feedback: document.getElementById("feedback"),

  finalCtas: document.getElementById("finalCtas"),
  scoreLink: document.getElementById("scoreLink"),
  backToWelcomeBtn: document.getElementById("backToWelcomeBtn"),
};

// Utils
const randInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = (arr) =>
  arr
    .map((v) => [Math.random(), v])
    .sort((a, b) => a[0] - b[0])
    .map((p) => p[1]);
const sampleDistinct = (universe, k, excludeSet = new Set()) => {
  const pool = universe.filter((v) => !excludeSet.has(v));
  const out = [];
  while (out.length < k && pool.length) {
    const i = Math.floor(Math.random() * pool.length);
    out.push(pool.splice(i, 1)[0]);
  }
  return out;
};

function setFeedback(text, ok = null) {
  el.feedback.textContent = text || "";
  el.feedback.classList.remove("text-success", "text-danger");
  if (ok === true) el.feedback.classList.add("text-success");
  if (ok === false) el.feedback.classList.add("text-danger");
}

function showOnly(board) {
  el.boardA.classList.add("d-none");
  el.boardB.classList.add("d-none");
  el.boardC.classList.add("d-none");
  if (board) board.classList.remove("d-none");
}

function hideFinalButtons() {
  if (el.finalCtas) el.finalCtas.classList.add("d-none");
}

function showWelcome() {
  setFeedback("");
  hideFinalButtons();
  el.welcomePane.classList.remove("d-none");
  showOnly(null);
}

function startGame() {
  state.level = el.level?.value || "A";
  state.total = 0;
  state.correct = 0;
  state.startedAt = Date.now();
  setFeedback("");
  el.welcomePane.classList.add("d-none");
  hideFinalButtons();
  nextTask();
}

function finalizeGame() {
  const elapsedMs = Date.now() - (state.startedAt || Date.now());
  const payload = {
    game: "Yhteenlasku",
    level: state.level,
    correct: state.correct,
    total: state.total,
    elapsedMs,
    elapsedSec: Math.round(elapsedMs / 1000),
    whenISO: new Date().toISOString(),
  };

  localStorage.setItem(`add_${state.level}_last`, JSON.stringify(payload));
  localStorage.setItem("add_last", JSON.stringify(payload));

  setFeedback(
    `Valmis! Oikein: ${state.correct}/${state.total}. Aika: ${payload.elapsedSec}s`,
    true
  );

  if (el.finalCtas) el.finalCtas.classList.remove("d-none");
}

function resetGame() {
  setFeedback("Nollattu.");
  state.total = 0;
  state.correct = 0;
  state.startedAt = null;
  showWelcome();
}

// Level A
function genTaskA() {
  const a = randInt(0, 10),
    b = randInt(0, 10);
  const correct = a + b;
  const expr = `${a} + ${b} = ?`;

  const universe = Array.from(
    { length: CONFIG.domainMax - CONFIG.domainMin + 1 },
    (_, i) => i + CONFIG.domainMin
  );
  const wrongs = sampleDistinct(universe, 3, new Set([correct]));
  const options = shuffle([correct, ...wrongs]);

  return { expr, correct, options };
}

function renderTaskA(task) {
  showOnly(el.boardA);
  el.aExpr.textContent = task.expr;
  el.aOptions.innerHTML = "";
  task.options.forEach((val) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "answer-btn";
    btn.textContent = String(val);
    btn.addEventListener("click", () => {
      const ok = val === task.correct;
      applyAnswer(ok);
    });
    el.aOptions.appendChild(btn);
  });
}

// Level B
function makeBRowSpec() {
  const pattern = Math.random() < 0.5 ? "leftMissing" : "rightMissing";
  const a = randInt(0, 10);
  const b = randInt(0, 10);
  const s = a + b;
  if (pattern === "leftMissing") {
    return { kind: "?+b=s", a, b, s, missing: a };
  } else {
    return { kind: "a+?=s", a, b, s, missing: b };
  }
}

function genTaskB() {
  const rows = [];
  const usedMissing = new Set();
  while (rows.length < CONFIG.bRowsPerQuestion) {
    const r = makeBRowSpec();
    if (r.missing < 0 || r.missing > 20) continue;
    if (usedMissing.has(r.missing)) continue;
    usedMissing.add(r.missing);
    rows.push(r);
  }
  const universe = Array.from({ length: 21 }, (_, i) => i);
  const distract = sampleDistinct(universe, 1, new Set([...usedMissing]));
  const choices = shuffle([...usedMissing, ...distract]);
  return { rows, choices };
}

function renderTaskB(task) {
  showOnly(el.boardB);
  el.bRows.innerHTML = "";
  el.bBank.innerHTML = "";
  state.bPending = task.rows.length;

  task.rows.forEach((r) => {
    const row = document.createElement("div");
    row.className = "b-eq";
    const hole = document.createElement("span");
    hole.className = "b-hole";
    hole.dataset.missing = String(r.missing);
    hole.dataset.filled = "0";
    hole.textContent = "?";

    if (r.kind === "?+b=s") {
      row.appendChild(hole);
      row.appendChild(document.createTextNode(" + " + r.b + " = " + r.s));
    } else {
      row.appendChild(document.createTextNode(r.a + " + "));
      row.appendChild(hole);
      row.appendChild(document.createTextNode(" = " + r.s));
    }

    hole.addEventListener("dragover", (e) => e.preventDefault());
    hole.addEventListener("drop", (e) => {
      e.preventDefault();
      if (hole.dataset.filled === "1") return;
      const val = e.dataTransfer.getData("text/plain");
      if (!val) return;
      const ok = Number(val) === Number(hole.dataset.missing);
      if (ok) {
        hole.textContent = val;
        hole.dataset.filled = "1";
        setFeedback("Hienoa! ✔", true);

        const chip = document.querySelector(`.b-chip[data-val="${val}"]`);
        if (chip) {
          chip.classList.add("correct");
          chip.setAttribute("draggable", "false");
          chip.style.cursor = "default";
        }

        state.bPending -= 1;
        if (state.bPending <= 0) {
          applyAnswer(true);
        }
      } else {
        setFeedback("Väärin ✖", false);
      }
    });

    el.bRows.appendChild(row);
  });

  task.choices.forEach((v) => {
    const chip = document.createElement("div");
    chip.className = "b-chip";
    chip.textContent = String(v);
    chip.draggable = true;
    chip.dataset.val = String(v);
    chip.addEventListener("dragstart", (e) => {
      chip.classList.add("dragging");
      e.dataTransfer.setData("text/plain", String(v));
    });
    chip.addEventListener("dragend", () => chip.classList.remove("dragging"));
    el.bBank.appendChild(chip);
  });
}

// Level C
function genTaskC() {
  const target = randInt(0, 20);
  const a = randInt(0, target);
  const b = target - a;
  const correctExpr = { a, b, sum: a + b, isCorrect: true };

  const distractors = [];
  const usedSum = new Set([target]);
  while (distractors.length < 3) {
    const x = randInt(0, 20);
    const y = randInt(0, 20);
    const s = x + y;
    if (s === target || s < 0 || s > 20) continue;
    if (usedSum.has(s)) continue;
    usedSum.add(s);
    distractors.push({ a: x, b: y, sum: s, isCorrect: false });
  }
  const options = shuffle([correctExpr, ...distractors]);
  return { target, options };
}

function renderTaskC(task) {
  showOnly(el.boardC);
  el.cTarget.textContent = String(task.target);
  el.cOptions.innerHTML = "";
  task.options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "expr-card";
    btn.textContent = `${opt.a} + ${opt.b}`;
    btn.addEventListener("click", () => {
      applyAnswer(opt.isCorrect === true);
    });
    el.cOptions.appendChild(btn);
  });
}

// Flow
function nextTask() {
  hideFinalButtons();
  setFeedback("");

  if (state.total >= CONFIG.questionCount) {
    finalizeGame();
    return;
  }

  if (state.level === "A") {
    state.current = genTaskA();
    renderTaskA(state.current);
  } else if (state.level === "B") {
    state.current = genTaskB();
    renderTaskB(state.current);
  } else {
    state.current = genTaskC();
    renderTaskC(state.current);
  }
}

function applyAnswer(ok) {
  if (state.total >= CONFIG.questionCount) {
    return;
  }

  if (ok) state.correct += 1;
  state.total += 1;

  if (state.total >= CONFIG.questionCount) {
    finalizeGame();
  } else {
    setFeedback(ok ? "Hienoa! ✔" : "Väärin ✖", ok);
    setTimeout(nextTask, ok ? 450 : 750);
  }
}

// Events
document.addEventListener("DOMContentLoaded", showWelcome);
el.startBtn?.addEventListener("click", startGame);
el.resetBtn?.addEventListener("click", resetGame);
el.backToWelcomeBtn?.addEventListener("click", showWelcome);