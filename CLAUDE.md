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

Single-page app with three files at the root:

- **index.html** — Page structure with three screens: theme selection, mode selection, game play
- **script.js** — All game logic, vocabulary data, and screen transitions
- **style.css** — Styling with botanical green palette (#588157, #a3b18a, #344e41), CSS animations

### Game Flow

Setup screen (pick from 6 themes or create custom list) → Mode selection → Game screen

### Two Game Modes

1. **Quiz**: 10 words per round, random translation direction, hint system, scoring (1pt full / 0.5pt with hint)
2. **Matching (Relier les mots)**: 5-word pairs, click to match columns, green/red feedback with animations

### Vocabulary Data

Stored in `script.js` as a `themes` object. Each theme has 12 items with: english word, french translation, english hint, french hint. Custom lists are parsed from `anglais = français` format (minimum 2 words).

## Code Conventions

- Prettier for formatting (auto-format on save via VS Code workspace config)
- Answer comparisons are case-insensitive and whitespace-trimmed
- Google Fonts loaded via CSS: Playfair Display (serif headings), Poppins (sans-serif body)
