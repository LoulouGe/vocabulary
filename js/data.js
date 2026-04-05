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
