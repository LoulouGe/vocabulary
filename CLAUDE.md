# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

English-French vocabulary learning game built with a 12-year-old French-speaking daughter. All user-facing text (UI, comments to the user, README) must be in French. Code identifiers and code comments can remain in English.

Live site: https://loulouge.github.io/vocabulary/

## Development

No build tools, no package manager, no dependencies. Pure vanilla HTML/CSS/JS.

```bash
# Run local dev server
python3 -m http.server 8080
# Then open http://localhost:8080
```

Alternatively, use VS Code Live Server extension.

Deployed automatically via GitHub Pages from `main` branch — no build step needed.

## Architecture

Single-page app using native ES modules (`<script type="module">`):

- **index.html** — Page structure with three screens: theme selection, mode selection, game play
- **js/** — ES modules: `app.js` (entry point), `ui.js`, `quiz.js`, `match.js`, `flashcard.js`, `crossword.js`, `stats.js`, `custom-lists.js`, `data.js`, `state.js`, `utils.js`, `chinese-kb.js`
- **data/** — Vocabulary JSON files per language (`themes-en.json`, `themes-es.json`, `themes-de.json`, `themes-zh.json`), loaded on demand via fetch
- **style.css** — Styling with botanical green palette (#588157, #a3b18a, #344e41), CSS animations
- **sw.js** — Service worker for PWA / offline support

### Game Flow

Setup screen (pick from 35 themes or create custom list) → Mode selection → Game screen

### Game Modes

1. **Quiz**: 10 words per round, random translation direction, hint system, scoring (1pt full / 0.5pt with hint)
2. **Matching (Relier les mots)**: 5-word pairs, click to match columns, green/red feedback with animations
3. **Crossword (Mots croisés)**: 8-word crossword grid with French clues, answer in target language

### Vocabulary Data

Vocabulary is stored as JSON in `data/` (one file per language: `themes-en.json`, `themes-es.json`, `themes-de.json`, `themes-zh.json`). Only the selected language is fetched at runtime, cached in memory. Each theme typically has 12 items with: target-language word, french translation, target-language hint, french hint. The Tourisme (Delilah) theme is larger (116 items). Custom lists are parsed from `anglais = francais` format (minimum 2 words).

## Code Conventions

- Prettier for formatting (auto-format on save via VS Code workspace config)
- Answer comparisons are case-insensitive and whitespace-trimmed
- Google Fonts loaded via CSS: Playfair Display (serif headings), Poppins (sans-serif body)
