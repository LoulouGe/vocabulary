// js/utils.js
export function shuffle(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function parseWordList(text) {
  const lines = text.split("\n");
  const parsed = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    const parts = trimmed.split("=");
    if (parts.length === 2) {
      parsed.push({
        english: parts[0].trim(),
        french: parts[1].trim(),
      });
    }
  }
  return parsed;
}
