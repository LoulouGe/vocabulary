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
    // Retourner au recto d'abord, puis changer le contenu après l'animation
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
      // Fin de la révision
      flashcardNav.style.display = "none";
      flashcardStatusBtns.style.display = "none";
      flashcardProgress.textContent = "Révision terminée !";
      flashcardEndButtons.style.display = "";

      const learningCount = Object.values(flashcardStatus).filter(
        (s) => s === "learning",
      ).length;
      if (learningCount > 0) {
        flashcardReplayLearningBtn.textContent =
          "Réviser les mots en cours (" + learningCount + ")";
        flashcardReplayLearningBtn.style.display = "";
      } else {
        flashcardReplayLearningBtn.style.display = "none";
      }

      // Record flashcard results (only words that were marked)
      const flashcardResults = [];
      flashcardWords.forEach((word, i) => {
        const status = flashcardStatus[i];
        if (status === "learned") {
          flashcardResults.push({ english: word.english, correct: true });
        } else if (status === "learning") {
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

  flashcardReplayBtn.addEventListener("click", () => {
    startFlashcardRound();
  });

  flashcardMenuBtn.addEventListener("click", () => {
    showSetup();
  });
}
