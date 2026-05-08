/** Split a heading so the last word can be styled as accent (matches Events / Shop / Blog pattern). */
export function splitHeadingLastWord(full: string | null | undefined, fallback: string) {
  const s = (full ?? fallback).trim() || fallback;
  const words = s.split(/\s+/).filter(Boolean);
  if (words.length < 2) {
    return {lead: '', accent: s};
  }
  return {
    lead: words.slice(0, -1).join(' '),
    accent: words[words.length - 1]!,
  };
}
