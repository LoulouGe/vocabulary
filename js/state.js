export const state = {
  currentLang: localStorage.getItem("vocabulaire-lang") || "en",
  words: [],
  currentThemeName: "",
};

export function langKey(base) {
  return state.currentLang === "en" ? base : base + "-" + state.currentLang;
}

export function getStorageKey() {
  return langKey("vocabulaire-listes-perso");
}
