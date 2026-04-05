# Modularize and Optimize Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the monolithic `script.js` into ES modules and extract vocabulary data into lazily-loaded JSON files, reducing initial payload from ~440KB to ~150KB.

**Architecture:** Extract vocabulary data from 4 JS files into `data/*.json`. Split game logic from `script.js` into focused ES modules under `js/`. Use native `<script type="module">` -- no build tools. Theme data is fetched on demand via `fetch()` and cached in memory.

**Tech Stack:** Vanilla JS with native ES modules, JSON for data, GitHub Pages for hosting.

---

## File Structure

```
data/
  themes-en.json     -- English vocabulary (extracted from script.js lines 1-3216)
  themes-es.json     -- Spanish vocabulary (extracted from themes-es.js)
  themes-de.json     -- German vocabulary (extracted from themes-de.js)
  themes-zh.json     -- Chinese vocabulary (extracted from themes-zh.js)
js/
  app.js             -- Entry point: imports all modules, wires event listeners, calls init
  state.js           -- Shared mutable state: currentLang, words, currentThemeName
  data.js            -- fetch + cache theme JSON, getThemeWordList()
  ui.js              -- uiStrings, hideAll/showX, updateUIStrings, lang selector, renderThemeButtons
  utils.js           -- shuffle(), parseWordList()
  quiz.js            -- Quiz game mode (lines 3593-3812 of current script.js)
  match.js           -- Matching game mode (lines 3814-3951)
  flashcard.js       -- Flashcard game mode (lines 3953-4081)
  crossword.js       -- Crossword game mode (lines 4213-4791)
  stats.js           -- Stats, mastery, recommendations, total score (lines 4793-4992)
  chinese-kb.js      -- extractZhChars(), buildZhKeyboard() (lines 3568-3591)
  custom-lists.js    -- Saved lists CRUD, renderSavedLists, proposeTheme (lines 4083-4211)
```

**Modified:** `index.html`, `sw.js`
**Deleted after migration:** `script.js`, `themes-es.js`, `themes-de.js`, `themes-zh.js`

---

### Task 1: Extract vocabulary data to JSON

**Files:**
- Create: `data/themes-en.json`
- Create: `data/themes-es.json`
- Create: `data/themes-de.json`
- Create: `data/themes-zh.json`

- [ ] **Step 1: Extract English themes to JSON**

Read `script.js` lines 1-3216 (the `const themes = { ... };` block). Extract the JS object literal and convert it to valid JSON. Write to `data/themes-en.json`.

The conversion requires: wrapping property names in double quotes, replacing single quotes with double quotes, ensuring no trailing commas. The easiest approach is a node one-liner:

```bash
node -e "
  const fs = require('fs');
  const src = fs.readFileSync('script.js', 'utf8');
  const match = src.match(/const themes = (\{[\s\S]*?\n\});/);
  const obj = eval('(' + match[1] + ')');
  fs.writeFileSync('data/themes-en.json', JSON.stringify(obj, null, 2));
"
```

Verify: `node -e "const d = require('./data/themes-en.json'); console.log(Object.keys(d).length, 'themes')"` -- expect `35 themes`.

- [ ] **Step 2: Extract Spanish themes to JSON**

```bash
node -e "
  const fs = require('fs');
  const src = fs.readFileSync('themes-es.js', 'utf8');
  const match = src.match(/const themesEs = (\{[\s\S]*?\n\});/);
  const obj = eval('(' + match[1] + ')');
  fs.writeFileSync('data/themes-es.json', JSON.stringify(obj, null, 2));
"
```

Verify: `node -e "const d = require('./data/themes-es.json'); console.log(Object.keys(d).length, 'themes')"` -- expect `35 themes`.

- [ ] **Step 3: Extract German themes to JSON**

```bash
node -e "
  const fs = require('fs');
  const src = fs.readFileSync('themes-de.js', 'utf8');
  const match = src.match(/const themesDe = (\{[\s\S]*?\n\});/);
  const obj = eval('(' + match[1] + ')');
  fs.writeFileSync('data/themes-de.json', JSON.stringify(obj, null, 2));
"
```

Verify: `node -e "const d = require('./data/themes-de.json'); console.log(Object.keys(d).length, 'themes')"` -- expect `35 themes`.

- [ ] **Step 4: Extract Chinese themes to JSON**

```bash
node -e "
  const fs = require('fs');
  const src = fs.readFileSync('themes-zh.js', 'utf8');
  const match = src.match(/const themesZh = (\{[\s\S]*?\n\});/);
  const obj = eval('(' + match[1] + ')');
  fs.writeFileSync('data/themes-zh.json', JSON.stringify(obj, null, 2));
"
```

Verify: `node -e "const d = require('./data/themes-zh.json'); console.log(Object.keys(d).length, 'themes')"` -- expect `35 themes`.

- [ ] **Step 5: Commit**

```bash
git add data/
git commit -m "Extraire les donnees vocabulaire en fichiers JSON"
```

---

### Task 2: Create foundation modules (state, utils, chinese-kb)

**Files:**
- Create: `js/state.js`
- Create: `js/utils.js`
- Create: `js/chinese-kb.js`

- [ ] **Step 1: Create js/state.js**

```js
// js/state.js
export const state = {
  currentLang: localStorage.getItem("vocabulaire-lang") || "en",
  words: [],
  currentThemeName: "",
};
```

- [ ] **Step 2: Create js/utils.js**

Extract `shuffle()` (script.js:3340-3347) and `parseWordList()` (script.js:3349-3364):

```js
// js/utils.js
export function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function parseWordList(text) {
  const lines = text.split("\n");
  const parsed = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parts = trimmed.split("=");
    if (parts.length === 2) {
      parsed.push({
        english: parts[0].trim(),
        french: parts[1].trim(),
      });
    }
  }
  return parsed;
}
```

- [ ] **Step 3: Create js/chinese-kb.js**

Extract `extractZhChars()` (script.js:3568-3570) and `buildZhKeyboard()` (script.js:3572-3591):

```js
// js/chinese-kb.js
import { shuffle } from "./utils.js";

export function extractZhChars(text) {
  return text.match(/[\u4e00-\u9fff]/g) || [];
}

export function buildZhKeyboard(container, chars, onCharClick, onBackspace) {
  container.innerHTML = "";
  const shuffled = shuffle(chars);
  shuffled.forEach((ch) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "zh-key";
    btn.textContent = ch;
    btn.addEventListener("mousedown", (e) => e.preventDefault());
    btn.addEventListener("click", () => onCharClick(ch));
    container.appendChild(btn);
  });
  const bksp = document.createElement("button");
  bksp.type = "button";
  bksp.className = "zh-key zh-backspace";
  bksp.textContent = "\u232b";
  bksp.addEventListener("mousedown", (e) => e.preventDefault());
  bksp.addEventListener("click", onBackspace);
  container.appendChild(bksp);
}
```

- [ ] **Step 4: Commit**

```bash
git add js/state.js js/utils.js js/chinese-kb.js
git commit -m "Creer les modules fondation: state, utils, chinese-kb"
```

---

### Task 3: Create data module

**Files:**
- Create: `js/data.js`

- [ ] **Step 1: Create js/data.js**

This module handles lazy-loading theme JSON and looking up theme word lists (including saved custom lists from localStorage).

```js
// js/data.js
import { state } from "./state.js";

const cache = {};

export async function getThemes(lang) {
  if (cache[lang]) return cache[lang];
  const resp = await fetch(`data/themes-${lang}.json`);
  cache[lang] = await resp.json();
  return cache[lang];
}

export async function getThemeWordList(themeName) {
  const themes = await getThemes(state.currentLang);
  if (themes[themeName]) return themes[themeName];
  // Check saved custom lists
  try {
    const storageKey =
      state.currentLang === "en"
        ? "vocabulaire-listes-perso"
        : "vocabulaire-listes-perso-" + state.currentLang;
    const lists = JSON.parse(localStorage.getItem(storageKey)) || {};
    if (lists[themeName]) return lists[themeName];
  } catch {
    // ignore
  }
  return null;
}
```

- [ ] **Step 2: Commit**

```bash
git add js/data.js
git commit -m "Creer le module data: chargement JSON a la demande"
```

---

### Task 4: Create stats module

**Files:**
- Create: `js/stats.js`

- [ ] **Step 1: Create js/stats.js**

Extract stats functions (script.js:4793-4992). These functions depend on `state.currentLang` for localStorage key computation and `getThemeWordList` from data.js.

```js
// js/stats.js
import { state } from "./state.js";
import { getThemeWordList } from "./data.js";

function langKey(base) {
  return state.currentLang === "en" ? base : base + "-" + state.currentLang;
}

function getStatsKey() {
  return langKey("vocabulaire-stats");
}

function getTotalScoreKey() {
  return langKey("vocabulaire-total-score");
}

export function getStorageKey() {
  return langKey("vocabulaire-listes-perso");
}

export function loadStats() {
  try {
    return JSON.parse(localStorage.getItem(getStatsKey())) || {};
  } catch {
    return {};
  }
}

export function saveStats(stats) {
  localStorage.setItem(getStatsKey(), JSON.stringify(stats));
}

function loadTotalScore() {
  return parseInt(localStorage.getItem(getTotalScoreKey()), 10) || 0;
}

export function addToTotalScore(points) {
  const total = loadTotalScore() + points;
  localStorage.setItem(getTotalScoreKey(), total);
  renderTotalScore();
}

export function renderTotalScore() {
  const el = document.getElementById("total-score-display");
  const total = loadTotalScore();
  el.innerHTML =
    'Score total : <span class="total-score-value">' + total + "</span> pts";
}

export function recordGameResult(themeName, wordResults) {
  if (!themeName || wordResults.length === 0) return;
  const correctCount = wordResults.filter((r) => r.correct).length;
  addToTotalScore(correctCount);
  const stats = loadStats();
  const now = Date.now();

  if (!stats[themeName]) {
    stats[themeName] = { lastPlayed: now, games: 0, words: {} };
  }

  const theme = stats[themeName];
  theme.lastPlayed = now;
  theme.games++;

  wordResults.forEach((r) => {
    const key = r.english;
    if (!theme.words[key]) {
      theme.words[key] = { correct: 0, wrong: 0, lastSeen: now };
    }
    const w = theme.words[key];
    w.lastSeen = now;
    if (r.correct) {
      w.correct++;
    } else {
      w.wrong++;
    }
  });

  saveStats(stats);
}

export function getThemeMastery(themeName, wordList) {
  const stats = loadStats();
  const theme = stats[themeName];
  if (!theme) return null;

  const totalWords = wordList ? wordList.length : 0;

  let masterySum = 0;
  let seenCount = 0;
  Object.values(theme.words).forEach((w) => {
    if (w.correct + w.wrong > 0) {
      masterySum += w.correct / (w.correct + w.wrong);
      seenCount++;
    }
  });

  const total = Math.max(totalWords, seenCount);
  if (total === 0) return null;

  return Math.round((masterySum / total) * 100);
}

export function getRecommendations() {
  const stats = loadStats();
  const recommendations = [];
  const now = Date.now();
  const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000;

  for (const [name, theme] of Object.entries(stats)) {
    const mastery = getThemeMastery(name, null);
    if (mastery !== null && mastery < 60) {
      recommendations.push({
        themeName: name,
        type: "weak",
        mastery,
        lastPlayed: theme.lastPlayed,
        text: "Tu as du mal avec " + name + " (" + mastery + " %) \u2014 r\u00e9vise-le !",
      });
    } else if (theme.lastPlayed && now - theme.lastPlayed > FOURTEEN_DAYS) {
      const days = Math.floor(
        (now - theme.lastPlayed) / (24 * 60 * 60 * 1000),
      );
      recommendations.push({
        themeName: name,
        type: "stale",
        mastery: mastery || 0,
        lastPlayed: theme.lastPlayed,
        text:
          "\u00c7a fait " +
          days +
          " jours que tu n'as pas r\u00e9vis\u00e9 " +
          name +
          " !",
      });
    }
  }

  recommendations.sort((a, b) => {
    if (a.type === "weak" && b.type !== "weak") return -1;
    if (a.type !== "weak" && b.type === "weak") return 1;
    if (a.type === "weak" && b.type === "weak") return a.mastery - b.mastery;
    return a.lastPlayed - b.lastPlayed;
  });

  return recommendations.slice(0, 2);
}

export function renderRecommendations(onThemeSelect) {
  const container = document.getElementById("recommendations");
  const recs = getRecommendations();

  if (recs.length === 0) {
    container.style.display = "none";
    return;
  }

  container.style.display = "";
  container.innerHTML = "";

  recs.forEach((rec) => {
    const el = document.createElement("div");
    el.className = "recommendation";
    el.textContent = rec.text;
    el.addEventListener("click", () => onThemeSelect(rec.themeName));
    container.appendChild(el);
  });
}

export function renderMasteryBadge(btn, themeName, wordList) {
  const mastery = getThemeMastery(themeName, wordList) || 0;

  const container = document.createElement("div");
  container.className = "mastery-container";

  const track = document.createElement("div");
  track.className = "mastery-track";

  const fill = document.createElement("div");
  fill.className = "mastery-fill";
  fill.style.width = mastery + "%";
  if (mastery === 0) fill.classList.add("mastery-zero");
  else if (mastery >= 80) fill.classList.add("mastery-high");
  else if (mastery >= 50) fill.classList.add("mastery-mid");
  else fill.classList.add("mastery-low");

  const pct = document.createElement("span");
  pct.className = "mastery-pct";
  pct.textContent = mastery + "%";

  track.appendChild(fill);
  container.appendChild(track);
  container.appendChild(pct);
  btn.appendChild(container);
}

export function resetStats() {
  const statsKey =
    state.currentLang === "en"
      ? "vocabulaire-stats"
      : "vocabulaire-stats-" + state.currentLang;
  const scoreKey =
    state.currentLang === "en"
      ? "vocabulaire-total-score"
      : "vocabulaire-total-score-" + state.currentLang;
  localStorage.removeItem(statsKey);
  localStorage.removeItem(scoreKey);
}
```

Note: `getThemeMastery` and `renderMasteryBadge` now take `wordList` as a parameter instead of calling `getThemeWordList()` internally (which is async). The caller passes the word list. `renderRecommendations` takes an `onThemeSelect` callback so it doesn't depend on ui.js.

- [ ] **Step 2: Commit**

```bash
git add js/stats.js
git commit -m "Creer le module stats: statistiques et recommandations"
```

---

### Task 5: Create custom-lists module

**Files:**
- Create: `js/custom-lists.js`

- [ ] **Step 1: Create js/custom-lists.js**

Extract saved list management (script.js:4083-4211). Takes callbacks for navigation.

```js
// js/custom-lists.js
import { state } from "./state.js";
import { parseWordList } from "./utils.js";
import { getStorageKey, renderMasteryBadge } from "./stats.js";

const savedListsSection = document.getElementById("saved-lists-section");
const savedListsGrid = document.getElementById("saved-lists-grid");
const customActions = document.getElementById("custom-actions");
const saveListBtn = document.getElementById("save-list-btn");
const proposeThemeBtn = document.getElementById("propose-theme-btn");
const wordListInput = document.getElementById("word-list-input");
const customListName = document.getElementById("custom-list-name");

export function loadSavedLists() {
  try {
    return JSON.parse(localStorage.getItem(getStorageKey())) || {};
  } catch {
    return {};
  }
}

function saveList(name, wordList) {
  const lists = loadSavedLists();
  lists[name] = wordList;
  localStorage.setItem(getStorageKey(), JSON.stringify(lists));
}

function deleteList(name) {
  const lists = loadSavedLists();
  delete lists[name];
  localStorage.setItem(getStorageKey(), JSON.stringify(lists));
}

export function renderSavedLists(onThemeSelect) {
  const lists = loadSavedLists();
  const names = Object.keys(lists);

  if (names.length === 0) {
    savedListsSection.style.display = "none";
    return;
  }

  savedListsSection.style.display = "";
  savedListsGrid.innerHTML = "";

  names.forEach((name) => {
    const btn = document.createElement("button");
    btn.className = "saved-list-btn";

    const topRow = document.createElement("span");
    topRow.className = "saved-list-top";

    const nameSpan = document.createElement("span");
    nameSpan.className = "saved-list-name";
    nameSpan.textContent = name;

    const deleteSpan = document.createElement("span");
    deleteSpan.className = "saved-list-delete";
    deleteSpan.textContent = "\u00d7";
    deleteSpan.addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm("Supprimer la liste \u00ab " + name + " \u00bb ?")) {
        deleteList(name);
        renderSavedLists(onThemeSelect);
      }
    });

    topRow.appendChild(nameSpan);
    topRow.appendChild(deleteSpan);
    btn.appendChild(topRow);
    renderMasteryBadge(btn, name, lists[name]);

    btn.addEventListener("click", () => onThemeSelect(name, lists[name]));

    savedListsGrid.appendChild(btn);
  });
}

function updateCustomActions() {
  const parsed = parseWordList(wordListInput.value);
  const hasName = customListName.value.trim().length > 0;
  customActions.style.display = parsed.length >= 2 && hasName ? "flex" : "none";
}

export function initCustomLists(uiStrings) {
  wordListInput.addEventListener("input", updateCustomActions);
  customListName.addEventListener("input", updateCustomActions);

  saveListBtn.addEventListener("click", () => {
    const parsed = parseWordList(wordListInput.value);
    if (parsed.length < 2) return;

    const trimmedName = customListName.value.trim();
    if (!trimmedName) {
      alert("Donne un nom \u00e0 ta liste !");
      customListName.focus();
      return;
    }

    const lists = loadSavedLists();
    if (lists[trimmedName]) {
      if (
        !confirm(
          "La liste \u00ab " + trimmedName + " \u00bb existe d\u00e9j\u00e0. Remplacer ?",
        )
      ) {
        return;
      }
    }

    saveList(trimmedName, parsed);
    renderSavedLists();
  });

  proposeThemeBtn.addEventListener("click", () => {
    const parsed = parseWordList(wordListInput.value);
    if (parsed.length < 2) return;

    const themeName = customListName.value.trim();
    if (!themeName) {
      alert("Donne un nom \u00e0 ton th\u00e8me !");
      customListName.focus();
      return;
    }
    const title = encodeURIComponent("Proposition de th\u00e8me : " + themeName);
    const body = encodeURIComponent(
      "Bonjour ! Voici une proposition de th\u00e8me \u00ab " +
        themeName +
        " \u00bb :\n\n" +
        parsed.map((w) => w.english + " = " + w.french).join("\n"),
    );
    window.open(
      "https://github.com/loulouge/vocabulary/issues/new?title=" +
        title +
        "&body=" +
        body,
      "_blank",
    );
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add js/custom-lists.js
git commit -m "Creer le module custom-lists: listes personnalisees"
```

---

### Task 6: Create quiz module

**Files:**
- Create: `js/quiz.js`

- [ ] **Step 1: Create js/quiz.js**

Extract quiz game mode (script.js:3593-3812). Module-scoped state, imports shared dependencies.

```js
// js/quiz.js
import { state } from "./state.js";
import { shuffle } from "./utils.js";
import { extractZhChars, buildZhKeyboard } from "./chinese-kb.js";
import { recordGameResult } from "./stats.js";

const ROUND_SIZE = 10;

const wordDisplay = document.getElementById("word-to-translate");
const userInput = document.getElementById("user-input");
const checkBtn = document.getElementById("check-btn");
const feedback = document.getElementById("feedback");
const scoreDisplay = document.getElementById("score");
const totalDisplay = document.getElementById("total");
const instruction = document.getElementById("instruction");
const progress = document.getElementById("progress");
const endButtons = document.getElementById("end-buttons");
const replayBtn = document.getElementById("replay-btn");
const menuBtn = document.getElementById("menu-btn");
const mcqChoices = document.getElementById("mcq-choices");
const zhKeyboardQuiz = document.getElementById("zh-keyboard-quiz");

const uiStrings = {
  en: { quizToFr: "Traduisez en fran\u00e7ais :", quizToForeign: "Translate into English:" },
  es: { quizToFr: "Traduisez en fran\u00e7ais :", quizToForeign: "Traduce al espa\u00f1ol:" },
  de: { quizToFr: "Traduisez en fran\u00e7ais :", quizToForeign: "\u00dcbersetze ins Deutsche:" },
  zh: { quizToFr: "Traduisez en fran\u00e7ais :", quizToForeign: "\u7ffb\u8bd1\u6210\u4e2d\u6587\uff1a" },
};

let currentIndex = 0;
let score = 0;
let roundWords = [];
let roundOver = false;
let waitingNext = false;
let attempts = 0;
let roundResults = [];

export function startRound() {
  currentIndex = 0;
  score = 0;
  roundOver = false;
  attempts = 0;
  roundResults = [];
  scoreDisplay.innerText = score;
  feedback.innerText = "";
  checkBtn.style.display = "";
  userInput.style.display = "";
  endButtons.style.display = "none";

  const size = Math.min(ROUND_SIZE, state.words.length);
  roundWords = shuffle(state.words)
    .slice(0, size)
    .map((word) => ({
      ...word,
      direction:
        state.currentLang === "es"
          ? "fr-to-en"
          : Math.random() < 0.5
            ? "en-to-fr"
            : "fr-to-en",
    }));
  totalDisplay.innerText = roundWords.length;

  if (state.currentLang === "zh") {
    const allChars = [];
    roundWords.forEach((w) => allChars.push(...extractZhChars(w.english)));
    const uniqueChars = [...new Set(allChars)];
    buildZhKeyboard(
      zhKeyboardQuiz,
      uniqueChars,
      (ch) => {
        userInput.value += ch;
        userInput.focus();
      },
      () => {
        userInput.value = userInput.value.slice(0, -1);
        userInput.focus();
      },
    );
  } else {
    zhKeyboardQuiz.innerHTML = "";
  }

  displayWord();
}

function displayWord() {
  const word = roundWords[currentIndex];
  const dir = word.direction;

  if (dir === "en-to-fr") {
    wordDisplay.innerText = word.english;
    instruction.innerText = uiStrings[state.currentLang].quizToFr;
  } else {
    wordDisplay.innerText = word.french;
    instruction.innerText = uiStrings[state.currentLang].quizToForeign;
  }

  const needZhKb = state.currentLang === "zh" && dir === "fr-to-en";
  zhKeyboardQuiz.style.display = needZhKb ? "" : "none";

  attempts = 0;
  feedback.innerText = "";
  mcqChoices.style.display = "none";
  mcqChoices.innerHTML = "";
  progress.innerText = currentIndex + 1 + " / " + roundWords.length;
  userInput.value = "";
  userInput.focus();
}

function getHint(word) {
  if (word.direction === "en-to-fr") {
    return word.hintEn;
  } else {
    return word.hintFr;
  }
}

function checkAnswer() {
  if (roundOver || waitingNext) return;
  const answer = userInput.value.trim().toLowerCase();
  if (answer === "") return;
  const word = roundWords[currentIndex];

  let correctAnswer;
  if (word.direction === "en-to-fr") {
    correctAnswer = word.french.toLowerCase();
  } else if (state.currentLang === "zh") {
    correctAnswer = extractZhChars(word.english).join("");
  } else {
    correctAnswer = word.english.toLowerCase();
  }

  if (answer === correctAnswer) {
    feedback.innerText = "Bravo !";
    feedback.style.color = "green";
    roundResults.push({ english: word.english, correct: attempts === 0 });
    if (attempts === 0) {
      score += 1;
    } else {
      score += 0.5;
    }
    scoreDisplay.innerText = score;
  } else {
    attempts++;
    if (attempts === 1) {
      if (word.direction === "fr-to-en") {
        feedback.innerText = "Essaie encore ! Choisis la bonne r\u00e9ponse :";
        feedback.style.color = "#b08b2e";
        showMcq(word);
      } else {
        const hint = getHint(word);
        if (hint) {
          feedback.innerText = "Essaie encore ! Indice : " + hint;
          feedback.style.color = "#b08b2e";
        } else {
          feedback.innerText = "Essaie encore !";
          feedback.style.color = "#b08b2e";
        }
      }
      userInput.value = "";
      userInput.focus();
      return;
    } else {
      feedback.innerText = "C'\u00e9tait \u00ab " + correctAnswer + " \u00bb";
      feedback.style.color = "red";
      roundResults.push({ english: word.english, correct: false });
    }
  }

  waitingNext = true;
  setTimeout(() => {
    waitingNext = false;
    nextWord();
  }, 1500);
}

function nextWord() {
  currentIndex++;

  if (currentIndex < roundWords.length) {
    displayWord();
  } else {
    roundOver = true;
    feedback.innerText =
      "Fin de la partie ! Score : " + score + " / " + roundWords.length;
    feedback.style.color = "#344e41";
    wordDisplay.innerText = "---";
    progress.innerText = "";
    instruction.innerText = "Partie termin\u00e9e !";
    checkBtn.style.display = "none";
    userInput.style.display = "none";
    zhKeyboardQuiz.style.display = "none";
    endButtons.style.display = "";
    recordGameResult(state.currentThemeName, roundResults);
  }
}

function showMcq(word) {
  const correctAnswer = word.english;
  const others = state.words.filter((w) => w.english !== correctAnswer);
  const wrongAnswers = shuffle(others)
    .slice(0, 2)
    .map((w) => w.english);
  const choices = shuffle([correctAnswer, ...wrongAnswers]);

  mcqChoices.innerHTML = "";
  mcqChoices.style.display = "flex";
  userInput.style.display = "none";
  checkBtn.style.display = "none";
  zhKeyboardQuiz.style.display = "none";

  choices.forEach((choice) => {
    const btn = document.createElement("button");
    btn.className = "mcq-btn";
    btn.textContent = choice;
    btn.addEventListener("click", () => {
      if (waitingNext) return;
      mcqChoices
        .querySelectorAll(".mcq-btn")
        .forEach((b) => (b.style.pointerEvents = "none"));

      if (choice === correctAnswer) {
        btn.classList.add("correct");
        feedback.innerText = "Bravo !";
        feedback.style.color = "green";
        score += 0.5;
        scoreDisplay.innerText = score;
        roundResults.push({ english: word.english, correct: false });
      } else {
        btn.classList.add("wrong");
        mcqChoices.querySelectorAll(".mcq-btn").forEach((b) => {
          if (b.textContent === correctAnswer) b.classList.add("correct");
        });
        feedback.innerText = "C'\u00e9tait \u00ab " + correctAnswer + " \u00bb";
        feedback.style.color = "red";
        roundResults.push({ english: word.english, correct: false });
      }

      waitingNext = true;
      setTimeout(() => {
        waitingNext = false;
        mcqChoices.style.display = "none";
        userInput.style.display = "";
        checkBtn.style.display = "";
        nextWord();
      }, 1500);
    });
    mcqChoices.appendChild(btn);
  });
}

export function initQuiz(showSetup) {
  checkBtn.addEventListener("click", checkAnswer);
  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkAnswer();
  });
  replayBtn.addEventListener("click", () => startRound());
  menuBtn.addEventListener("click", () => showSetup());
}
```

- [ ] **Step 2: Commit**

```bash
git add js/quiz.js
git commit -m "Creer le module quiz: mode quiz"
```

---

### Task 7: Create match module

**Files:**
- Create: `js/match.js`

- [ ] **Step 1: Create js/match.js**

Extract matching game (script.js:3814-3951).

```js
// js/match.js
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
  matchProgress.innerText = "Partie termin\u00e9e !";
  matchEndButtons.style.display = "";
  recordGameResult(state.currentThemeName, matchResults);
}

export function initMatch(showSetup) {
  matchReplayBtn.addEventListener("click", () => startMatchRound());
  matchMenuBtn.addEventListener("click", () => showSetup());
}
```

- [ ] **Step 2: Commit**

```bash
git add js/match.js
git commit -m "Creer le module match: mode relier les mots"
```

---

### Task 8: Create flashcard module

**Files:**
- Create: `js/flashcard.js`

- [ ] **Step 1: Create js/flashcard.js**

Extract flashcard mode (script.js:3953-4081).

```js
// js/flashcard.js
import { state } from "./state.js";
import { shuffle } from "./utils.js";
import { recordGameResult } from "./stats.js";

const flashcard = document.getElementById("flashcard");
const flashcardFrontWord = document.getElementById("flashcard-front-word");
const flashcardBackWord = document.getElementById("flashcard-back-word");
const flashcardBackHint = document.getElementById("flashcard-back-hint");
const flashcardProgress = document.getElementById("flashcard-progress");
const flashcardPrevBtn = document.getElementById("flashcard-prev-btn");
const flashcardNextBtn = document.getElementById("flashcard-next-btn");
const flashcardNav = document.getElementById("flashcard-nav");
const flashcardEndButtons = document.getElementById("flashcard-end-buttons");
const flashcardReplayBtn = document.getElementById("flashcard-replay-btn");
const flashcardMenuBtn = document.getElementById("flashcard-menu-btn");
const flashcardStatusBtns = document.getElementById("flashcard-status-btns");
const flashcardLearningBtn = document.getElementById("flashcard-learning-btn");
const flashcardLearnedBtn = document.getElementById("flashcard-learned-btn");
const flashcardReplayLearningBtn = document.getElementById(
  "flashcard-replay-learning-btn",
);

let flashcardWords = [];
let flashcardIndex = 0;
let flashcardStatus = {};

export function startFlashcardRound(wordsToUse) {
  flashcardWords = shuffle(wordsToUse || state.words);
  flashcardIndex = 0;
  flashcardStatus = {};
  flashcardEndButtons.style.display = "none";
  flashcardReplayLearningBtn.style.display = "none";
  flashcardNav.style.display = "flex";
  flashcardStatusBtns.style.display = "flex";
  displayFlashcard();
}

function displayFlashcard() {
  const word = flashcardWords[flashcardIndex];
  const isFlipped = flashcard.classList.contains("flipped");

  if (isFlipped) {
    flashcard.classList.remove("flipped");
    setTimeout(() => {
      updateFlashcardContent(word);
    }, 600);
  } else {
    updateFlashcardContent(word);
  }
}

function updateFlashcardContent(word) {
  if (state.currentLang === "es") {
    flashcardFrontWord.textContent = word.french;
    flashcardBackWord.textContent = word.english;
    flashcardBackHint.textContent = word.hintEn || "";
  } else {
    flashcardFrontWord.textContent = word.english;
    flashcardBackWord.textContent = word.french;
    flashcardBackHint.textContent = word.hintEn || "";
  }

  flashcardProgress.textContent =
    flashcardIndex + 1 + " / " + flashcardWords.length;

  flashcardPrevBtn.disabled = flashcardIndex === 0;
  flashcardPrevBtn.style.opacity = flashcardIndex === 0 ? "0.4" : "1";

  const status = flashcardStatus[flashcardIndex];
  flashcardLearningBtn.classList.toggle("active", status === "learning");
  flashcardLearnedBtn.classList.toggle("active", status === "learned");
}

export function initFlashcard(showSetup) {
  flashcard.addEventListener("click", () => {
    flashcard.classList.toggle("flipped");
  });

  flashcardNextBtn.addEventListener("click", () => {
    if (flashcardIndex < flashcardWords.length - 1) {
      flashcardIndex++;
      displayFlashcard();
    } else {
      flashcardNav.style.display = "none";
      flashcardStatusBtns.style.display = "none";
      flashcardProgress.textContent = "R\u00e9vision termin\u00e9e !";
      flashcardEndButtons.style.display = "";

      const learningCount = Object.values(flashcardStatus).filter(
        (s) => s === "learning",
      ).length;
      if (learningCount > 0) {
        flashcardReplayLearningBtn.textContent =
          "R\u00e9viser les mots en cours (" + learningCount + ")";
        flashcardReplayLearningBtn.style.display = "";
      } else {
        flashcardReplayLearningBtn.style.display = "none";
      }

      const flashcardResults = [];
      flashcardWords.forEach((word, i) => {
        const s = flashcardStatus[i];
        if (s === "learned") {
          flashcardResults.push({ english: word.english, correct: true });
        } else if (s === "learning") {
          flashcardResults.push({ english: word.english, correct: false });
        }
      });
      if (flashcardResults.length > 0) {
        recordGameResult(state.currentThemeName, flashcardResults);
      }
    }
  });

  flashcardPrevBtn.addEventListener("click", () => {
    if (flashcardIndex > 0) {
      flashcardIndex--;
      displayFlashcard();
    }
  });

  flashcardLearningBtn.addEventListener("click", () => {
    flashcardStatus[flashcardIndex] = "learning";
    flashcardLearningBtn.classList.add("active");
    flashcardLearnedBtn.classList.remove("active");
  });

  flashcardLearnedBtn.addEventListener("click", () => {
    flashcardStatus[flashcardIndex] = "learned";
    flashcardLearnedBtn.classList.add("active");
    flashcardLearningBtn.classList.remove("active");
  });

  flashcardReplayLearningBtn.addEventListener("click", () => {
    const learningWords = flashcardWords.filter(
      (_, i) => flashcardStatus[i] === "learning",
    );
    startFlashcardRound(learningWords);
  });

  flashcardReplayBtn.addEventListener("click", () => startFlashcardRound());
  flashcardMenuBtn.addEventListener("click", () => showSetup());
}
```

- [ ] **Step 2: Commit**

```bash
git add js/flashcard.js
git commit -m "Creer le module flashcard: mode revision"
```

---

### Task 9: Create crossword module

**Files:**
- Create: `js/crossword.js`

- [ ] **Step 1: Create js/crossword.js**

Extract crossword mode (script.js:4213-4791). This is the largest game module. Copy the full implementation from script.js lines 4213-4791, converting global references to use imports.

The module should:
- Import `state` from `./state.js`, `shuffle` from `./utils.js`, `extractZhChars` and `buildZhKeyboard` from `./chinese-kb.js`, `recordGameResult` from `./stats.js`
- Grab its own DOM references (`crosswordGrid`, `crosswordAcrossClues`, `crosswordDownClues`, `crosswordCheckBtn`, `crosswordFeedback`, `crosswordScoreDisplay`, `crosswordTotalDisplay`, `crosswordEndButtons`, `crosswordReplayBtn`, `crosswordMenuBtn`, `zhKeyboardCrossword`)
- Keep `crosswordData` and `crosswordDirection` as module-scoped `let` variables
- Export `startCrosswordRound()` and `initCrossword(showSetup)`
- `initCrossword` wires up `crosswordCheckBtn`, `crosswordReplayBtn`, `crosswordMenuBtn` event listeners
- All internal functions (`generateCrossword`, `canPlace`, `countIntersections`, `renderCrosswordGrid`, `renderCrosswordClues`, `checkCrossword`, `findWordAt`, `highlightWord`, `moveToNext`, `handleCrosswordKey`, `focusNextWord`) remain module-private
- Replace `words` with `state.words` and `currentLang` with `state.currentLang`
- Replace `currentThemeName` with `state.currentThemeName`
- The `CROSSWORD_SIZE` constant stays in this module

- [ ] **Step 2: Commit**

```bash
git add js/crossword.js
git commit -m "Creer le module crossword: mode mots croises"
```

---

### Task 10: Create ui module

**Files:**
- Create: `js/ui.js`

- [ ] **Step 1: Create js/ui.js**

This module owns screen transitions, uiStrings, lang selector, theme button rendering, and the start-custom-list button.

```js
// js/ui.js
import { state } from "./state.js";
import { getThemes } from "./data.js";
import { parseWordList } from "./utils.js";
import { renderMasteryBadge, renderRecommendations, renderTotalScore, resetStats } from "./stats.js";
import { renderSavedLists } from "./custom-lists.js";

const setupScreen = document.getElementById("setup-screen");
const modeScreen = document.getElementById("mode-screen");
const quizArea = document.getElementById("quiz-area");
const matchArea = document.getElementById("match-area");
const flashcardArea = document.getElementById("flashcard-area");
const crosswordArea = document.getElementById("crossword-area");
const langSelector = document.getElementById("lang-selector");
const themeGrid = document.getElementById("theme-grid");
const mainTitle = document.getElementById("main-title");
const matchInstruction = document.getElementById("match-instruction");
const crosswordInstruction = document.getElementById("crossword-instruction");
const customFormatHint = document.getElementById("custom-format-hint");
const wordListInput = document.getElementById("word-list-input");
const customListName = document.getElementById("custom-list-name");
const startCustomBtn = document.getElementById("start-custom-btn");
const langToggle = document.getElementById("lang-toggle");
const langDropdown = document.getElementById("lang-dropdown");

const langFlags = { en: "\ud83c\uddec\ud83c\udde7", es: "\ud83c\uddea\ud83c\uddf8", de: "\ud83c\udde9\ud83c\uddea", zh: "\ud83c\udde8\ud83c\uddf3" };

export const uiStrings = {
  en: {
    title: "Learn English",
    matchInstruction: "Relie chaque mot anglais \u00e0 sa traduction fran\u00e7aise !",
    crosswordInstruction: "Remplis la grille avec les mots anglais !",
    customFormatHint: "Format : anglais = fran\u00e7ais",
    customPlaceholder: "Apple = Pomme\nHouse = Maison\nDog = Chien",
    customListNamePlaceholder: "Nom de ta liste (ex : Les fruits)",
    customAlertMin: "Il faut au moins 2 mots ! V\u00e9rifie le format : anglais = fran\u00e7ais",
  },
  es: {
    title: "Aprende Espa\u00f1ol",
    matchInstruction: "Relie chaque mot espagnol \u00e0 sa traduction fran\u00e7aise !",
    crosswordInstruction: "Remplis la grille avec les mots espagnols !",
    customFormatHint: "Format : espagnol = fran\u00e7ais",
    customPlaceholder: "Mesa = Table\nCasa = Maison\nPerro = Chien",
    customListNamePlaceholder: "Nom de ta liste (ex : Les fruits)",
    customAlertMin: "Il faut au moins 2 mots ! V\u00e9rifie le format : espagnol = fran\u00e7ais",
  },
  de: {
    title: "Lerne Deutsch",
    matchInstruction: "Relie chaque mot allemand \u00e0 sa traduction fran\u00e7aise !",
    crosswordInstruction: "Remplis la grille avec les mots allemands !",
    customFormatHint: "Format : allemand = fran\u00e7ais",
    customPlaceholder: "der Tisch = Table\ndas Haus = Maison\nder Hund = Chien",
    customListNamePlaceholder: "Nom de ta liste (ex : Les fruits)",
    customAlertMin: "Il faut au moins 2 mots ! V\u00e9rifie le format : allemand = fran\u00e7ais",
  },
  zh: {
    title: "\u5b66\u4e2d\u6587",
    matchInstruction: "Relie chaque mot chinois \u00e0 sa traduction fran\u00e7aise !",
    crosswordInstruction: "Remplis la grille avec les mots chinois !",
    customFormatHint: "Format : chinois = fran\u00e7ais",
    customPlaceholder: "\u684c\u5b50 (zhu\u014dzi) = Table\n\u623f\u5b50 (f\u00e1ngzi) = Maison\n\u72d7 (g\u01d2u) = Chien",
    customListNamePlaceholder: "Nom de ta liste (ex : Les fruits)",
    customAlertMin: "Il faut au moins 2 mots ! V\u00e9rifie le format : chinois = fran\u00e7ais",
  },
};

function hideAll() {
  setupScreen.style.display = "none";
  modeScreen.style.display = "none";
  quizArea.style.display = "none";
  matchArea.style.display = "none";
  flashcardArea.style.display = "none";
  crosswordArea.style.display = "none";
  langSelector.style.display = "none";
}

function updateUIStrings() {
  const s = uiStrings[state.currentLang];
  mainTitle.textContent = s.title;
  matchInstruction.textContent = s.matchInstruction;
  crosswordInstruction.textContent = s.crosswordInstruction;
  customFormatHint.textContent = s.customFormatHint;
  wordListInput.placeholder = s.customPlaceholder;
  customListName.placeholder = s.customListNamePlaceholder;
  langToggle.textContent = langFlags[state.currentLang] + " \u25be";
  langDropdown.querySelectorAll(".lang-option").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === state.currentLang);
  });
}

function selectTheme(name, wordList) {
  state.words = wordList;
  state.currentThemeName = name;
  showModeSelect();
}

export async function showSetup() {
  hideAll();
  setupScreen.style.display = "";
  langSelector.style.display = "";
  updateUIStrings();

  const themes = await getThemes(state.currentLang);

  themeGrid.innerHTML = "";
  for (const themeName of Object.keys(themes)) {
    const btn = document.createElement("button");
    btn.className = "theme-btn";
    btn.textContent = themeName;
    renderMasteryBadge(btn, themeName, themes[themeName]);
    btn.addEventListener("click", () => selectTheme(themeName, themes[themeName]));
    themeGrid.appendChild(btn);
  }

  renderSavedLists((name, wordList) => selectTheme(name, wordList));

  renderRecommendations(async (themeName) => {
    const t = await getThemes(state.currentLang);
    if (t[themeName]) {
      selectTheme(themeName, t[themeName]);
    } else {
      // Check saved lists
      const { loadSavedLists } = await import("./custom-lists.js");
      const lists = loadSavedLists();
      if (lists[themeName]) {
        selectTheme(themeName, lists[themeName]);
      }
    }
  });

  renderTotalScore();
}

export function showModeSelect() {
  hideAll();
  modeScreen.style.display = "";
}

export function showQuiz() {
  hideAll();
  quizArea.style.display = "";
}

export function showMatch() {
  hideAll();
  matchArea.style.display = "";
}

export function showFlashcard() {
  hideAll();
  flashcardArea.style.display = "";
}

export function showCrossword() {
  hideAll();
  crosswordArea.style.display = "";
}

export function initUI() {
  langToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    langDropdown.classList.toggle("open");
  });

  langDropdown.addEventListener("click", (e) => {
    const option = e.target.closest(".lang-option");
    if (!option) return;
    langDropdown.classList.remove("open");
    state.currentLang = option.dataset.lang;
    localStorage.setItem("vocabulaire-lang", state.currentLang);
    showSetup();
  });

  document.addEventListener("click", () => {
    langDropdown.classList.remove("open");
  });

  startCustomBtn.addEventListener("click", () => {
    const parsed = parseWordList(wordListInput.value);
    if (parsed.length < 2) {
      alert(uiStrings[state.currentLang].customAlertMin);
      return;
    }
    selectTheme(
      customListName.value.trim() || "Liste personnalis\u00e9e",
      parsed,
    );
  });

  document.getElementById("reset-stats-btn").addEventListener("click", () => {
    if (
      !confirm("Tu es s\u00fbr(e) de vouloir remettre ta progression \u00e0 z\u00e9ro ?")
    ) {
      return;
    }
    if (
      !confirm(
        "Toutes tes statistiques seront perdues. Vraiment continuer ?",
      )
    ) {
      return;
    }
    resetStats();
    showSetup();
  });
}
```

- [ ] **Step 2: Commit**

```bash
git add js/ui.js
git commit -m "Creer le module ui: ecrans, navigation, langues"
```

---

### Task 11: Create app.js entry point

**Files:**
- Create: `js/app.js`

- [ ] **Step 1: Create js/app.js**

```js
// js/app.js
import { initUI, showSetup, showQuiz, showMatch, showFlashcard, showCrossword } from "./ui.js";
import { initQuiz, startRound } from "./quiz.js";
import { initMatch, startMatchRound } from "./match.js";
import { initFlashcard, startFlashcardRound } from "./flashcard.js";
import { initCrossword, startCrosswordRound } from "./crossword.js";
import { initCustomLists } from "./custom-lists.js";
import { uiStrings } from "./ui.js";

// Wire up mode selection buttons
document.getElementById("mode-quiz-btn").addEventListener("click", () => {
  showQuiz();
  startRound();
});

document.getElementById("mode-match-btn").addEventListener("click", () => {
  showMatch();
  startMatchRound();
});

document.getElementById("mode-flashcard-btn").addEventListener("click", () => {
  showFlashcard();
  startFlashcardRound();
});

document.getElementById("mode-crossword-btn").addEventListener("click", () => {
  showCrossword();
  startCrosswordRound();
});

document.getElementById("back-to-setup-btn").addEventListener("click", () => {
  showSetup();
});

// Initialize all modules
initUI();
initQuiz(showSetup);
initMatch(showSetup);
initFlashcard(showSetup);
initCrossword(showSetup);
initCustomLists(uiStrings);

// Register service worker
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch((error) => {
    console.log("Service Worker registration failed:", error);
  });
}

// Start the app
showSetup();
```

- [ ] **Step 2: Commit**

```bash
git add js/app.js
git commit -m "Creer le point d'entree app.js"
```

---

### Task 12: Update index.html and sw.js

**Files:**
- Modify: `index.html:180-199`
- Modify: `sw.js:1-12`

- [ ] **Step 1: Update index.html**

Replace the script section at the bottom of `index.html` (lines 180-199). Remove the 4 existing `<script>` tags and the inline service worker script. Replace with a single module script:

```html
    <script type="module" src="js/app.js"></script>
</body>
```

The full replacement: lines 180-199 become just the single `<script type="module">` tag before `</body>`.

- [ ] **Step 2: Update sw.js**

Update the cache name and file list:

```js
const CACHE_NAME = 'vocab-v2';
const FILES_TO_CACHE = [
  '/vocabulary/',
  '/vocabulary/index.html',
  '/vocabulary/style.css',
  '/vocabulary/js/app.js',
  '/vocabulary/js/state.js',
  '/vocabulary/js/data.js',
  '/vocabulary/js/ui.js',
  '/vocabulary/js/utils.js',
  '/vocabulary/js/quiz.js',
  '/vocabulary/js/match.js',
  '/vocabulary/js/flashcard.js',
  '/vocabulary/js/crossword.js',
  '/vocabulary/js/stats.js',
  '/vocabulary/js/chinese-kb.js',
  '/vocabulary/js/custom-lists.js',
  '/vocabulary/data/themes-en.json',
  '/vocabulary/manifest.json',
  '/vocabulary/assets/IMG_3722.png'
];
```

Only `themes-en.json` is precached (default language). Other language JSONs get cached on first fetch by the existing SW fetch handler.

- [ ] **Step 3: Commit**

```bash
git add index.html sw.js
git commit -m "Mettre a jour index.html et sw.js pour les modules ES"
```

---

### Task 13: Delete old files and verify

**Files:**
- Delete: `script.js`
- Delete: `themes-es.js`
- Delete: `themes-de.js`
- Delete: `themes-zh.js`

- [ ] **Step 1: Delete old files**

```bash
git rm script.js themes-es.js themes-de.js themes-zh.js
```

- [ ] **Step 2: Manual smoke test**

Start a local server and test in the browser:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080` and verify:
1. Setup screen loads with English themes and mastery badges
2. Switch language to Spanish -- themes load correctly
3. Switch back to English -- instant (cached)
4. Start a Quiz -- questions display, scoring works, MCQ on wrong answer works
5. Start a Match game -- columns display, matching works
6. Start Flashcards -- flip works, learning/learned buttons work
7. Start Crossword -- grid renders, clues display, checking works
8. Create a custom list -- save, play, delete all work
9. Chinese keyboard appears when needed
10. Reset stats button works (double confirm)
11. No console errors

- [ ] **Step 3: Commit**

```bash
git commit -m "Supprimer les anciens fichiers monolithiques"
```

---

### Task 14: Smart commit

- [ ] **Step 1: Invoke the smart-commit skill**

Run the `smart-commit` skill, telling it to take the whole git branch into account. This will update CLAUDE.md and README.md to reflect the new file structure and commit everything.
