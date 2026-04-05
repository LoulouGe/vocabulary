import { state, getStorageKey } from "./state.js";
import { parseWordList } from "./utils.js";
import { renderMasteryBadge } from "./stats.js";

const savedListsSection = document.getElementById("saved-lists-section");
const savedListsGrid = document.getElementById("saved-lists-grid");
const customActions = document.getElementById("custom-actions");
const saveListBtn = document.getElementById("save-list-btn");
const proposeThemeBtn = document.getElementById("propose-theme-btn");
const wordListInput = document.getElementById("word-list-input");
const customListName = document.getElementById("custom-list-name");

let _onThemeSelect = null;

export function loadSavedLists() {
  try {
    return JSON.parse(localStorage.getItem(getStorageKey())) || {};
  } catch {
    return {};
  }
}

function saveList(name, wordList) {
  const lists = loadSavedLists();
  lists[name] = wordList;
  localStorage.setItem(getStorageKey(), JSON.stringify(lists));
}

function deleteList(name) {
  const lists = loadSavedLists();
  delete lists[name];
  localStorage.setItem(getStorageKey(), JSON.stringify(lists));
}

export function renderSavedLists(onThemeSelect) {
  if (onThemeSelect) _onThemeSelect = onThemeSelect;
  const lists = loadSavedLists();
  const names = Object.keys(lists);

  if (names.length === 0) {
    savedListsSection.style.display = "none";
    return;
  }

  savedListsSection.style.display = "";
  savedListsGrid.innerHTML = "";

  names.forEach((name) => {
    const btn = document.createElement("button");
    btn.className = "saved-list-btn";

    const topRow = document.createElement("span");
    topRow.className = "saved-list-top";

    const nameSpan = document.createElement("span");
    nameSpan.className = "saved-list-name";
    nameSpan.textContent = name;

    const deleteSpan = document.createElement("span");
    deleteSpan.className = "saved-list-delete";
    deleteSpan.textContent = "\u00d7";
    deleteSpan.addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm("Supprimer la liste \u00ab " + name + " \u00bb ?")) {
        deleteList(name);
        renderSavedLists();
      }
    });

    topRow.appendChild(nameSpan);
    topRow.appendChild(deleteSpan);
    btn.appendChild(topRow);
    renderMasteryBadge(btn, name, lists[name]);

    btn.addEventListener("click", () => _onThemeSelect(name, lists[name]));

    savedListsGrid.appendChild(btn);
  });
}

function updateCustomActions() {
  const parsed = parseWordList(wordListInput.value);
  const hasName = customListName.value.trim().length > 0;
  customActions.style.display = parsed.length >= 2 && hasName ? "flex" : "none";
}

export function initCustomLists() {
  wordListInput.addEventListener("input", updateCustomActions);
  customListName.addEventListener("input", updateCustomActions);

  saveListBtn.addEventListener("click", () => {
    const parsed = parseWordList(wordListInput.value);
    if (parsed.length < 2) return;

    const trimmedName = customListName.value.trim();
    if (!trimmedName) {
      alert("Donne un nom \u00e0 ta liste !");
      customListName.focus();
      return;
    }

    const lists = loadSavedLists();
    if (lists[trimmedName]) {
      if (
        !confirm(
          "La liste \u00ab " + trimmedName + " \u00bb existe d\u00e9j\u00e0. Remplacer ?",
        )
      ) {
        return;
      }
    }

    saveList(trimmedName, parsed);
    renderSavedLists();
  });

  proposeThemeBtn.addEventListener("click", () => {
    const parsed = parseWordList(wordListInput.value);
    if (parsed.length < 2) return;

    const themeName = customListName.value.trim();
    if (!themeName) {
      alert("Donne un nom \u00e0 ton th\u00e8me !");
      customListName.focus();
      return;
    }
    const title = encodeURIComponent("Proposition de th\u00e8me : " + themeName);
    const body = encodeURIComponent(
      "Bonjour ! Voici une proposition de th\u00e8me \u00ab " +
        themeName +
        " \u00bb :\n\n" +
        parsed.map((w) => w.english + " = " + w.french).join("\n"),
    );
    window.open(
      "https://github.com/loulouge/vocabulary/issues/new?title=" +
        title +
        "&body=" +
        body,
      "_blank",
    );
  });
}
