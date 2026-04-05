# Modularize and Optimize - Design Spec

## Goal

Refactor the monolithic `script.js` (5,012 lines, 144KB) into ES modules and extract vocabulary data into JSON files loaded on demand. Reduce initial payload from ~440KB to ~50KB + one language file (~100KB). Preserve identical behavior and the vanilla JS / no-build-tools constraint.

## Current State

- `script.js` -- 5,012 lines containing English vocabulary data (~3,200 lines) and all game logic (~1,800 lines)
- `themes-es.js`, `themes-de.js`, `themes-zh.js` -- ~3,200 lines each, loaded upfront via `<script>` tags
- Total JS payload on first load: ~440KB (all 4 languages + game logic)
- All game logic is procedural with ~15 global `let` variables
- ~30+ DOM references grabbed at the top level

## Proposed File Structure

```
index.html           (simplified, single module script tag)
style.css            (unchanged)
sw.js                (updated cache list + version bump)
manifest.json        (unchanged)
data/
  themes-en.json     (extracted from script.js const themes)
  themes-es.json     (extracted from themes-es.js)
  themes-de.json     (extracted from themes-de.js)
  themes-zh.json     (extracted from themes-zh.js)
js/
  app.js             (entry point: imports, event wiring, showSetup init)
  state.js           (shared mutable state object)
  data.js            (fetch + cache theme JSON by language)
  ui.js              (DOM helpers, hideAll/showX, updateUIStrings, uiStrings const)
  utils.js           (shuffle, parseWordList)
  quiz.js            (quiz game mode)
  match.js           (matching game mode)
  flashcard.js       (flashcard game mode)
  crossword.js       (crossword game mode)
  stats.js           (stats, mastery, recommendations, total score rendering)
  chinese-kb.js      (extractZhChars, buildZhKeyboard)
  custom-lists.js    (saved lists CRUD, renderSavedLists, proposeTheme)
```

**Deleted files:** `script.js`, `themes-es.js`, `themes-de.js`, `themes-zh.js`

## Design Details

### 1. Data Layer - JSON + Lazy Loading

Extract vocabulary objects into `data/themes-{lang}.json`. A `data.js` module handles fetching and caching:

```js
// js/data.js
const cache = {};

export async function getThemes(lang) {
  if (cache[lang]) return cache[lang];
  const resp = await fetch(`data/themes-${lang}.json`);
  cache[lang] = await resp.json();
  return cache[lang];
}
```

- Only the selected language is fetched on first use (saves ~300KB on initial load)
- All previously loaded languages stay cached in memory (no re-fetch when switching back)
- The `getThemeWordList()` function (used by stats/recommendations) also lives here

### 2. Shared State

A simple `state.js` exporting a plain mutable object:

```js
// js/state.js
export const state = {
  currentLang: localStorage.getItem("vocabulaire-lang") || "en",
  words: [],
  currentThemeName: "",
};
```

Only truly shared state lives here (language, current word list, current theme name). Game-mode-specific state (`score`, `currentIndex`, `matchScore`, `selectedEn`, `flashcardIndex`, `crosswordData`, etc.) stays as module-scoped `let` variables inside each game module.

### 3. Module Responsibilities

| Module | Exports | Internal State |
|--------|---------|----------------|
| `app.js` | (entry point) | none |
| `state.js` | `state` object | n/a |
| `data.js` | `getThemes(lang)`, `getThemeWordList(themeName)` | `cachedThemes` |
| `ui.js` | `hideAll()`, `showSetup()`, `showModeSelect()`, `showQuiz()`, `showMatch()`, `showFlashcard()`, `showCrossword()`, `updateUIStrings()`, `uiStrings` | DOM references for screens/lang selector |
| `utils.js` | `shuffle(array)`, `parseWordList(text)` | none |
| `quiz.js` | `startRound()` | `currentIndex`, `score`, `roundWords`, `roundOver`, `waitingNext`, `attempts`, `roundResults` |
| `match.js` | `startMatchRound()` | `matchWords`, `matchScore`, `matchedCount`, `selectedEn`, `selectedFr`, `matchLocked`, `matchResults`, `matchAttempts` |
| `flashcard.js` | `startFlashcardRound(wordsToUse?)` | `flashcardWords`, `flashcardIndex`, `flashcardStatus` |
| `crossword.js` | `startCrosswordRound()` | `crosswordData`, `crosswordDirection` |
| `stats.js` | `loadStats()`, `saveStats()`, `recordGameResult()`, `getThemeMastery()`, `getRecommendations()`, `renderRecommendations()`, `renderTotalScore()`, `renderMasteryBadge()`, `addToTotalScore()` | none (reads/writes localStorage) |
| `chinese-kb.js` | `extractZhChars(text)`, `buildZhKeyboard(container, chars, onCharClick, onBackspace)` | none |
| `custom-lists.js` | `loadSavedLists()`, `saveList()`, `deleteList()`, `renderSavedLists()`, setup for proposeTheme button | none (reads/writes localStorage) |

### 4. Async Flow

The async boundary is contained to two functions:

- `showSetup()` (in `ui.js`) becomes async -- awaits `getThemes(state.currentLang)` before rendering theme buttons
- `switchLang(lang)` (in `ui.js`) becomes async -- fetches new language data before showing setup

Everything downstream (starting quiz, match, etc.) works synchronously with the already-loaded `state.words` array.

### 5. index.html Changes

```html
<!-- Remove these 4 lines: -->
<script src="themes-es.js"></script>
<script src="themes-de.js"></script>
<script src="themes-zh.js"></script>
<script src="script.js"></script>

<!-- Replace with: -->
<script type="module" src="js/app.js"></script>
```

The inline service worker registration script moves into `app.js`.

### 6. Service Worker

Update `sw.js`:
- Bump cache version name
- Update cached file list to: `js/app.js`, `js/*.js` modules, `data/themes-en.json` (default language)
- Other language JSON files get cached on first use

### 7. What Does NOT Change

- `style.css` -- untouched
- `index.html` structure/DOM -- identical (only script tags change)
- All game behavior, scoring, localStorage keys, UI text
- `manifest.json`

## Performance Impact

| Metric | Before | After |
|--------|--------|-------|
| Initial JS payload | ~440KB (all languages) | ~50KB (modules) + ~100KB (1 language) |
| Subsequent language switch | 0 (already loaded) | ~100KB fetch on first use, then cached in memory |
| Number of HTTP requests | 4 (script + 3 themes) | ~13 (modules + 1 language JSON) |

Note: more HTTP requests but each is small and HTTP/2 (used by GitHub Pages) handles parallel small requests well. Net improvement for time-to-interactive.

## Constraints

- Pure vanilla JS, no build tools, no package manager, no dependencies
- ES modules via native browser `<script type="module">`
- Must work on GitHub Pages (static file serving)
- All user-facing text remains in French
