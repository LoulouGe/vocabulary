import { state, langKey } from "./state.js";
import { getThemeWordList } from "./data.js";

function getStatsKey() {
  return langKey("vocabulaire-stats");
}

function getTotalScoreKey() {
  return langKey("vocabulaire-total-score");
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

export async function getRecommendations() {
  const stats = loadStats();
  const recommendations = [];
  const now = Date.now();
  const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000;

  for (const [name, theme] of Object.entries(stats)) {
    const wordList = await getThemeWordList(name);
    const mastery = getThemeMastery(name, wordList);
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

export async function renderRecommendations(onThemeSelect) {
  const container = document.getElementById("recommendations");
  const recs = await getRecommendations();

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
  localStorage.removeItem(getStatsKey());
  localStorage.removeItem(getTotalScoreKey());
}
