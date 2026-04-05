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
  en: {
    quizToFr: "Traduisez en français :",
    quizToForeign: "Translate into English:",
  },
  es: {
    quizToFr: "Traduisez en français :",
    quizToForeign: "Traduce al español:",
  },
  de: {
    quizToFr: "Traduisez en français :",
    quizToForeign: "Übersetze ins Deutsche:",
  },
  zh: {
    quizToFr: "Traduisez en français :",
    quizToForeign: "翻译成中文：",
  },
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
        feedback.innerText = "Essaie encore ! Choisis la bonne réponse :";
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
      feedback.innerText = "C'était « " + correctAnswer + " »";
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
    instruction.innerText = "Partie terminée !";
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
        feedback.innerText = "C'était « " + correctAnswer + " »";
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
