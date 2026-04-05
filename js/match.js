import { state } from "./state.js";
import { shuffle } from "./utils.js";
import { recordGameResult } from "./stats.js";

const MATCH_SIZE = 5;

const matchColEn = document.getElementById("match-col-en");
const matchColFr = document.getElementById("match-col-fr");
const matchFeedback = document.getElementById("match-feedback");
const matchScoreDisplay = document.getElementById("match-score");
const matchTotalDisplay = document.getElementById("match-total");
const matchProgress = document.getElementById("match-progress");
const matchEndButtons = document.getElementById("match-end-buttons");
const matchReplayBtn = document.getElementById("match-replay-btn");
const matchMenuBtn = document.getElementById("match-menu-btn");

let matchWords = [];
let matchScore = 0;
let matchedCount = 0;
let selectedEn = null;
let selectedFr = null;
let matchLocked = false;
let matchResults = [];
let matchAttempts = {};

export function startMatchRound() {
  matchScore = 0;
  matchedCount = 0;
  selectedEn = null;
  selectedFr = null;
  matchLocked = false;
  matchResults = [];
  matchAttempts = {};
  matchFeedback.innerText = "";
  matchEndButtons.style.display = "none";

  const size = Math.min(MATCH_SIZE, state.words.length);
  matchWords = shuffle(state.words).slice(0, size);

  matchTotalDisplay.innerText = matchWords.length;
  matchScoreDisplay.innerText = 0;
  matchProgress.innerText = "0 / " + matchWords.length;

  const enOrder = shuffle(matchWords);
  const frOrder = shuffle(matchWords);

  matchColEn.innerHTML = "";
  matchColFr.innerHTML = "";

  enOrder.forEach((word) => {
    const el = document.createElement("div");
    el.className = "match-word";
    el.textContent = word.english;
    el.dataset.key = word.english;
    el.addEventListener("click", () => onClickEn(el, word));
    matchColEn.appendChild(el);
  });

  frOrder.forEach((word) => {
    const el = document.createElement("div");
    el.className = "match-word";
    el.textContent = word.french;
    el.dataset.key = word.english;
    el.addEventListener("click", () => onClickFr(el, word));
    matchColFr.appendChild(el);
  });
}

function onClickEn(el, word) {
  if (matchLocked || el.classList.contains("matched")) return;

  if (selectedEn) selectedEn.el.classList.remove("selected");

  selectedEn = { el, word };
  el.classList.add("selected");

  if (selectedFr) tryMatch();
}

function onClickFr(el, word) {
  if (matchLocked || el.classList.contains("matched")) return;

  if (selectedFr) selectedFr.el.classList.remove("selected");

  selectedFr = { el, word };
  el.classList.add("selected");

  if (selectedEn) tryMatch();
}

function tryMatch() {
  matchLocked = true;
  const isCorrect = selectedEn.word.english === selectedFr.word.english;

  if (isCorrect) {
    selectedEn.el.classList.remove("selected");
    selectedFr.el.classList.remove("selected");
    selectedEn.el.classList.add("matched");
    selectedFr.el.classList.add("matched");
    matchScore++;
    matchedCount++;
    matchScoreDisplay.innerText = matchScore;
    matchProgress.innerText = matchedCount + " / " + matchWords.length;
    matchFeedback.innerText = "Bravo !";
    matchFeedback.style.color = "green";

    const key = selectedEn.word.english;
    const hadWrong = matchAttempts[key] > 0;
    matchResults.push({ english: key, correct: !hadWrong });

    selectedEn = null;
    selectedFr = null;
    matchLocked = false;

    if (matchedCount === matchWords.length) {
      endMatchRound();
    }
  } else {
    const enKey = selectedEn.word.english;
    const frKey = selectedFr.word.english;
    matchAttempts[enKey] = (matchAttempts[enKey] || 0) + 1;
    matchAttempts[frKey] = (matchAttempts[frKey] || 0) + 1;

    selectedEn.el.classList.add("wrong");
    selectedFr.el.classList.add("wrong");
    matchFeedback.innerText = "Essaie encore !";
    matchFeedback.style.color = "#c1121f";

    const enEl = selectedEn.el;
    const frEl = selectedFr.el;

    setTimeout(() => {
      enEl.classList.remove("selected", "wrong");
      frEl.classList.remove("selected", "wrong");
      selectedEn = null;
      selectedFr = null;
      matchLocked = false;
    }, 600);
  }
}

function endMatchRound() {
  matchFeedback.innerText =
    "Bravo ! Score : " + matchScore + " / " + matchWords.length;
  matchFeedback.style.color = "#344e41";
  matchProgress.innerText = "Partie terminée !";
  matchEndButtons.style.display = "";
  recordGameResult(state.currentThemeName, matchResults);
}

export function initMatch(showSetup) {
  matchReplayBtn.addEventListener("click", () => startMatchRound());
  matchMenuBtn.addEventListener("click", () => showSetup());
}
