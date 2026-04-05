// js/state.js
export const state = {
  currentLang: localStorage.getItem("vocabulaire-lang") || "en",
  words: [],
  currentThemeName: "",
};
