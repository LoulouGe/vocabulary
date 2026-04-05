import { state } from "./state.js";
import { getThemes } from "./data.js";
import { parseWordList } from "./utils.js";
import {
  renderMasteryBadge,
  renderRecommendations,
  renderTotalScore,
  resetStats,
} from "./stats.js";
import { renderSavedLists, loadSavedLists } from "./custom-lists.js";

const uiStrings = {
  en: {
    title: "Learn English",
    matchInstruction: "Relie chaque mot anglais \u00e0 sa traduction fran\u00e7aise !",
    crosswordInstruction: "Remplis la grille avec les mots anglais !",
    customFormatHint: "Format : anglais = fran\u00e7ais",
    customPlaceholder: "Apple = Pomme\nHouse = Maison\nDog = Chien",
    customListNamePlaceholder: "Nom de ta liste (ex : Les fruits)",
    customAlertMin:
      "Il faut au moins 2 mots ! V\u00e9rifie le format : anglais = fran\u00e7ais",
  },
  es: {
    title: "Aprende Espa\u00f1ol",
    matchInstruction:
      "Relie chaque mot espagnol \u00e0 sa traduction fran\u00e7aise !",
    crosswordInstruction: "Remplis la grille avec les mots espagnols !",
    customFormatHint: "Format : espagnol = fran\u00e7ais",
    customPlaceholder: "Mesa = Table\nCasa = Maison\nPerro = Chien",
    customListNamePlaceholder: "Nom de ta liste (ex : Les fruits)",
    customAlertMin:
      "Il faut au moins 2 mots ! V\u00e9rifie le format : espagnol = fran\u00e7ais",
  },
  de: {
    title: "Lerne Deutsch",
    matchInstruction:
      "Relie chaque mot allemand \u00e0 sa traduction fran\u00e7aise !",
    crosswordInstruction: "Remplis la grille avec les mots allemands !",
    customFormatHint: "Format : allemand = fran\u00e7ais",
    customPlaceholder:
      "der Tisch = Table\ndas Haus = Maison\nder Hund = Chien",
    customListNamePlaceholder: "Nom de ta liste (ex : Les fruits)",
    customAlertMin:
      "Il faut au moins 2 mots ! V\u00e9rifie le format : allemand = fran\u00e7ais",
  },
  zh: {
    title: "\u5b66\u4e2d\u6587",
    matchInstruction:
      "Relie chaque mot chinois \u00e0 sa traduction fran\u00e7aise !",
    crosswordInstruction: "Remplis la grille avec les mots chinois !",
    customFormatHint: "Format : chinois = fran\u00e7ais",
    customPlaceholder:
      "\u684c\u5b50 (zhu\u014dzi) = Table\n\u623f\u5b50 (f\u00e1ngzi) = Maison\n\u72d7 (g\u01d2u) = Chien",
    customListNamePlaceholder: "Nom de ta liste (ex : Les fruits)",
    customAlertMin:
      "Il faut au moins 2 mots ! V\u00e9rifie le format : chinois = fran\u00e7ais",
  },
};

const langFlags = { en: "\ud83c\uddec\ud83c\udde7", es: "\ud83c\uddea\ud83c\uddf8", de: "\ud83c\udde9\ud83c\uddea", zh: "\ud83c\udde8\ud83c\uddf3" };

// DOM refs
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

async function showSetup() {
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
    btn.addEventListener("click", () =>
      selectTheme(themeName, themes[themeName]),
    );
    themeGrid.appendChild(btn);
  }

  renderSavedLists((name, wordList) => selectTheme(name, wordList));

  await renderRecommendations(async (themeName) => {
    const t = await getThemes(state.currentLang);
    if (t[themeName]) {
      selectTheme(themeName, t[themeName]);
    } else {
      const lists = loadSavedLists();
      if (lists[themeName]) {
        selectTheme(themeName, lists[themeName]);
      }
    }
  });

  renderTotalScore();
}

function showModeSelect() {
  hideAll();
  modeScreen.style.display = "";
}

function showQuiz() {
  hideAll();
  quizArea.style.display = "";
}

function showMatch() {
  hideAll();
  matchArea.style.display = "";
}

function showFlashcard() {
  hideAll();
  flashcardArea.style.display = "";
}

function showCrossword() {
  hideAll();
  crosswordArea.style.display = "";
}

function initUI() {
  langToggle.addEventListener("click", (e) => {
    e.stopPropagation();
    langDropdown.classList.toggle("open");
  });

  langDropdown.addEventListener("click", (e) => {
    const option = e.target.closest(".lang-option");
    if (!option) return;
    langDropdown.classList.remove("open");
    state.currentLang = option.dataset.lang;
    localStorage.setItem("vocabulaire-lang", option.dataset.lang);
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
    const name = customListName.value.trim() || "Liste personnalis\u00e9e";
    selectTheme(name, parsed);
  });

  document
    .getElementById("reset-stats-btn")
    .addEventListener("click", () => {
      if (
        !confirm(
          "Tu es s\u00fbr(e) de vouloir remettre ta progression \u00e0 z\u00e9ro ?",
        )
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

export {
  showSetup,
  showModeSelect,
  showQuiz,
  showMatch,
  showFlashcard,
  showCrossword,
  initUI,
  uiStrings,
};
