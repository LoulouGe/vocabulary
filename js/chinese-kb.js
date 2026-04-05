// js/chinese-kb.js
import { shuffle } from "./utils.js";

export function extractZhChars(text) {
  return text.match(/[\u4e00-\u9fff]/g) || [];
}

export function buildZhKeyboard(container, chars, onCharClick, onBackspace) {
  container.innerHTML = "";
  const shuffled = shuffle(chars);
  shuffled.forEach((ch) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "zh-key";
    btn.textContent = ch;
    btn.addEventListener("mousedown", (e) => e.preventDefault());
    btn.addEventListener("click", () => onCharClick(ch));
    container.appendChild(btn);
  });
  const bksp = document.createElement("button");
  bksp.type = "button";
  bksp.className = "zh-key zh-backspace";
  bksp.textContent = "\u232b";
  bksp.addEventListener("mousedown", (e) => e.preventDefault());
  bksp.addEventListener("click", onBackspace);
  container.appendChild(bksp);
}
