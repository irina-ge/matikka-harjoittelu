document.addEventListener("DOMContentLoaded", () => {
  loadScores();

  const clearBtn = document.getElementById("clear-scores");
  if (clearBtn) clearBtn.addEventListener("click", openModal);
});

function loadScores() {
  resetAllFields();

  const resultsMap = {};

  const addResult = (key, obj) => {
    if (!resultsMap[key]) {
      resultsMap[key] = obj;
    }
  };

  // Yhteenlasku
  ["A", "B", "C"].forEach(level => {
    const data = safeParse(localStorage.getItem(`add_${level}_last`));
    if (data) {
      setText(`addition-${level}-correct`, data.correct ?? "-");
      setText(`addition-${level}-time`, toSec(data.elapsedSec));
      addResult(`add-${level}`, { correct: data.correct || 0, total: data.total || 0 });
    }
  });

  // Vähennyslasku
  ["A", "B", "C"].forEach(level => {
    const data = safeParse(localStorage.getItem(`sub_${level}_last`));
    if (data) {
      setText(`subtraction-${level}-correct`, data.correct ?? "-");
      setText(`subtraction-${level}-time`, toSec(data.elapsedSec));
      addResult(`sub-${level}`, { correct: data.correct || 0, total: data.total || 0 });
    }
  });

  // Vertailutehtävät
  const modes = [
    { key: "sign",  prefix: "cmp-sign"  },
    { key: "more",  prefix: "cmp-more"  },
    { key: "order", prefix: "cmp-order" }
  ];
  const levels = ["A", "B", "C"];

  modes.forEach(m => {
    levels.forEach(lvl => {
      const data = safeParse(localStorage.getItem(`cmp_${m.key}_${lvl}_last`));
      if (data) {
        setText(`${m.prefix}-${lvl}-correct`, data.correct ?? "-");
        setText(`${m.prefix}-${lvl}-time`, toSec(data.elapsedSec));
        addResult(`cmp-${m.key}-${lvl}`, { correct: data.correct || 0, total: data.total || 0 });
      }
    });
  });

  // Legacy keys
  const legacy = [
    { key: "add_last", prefix: "addition", group: "add" },
    { key: "sub_last", prefix: "subtraction", group: "sub" },
    { key: "cmp_last", prefix: null,        group: "cmp" }
  ];

  legacy.forEach(entry => {
    const data = safeParse(localStorage.getItem(entry.key));
    if (!data) return;

    if (entry.prefix) {
      const lvl = data.level || "A";

      setText(`${entry.prefix}-${lvl}-correct`, data.correct ?? "-");
      setText(`${entry.prefix}-${lvl}-time`, toSec(data.elapsedSec));

      const totalKey = `${entry.group}-${lvl}`;
      addResult(totalKey, { correct: data.correct || 0, total: data.total || 0 });
    } else {

      if (data.mode && data.level) {
        setText(`cmp-${data.mode}-${data.level}-correct`, data.correct ?? "-");
        setText(`cmp-${data.mode}-${data.level}-time`, toSec(data.elapsedSec));
        const totalKey = `cmp-${data.mode}-${data.level}`;
        addResult(totalKey, { correct: data.correct || 0, total: data.total || 0 });
      }
    }
  });

  updateTotalSummary(Object.values(resultsMap));
}

// Helpers

function safeParse(str) {
  if (!str) return null;
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function toSec(sec) {
  if (typeof sec !== "number") return "- s";
  return `${sec} s`;
}

function updateTotalSummary(list) {
  const el = document.getElementById("total-scores");
  if (!el) return;

  if (!list || list.length === 0) {
    el.textContent = "Ei tuloksia vielä — pelaa peliä nähdäksesi pisteet!";
    return;
  }

  const totalCorrect = list.reduce((s, r) => s + (r.correct || 0), 0);
  const totalQ = list.reduce((s, r) => s + (r.total || 0), 0);
  el.textContent = `Yhteensä oikein: ${totalCorrect}/${totalQ}`;
}

// Reset all visible fields
function resetAllFields() {
  // addition
  ["A","B","C"].forEach(lvl => {
    setText(`addition-${lvl}-correct`, "-");
    setText(`addition-${lvl}-time`, "- s");
  });

  // subtraction
  ["A","B","C"].forEach(lvl => {
    setText(`subtraction-${lvl}-correct`, "-");
    setText(`subtraction-${lvl}-time`, "- s");
  });

  // comparison 3×3
  ["sign","more","order"].forEach(mode => {
    ["A","B","C"].forEach(lvl => {
      setText(`cmp-${mode}-${lvl}-correct`, "-");
      setText(`cmp-${mode}-${lvl}-time`, "- s");
    });
  });
}

// Modal
function openModal() {
  const modal = document.getElementById("clearScoresModal");
  if (modal) {
    modal.style.display = "flex";
    modal.style.visibility = "visible";
  }
}

function closeModal() {
  const modal = document.getElementById("clearScoresModal");
  if (modal) {
    modal.style.display = "none";
    modal.style.visibility = "hidden";
  }
}

function confirmClear() {
  const keys = [];

  // new keys
  ["A","B","C"].forEach(l => keys.push(`add_${l}_last`));
  ["A","B","C"].forEach(l => keys.push(`sub_${l}_last`));
  ["sign","more","order"].forEach(m => {
    ["A","B","C"].forEach(l => keys.push(`cmp_${m}_${l}_last`));
  });

  // legacy
  keys.push("add_last", "sub_last", "cmp_last");

  keys.forEach(k => localStorage.removeItem(k));

  resetAllFields();
  updateTotalSummary([]);

  closeModal();
}

window.closeModal = closeModal;
window.confirmClear = confirmClear;




