import { state, getStorageKey } from "./state.js";

const cache = {};

export async function getThemes(lang) {
  if (cache[lang]) return cache[lang];
  try {
    const resp = await fetch(`data/themes-${lang}.json`);
    if (!resp.ok) throw new Error(resp.status);
    cache[lang] = await resp.json();
    return cache[lang];
  } catch (e) {
    console.error("Erreur de chargement des themes (" + lang + "):", e);
    return {};
  }
}

export async function getThemeWordList(themeName) {
  const themes = await getThemes(state.currentLang);
  if (themes[themeName]) return themes[themeName];
  try {
    const lists = JSON.parse(localStorage.getItem(getStorageKey())) || {};
    if (lists[themeName]) return lists[themeName];
  } catch {
    // ignore
  }
  return null;
}
