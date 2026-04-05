import {
  initUI,
  showSetup,
  showQuiz,
  showMatch,
  showFlashcard,
  showCrossword,
} from "./ui.js";
import { initQuiz, startRound } from "./quiz.js";
import { initMatch, startMatchRound } from "./match.js";
import { initFlashcard, startFlashcardRound } from "./flashcard.js";
import { initCrossword, startCrosswordRound } from "./crossword.js";
import { initCustomLists } from "./custom-lists.js";

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

initUI();
initQuiz(showSetup);
initMatch(showSetup);
initFlashcard(showSetup);
initCrossword(showSetup);
initCustomLists();

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch((error) => {
    console.log("Service Worker registration failed:", error);
  });
}

showSetup();
