/** Convert katakana to hiragana for kana-insensitive matching */
function toHiragana(str: string): string {
  return str.replace(/[\u30A1-\u30F6]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60))
}

/** Normalize a search string: lowercase + katakana → hiragana */
export function normalizeSearch(str: string): string {
  return toHiragana(str.toLowerCase())
}
