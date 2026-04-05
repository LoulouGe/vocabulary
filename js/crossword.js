import { state } from "./state.js";
import { shuffle } from "./utils.js";
import { extractZhChars, buildZhKeyboard } from "./chinese-kb.js";
import { recordGameResult } from "./stats.js";

const CROSSWORD_SIZE = 8;

const crosswordGrid = document.getElementById("crossword-grid");
const crosswordAcrossClues = document.getElementById("crossword-across-clues");
const crosswordDownClues = document.getElementById("crossword-down-clues");
const crosswordCheckBtn = document.getElementById("crossword-check-btn");
const crosswordFeedback = document.getElementById("crossword-feedback");
const crosswordScoreDisplay = document.getElementById("crossword-score");
const crosswordTotalDisplay = document.getElementById("crossword-total");
const crosswordEndButtons = document.getElementById("crossword-end-buttons");
const crosswordReplayBtn = document.getElementById("crossword-replay-btn");
const crosswordMenuBtn = document.getElementById("crossword-menu-btn");
const zhKeyboardCrossword = document.getElementById("zh-keyboard-crossword");

let crosswordData = null;
let crosswordDirection = "across";

function generateCrossword(wordList) {
  const size = Math.min(CROSSWORD_SIZE, wordList.length);
  const selected = shuffle(wordList).slice(0, size);

  // Normalize words: uppercase, no spaces (Chinese: keep only CJK chars)
  const items = selected.map((w) => ({
    word:
      state.currentLang === "zh"
        ? extractZhChars(w.english).join("")
        : w.english.toUpperCase().replace(/\s+/g, ""),
    clue: w.hintEn || w.french,
    wordObj: w,
  }));

  // Sort by length descending for better placement
  items.sort((a, b) => b.word.length - a.word.length);

  const GRID_SIZE = 20;
  const grid = Array.from({ length: GRID_SIZE }, () =>
    Array(GRID_SIZE).fill(null),
  );

  const placed = [];

  // Place first word horizontally in the center
  const first = items[0];
  const startRow = Math.floor(GRID_SIZE / 2);
  const startCol = Math.floor((GRID_SIZE - first.word.length) / 2);
  for (let i = 0; i < first.word.length; i++) {
    grid[startRow][startCol + i] = first.word[i];
  }
  placed.push({
    ...first,
    row: startRow,
    col: startCol,
    direction: "across",
  });

  // Try to place remaining words
  for (let w = 1; w < items.length; w++) {
    const item = items[w];
    let bestPlacement = null;
    let bestScore = -1;

    // Find all possible intersections
    for (const existing of placed) {
      for (let ei = 0; ei < existing.word.length; ei++) {
        for (let ni = 0; ni < item.word.length; ni++) {
          if (existing.word[ei] !== item.word[ni]) continue;

          // New word direction is opposite of existing
          const dir = existing.direction === "across" ? "down" : "across";
          let row, col;

          if (dir === "across") {
            row = existing.row + ei;
            col = existing.col - ni;
          } else {
            row = existing.row - ni;
            col = existing.col + ei;
          }

          if (canPlace(grid, item.word, row, col, dir, GRID_SIZE)) {
            // Score: prefer central placements and more intersections
            const midR = row + (dir === "down" ? item.word.length / 2 : 0);
            const midC = col + (dir === "across" ? item.word.length / 2 : 0);
            const distFromCenter =
              Math.abs(midR - GRID_SIZE / 2) +
              Math.abs(midC - GRID_SIZE / 2);
            const score =
              100 -
              distFromCenter +
              countIntersections(grid, item.word, row, col, dir);

            if (score > bestScore) {
              bestScore = score;
              bestPlacement = { row, col, direction: dir };
            }
          }
        }
      }
    }

    if (bestPlacement) {
      const { row, col, direction } = bestPlacement;
      for (let i = 0; i < item.word.length; i++) {
        const r = direction === "down" ? row + i : row;
        const c = direction === "across" ? col + i : col;
        grid[r][c] = item.word[i];
      }
      placed.push({ ...item, row, col, direction });
    }
  }

  // Compact: find bounding box
  let minR = GRID_SIZE,
    maxR = 0,
    minC = GRID_SIZE,
    maxC = 0;
  for (const p of placed) {
    for (let i = 0; i < p.word.length; i++) {
      const r = p.direction === "down" ? p.row + i : p.row;
      const c = p.direction === "across" ? p.col + i : p.col;
      minR = Math.min(minR, r);
      maxR = Math.max(maxR, r);
      minC = Math.min(minC, c);
      maxC = Math.max(maxC, c);
    }
  }

  const rows = maxR - minR + 1;
  const cols = maxC - minC + 1;
  const compactGrid = Array.from({ length: rows }, () =>
    Array(cols).fill(null),
  );

  for (const p of placed) {
    p.row -= minR;
    p.col -= minC;
    for (let i = 0; i < p.word.length; i++) {
      const r = p.direction === "down" ? p.row + i : p.row;
      const c = p.direction === "across" ? p.col + i : p.col;
      compactGrid[r][c] = p.word[i];
    }
  }

  // Number the cells: scan left-to-right, top-to-bottom
  const numbers = {};
  let num = 1;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (compactGrid[r][c] === null) continue;
      const startsAcrossWord = placed.some(
        (p) => p.direction === "across" && p.row === r && p.col === c,
      );
      const startsDownWord = placed.some(
        (p) => p.direction === "down" && p.row === r && p.col === c,
      );
      if (startsAcrossWord || startsDownWord) {
        numbers[r + "," + c] = num++;
      }
    }
  }

  // Assign numbers to placed words
  for (const p of placed) {
    p.number = numbers[p.row + "," + p.col];
  }

  return { grid: compactGrid, placedWords: placed, rows, cols };
}

function canPlace(grid, word, row, col, direction, gridSize) {
  const len = word.length;

  for (let i = 0; i < len; i++) {
    const r = direction === "down" ? row + i : row;
    const c = direction === "across" ? col + i : col;

    // Out of bounds
    if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) return false;

    const cell = grid[r][c];

    if (cell !== null && cell !== word[i]) return false;

    if (cell === null) {
      // Check parallel adjacency (no unwanted neighbors)
      if (direction === "across") {
        if (r > 0 && grid[r - 1][c] !== null) return false;
        if (r < gridSize - 1 && grid[r + 1][c] !== null) return false;
      } else {
        if (c > 0 && grid[r][c - 1] !== null) return false;
        if (c < gridSize - 1 && grid[r][c + 1] !== null) return false;
      }
    }
  }

  // Check before and after the word
  if (direction === "across") {
    if (col > 0 && grid[row][col - 1] !== null) return false;
    if (col + len < gridSize && grid[row][col + len] !== null) return false;
  } else {
    if (row > 0 && grid[row - 1][col] !== null) return false;
    if (row + len < gridSize && grid[row + len][col] !== null) return false;
  }

  return true;
}

function countIntersections(grid, word, row, col, direction) {
  let count = 0;
  for (let i = 0; i < word.length; i++) {
    const r = direction === "down" ? row + i : row;
    const c = direction === "across" ? col + i : col;
    if (grid[r][c] === word[i]) count++;
  }
  return count;
}

export function startCrosswordRound() {
  crosswordData = generateCrossword(state.words);
  crosswordFeedback.innerText = "";
  crosswordEndButtons.style.display = "none";
  crosswordCheckBtn.style.display = "";
  crosswordTotalDisplay.innerText = crosswordData.placedWords.length;
  crosswordScoreDisplay.innerText = 0;
  renderCrosswordGrid();
  renderCrosswordClues();

  // Build Chinese virtual keyboard for crossword
  if (state.currentLang === "zh") {
    const allChars = [];
    crosswordData.placedWords.forEach((pw) => {
      for (const ch of pw.word) allChars.push(ch);
    });
    const uniqueChars = [...new Set(allChars)];
    buildZhKeyboard(
      zhKeyboardCrossword,
      uniqueChars,
      (ch) => {
        const focused = crosswordGrid.querySelector("input:focus");
        if (focused) {
          focused.value = ch;
          const r = parseInt(focused.dataset.row);
          const c = parseInt(focused.dataset.col);
          moveToNext(r, c);
        }
      },
      () => {
        const focused = crosswordGrid.querySelector("input:focus");
        if (focused) focused.value = "";
      },
    );
    zhKeyboardCrossword.style.display = "";
  } else {
    zhKeyboardCrossword.innerHTML = "";
    zhKeyboardCrossword.style.display = "none";
  }
}

function renderCrosswordGrid() {
  const { grid, rows, cols, placedWords } = crosswordData;
  crosswordGrid.innerHTML = "";

  // Compute cell size to fit within container (minus grid border)
  const containerWidth = crosswordGrid.parentElement.clientWidth - 4;
  const cellSize = Math.min(36, Math.floor(containerWidth / cols));
  crosswordGrid.style.gridTemplateColumns =
    "repeat(" + cols + ", " + cellSize + "px)";
  crosswordGrid.style.gridTemplateRows =
    "repeat(" + rows + ", " + cellSize + "px)";

  // Build a lookup of which cells have numbers
  const numbers = {};
  for (const pw of placedWords) {
    const key = pw.row + "," + pw.col;
    if (!numbers[key]) numbers[key] = pw.number;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = document.createElement("div");
      cell.className = "crossword-cell";

      if (grid[r][c] === null) {
        cell.classList.add("black");
      } else {
        const numKey = r + "," + c;
        if (numbers[numKey]) {
          const numSpan = document.createElement("span");
          numSpan.className = "cell-number";
          numSpan.textContent = numbers[numKey];
          cell.appendChild(numSpan);
        }

        const input = document.createElement("input");
        input.type = "text";
        input.maxLength = 1;
        input.dataset.row = r;
        input.dataset.col = c;
        input.autocomplete = "off";
        input.autocapitalize = "characters";

        input.addEventListener("input", (e) => {
          let val;
          if (state.currentLang === "zh") {
            val = e.target.value.slice(-1);
          } else {
            val = e.target.value.toUpperCase().replace(/[^A-Z]/g, "");
          }
          e.target.value = val;
          if (val) moveToNext(r, c);
        });

        input.addEventListener("keydown", (e) => {
          handleCrosswordKey(e, r, c);
        });

        input.addEventListener("focus", () => {
          highlightWord(r, c);
        });

        cell.appendChild(input);
      }

      crosswordGrid.appendChild(cell);
    }
  }
}

function findWordAt(r, c) {
  const { placedWords } = crosswordData;
  // Find words that contain this cell, prefer current direction
  const matches = placedWords.filter((p) => {
    if (p.direction === "across") {
      return p.row === r && c >= p.col && c < p.col + p.word.length;
    } else {
      return p.col === c && r >= p.row && r < p.row + p.word.length;
    }
  });

  // Prefer current direction
  const preferred = matches.find((m) => m.direction === crosswordDirection);
  return preferred || matches[0] || null;
}

function highlightWord(r, c) {
  // Clear existing highlights and active clues
  crosswordGrid
    .querySelectorAll(".highlight")
    .forEach((el) => el.classList.remove("highlight"));
  document
    .querySelectorAll(".active-clue")
    .forEach((el) => el.classList.remove("active-clue"));

  const word = findWordAt(r, c);
  if (!word) return;

  crosswordDirection = word.direction;

  for (let i = 0; i < word.word.length; i++) {
    const wr = word.direction === "down" ? word.row + i : word.row;
    const wc = word.direction === "across" ? word.col + i : word.col;
    const inp = crosswordGrid.querySelector(
      'input[data-row="' + wr + '"][data-col="' + wc + '"]',
    );
    if (inp) inp.parentElement.classList.add("highlight");
  }

  // Highlight the clue
  const clueEl = document.getElementById(
    "clue-" + word.direction + "-" + word.number,
  );
  if (clueEl) clueEl.classList.add("active-clue");
}

function moveToNext(r, c) {
  const { cols, rows } = crosswordData;
  let nr = r,
    nc = c;

  if (crosswordDirection === "across") {
    nc = c + 1;
  } else {
    nr = r + 1;
  }

  if (nr < rows && nc < cols) {
    const next = crosswordGrid.querySelector(
      'input[data-row="' + nr + '"][data-col="' + nc + '"]',
    );
    if (next) next.focus();
  }
}

function handleCrosswordKey(e, r, c) {
  const { rows, cols } = crosswordData;

  if (e.key === "Backspace" && !e.target.value) {
    e.preventDefault();
    let pr = r,
      pc = c;
    if (crosswordDirection === "across") {
      pc = c - 1;
    } else {
      pr = r - 1;
    }
    if (pr >= 0 && pc >= 0) {
      const prev = crosswordGrid.querySelector(
        'input[data-row="' + pr + '"][data-col="' + pc + '"]',
      );
      if (prev) {
        prev.focus();
        prev.value = "";
      }
    }
    return;
  }

  let dr = 0,
    dc = 0;
  if (e.key === "ArrowRight") dc = 1;
  else if (e.key === "ArrowLeft") dc = -1;
  else if (e.key === "ArrowDown") dr = 1;
  else if (e.key === "ArrowUp") dr = -1;
  else if (e.key === "Tab") {
    e.preventDefault();
    focusNextWord(r, c);
    return;
  } else return;

  if (dr !== 0 || dc !== 0) {
    e.preventDefault();
    // Update direction based on arrow
    if (dc !== 0) crosswordDirection = "across";
    if (dr !== 0) crosswordDirection = "down";

    let nr = r + dr,
      nc = c + dc;
    while (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
      const next = crosswordGrid.querySelector(
        'input[data-row="' + nr + '"][data-col="' + nc + '"]',
      );
      if (next) {
        next.focus();
        return;
      }
      nr += dr;
      nc += dc;
    }
  }
}

function focusNextWord(r, c) {
  const { placedWords } = crosswordData;
  const current = findWordAt(r, c);
  if (!current) return;

  // Sort words by number
  const sorted = [...placedWords].sort((a, b) => a.number - b.number);
  const idx = sorted.findIndex(
    (w) => w.number === current.number && w.direction === current.direction,
  );
  const next = sorted[(idx + 1) % sorted.length];

  const inp = crosswordGrid.querySelector(
    'input[data-row="' + next.row + '"][data-col="' + next.col + '"]',
  );
  if (inp) {
    crosswordDirection = next.direction;
    inp.focus();
  }
}

function renderCrosswordClues() {
  const { placedWords } = crosswordData;

  crosswordAcrossClues.innerHTML = "";
  crosswordDownClues.innerHTML = "";

  const across = placedWords
    .filter((w) => w.direction === "across")
    .sort((a, b) => a.number - b.number);
  const down = placedWords
    .filter((w) => w.direction === "down")
    .sort((a, b) => a.number - b.number);

  across.forEach((w) => {
    const li = document.createElement("li");
    li.id = "clue-across-" + w.number;
    li.innerHTML =
      '<span class="clue-number">' + w.number + ".</span> " + w.clue;
    li.addEventListener("click", () => {
      crosswordDirection = "across";
      const inp = crosswordGrid.querySelector(
        'input[data-row="' + w.row + '"][data-col="' + w.col + '"]',
      );
      if (inp) inp.focus();
    });
    crosswordAcrossClues.appendChild(li);
  });

  down.forEach((w) => {
    const li = document.createElement("li");
    li.id = "clue-down-" + w.number;
    li.innerHTML =
      '<span class="clue-number">' + w.number + ".</span> " + w.clue;
    li.addEventListener("click", () => {
      crosswordDirection = "down";
      const inp = crosswordGrid.querySelector(
        'input[data-row="' + w.row + '"][data-col="' + w.col + '"]',
      );
      if (inp) inp.focus();
    });
    crosswordDownClues.appendChild(li);
  });
}

function checkCrossword() {
  const { placedWords } = crosswordData;
  let correctCount = 0;
  const results = [];

  // Snapshot user answers before revealing anything
  const userAnswers = {};
  crosswordGrid.querySelectorAll("input").forEach((inp) => {
    userAnswers[inp.dataset.row + "," + inp.dataset.col] =
      state.currentLang === "zh" ? inp.value : inp.value.toUpperCase();
  });

  placedWords.forEach((w) => {
    let wordCorrect = true;

    for (let i = 0; i < w.word.length; i++) {
      const r = w.direction === "down" ? w.row + i : w.row;
      const c = w.direction === "across" ? w.col + i : w.col;
      const inp = crosswordGrid.querySelector(
        'input[data-row="' + r + '"][data-col="' + c + '"]',
      );
      if (!inp) continue;

      const cellEl = inp.parentElement;
      const userVal = userAnswers[r + "," + c];

      if (userVal === w.word[i]) {
        if (!cellEl.classList.contains("wrong")) {
          cellEl.classList.add("correct");
        }
      } else {
        cellEl.classList.add("wrong");
        cellEl.classList.remove("correct");
        wordCorrect = false;
        inp.value = w.word[i];
      }
    }

    if (wordCorrect) correctCount++;
    results.push({ english: w.wordObj.english, correct: wordCorrect });
  });

  // Disable all inputs after checking
  crosswordGrid
    .querySelectorAll("input")
    .forEach((inp) => (inp.disabled = true));

  crosswordScoreDisplay.innerText = correctCount;

  if (correctCount === placedWords.length) {
    crosswordFeedback.innerText = "Parfait ! Tous les mots sont corrects !";
    crosswordFeedback.style.color = "#588157";
  } else {
    crosswordFeedback.innerText =
      correctCount +
      " / " +
      placedWords.length +
      " mots corrects. Les erreurs sont affichées en rouge.";
    crosswordFeedback.style.color = "#c1121f";
  }

  crosswordCheckBtn.style.display = "none";
  crosswordEndButtons.style.display = "";
  recordGameResult(state.currentThemeName, results);
}

export function initCrossword(showSetup) {
  crosswordCheckBtn.addEventListener("click", checkCrossword);
  crosswordReplayBtn.addEventListener("click", () => startCrosswordRound());
  crosswordMenuBtn.addEventListener("click", () => showSetup());
}
