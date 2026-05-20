/**
 * Join an array of words into a natural sentence, handling contractions
 * and punctuation without extra spaces.
 * e.g. ["I", "don't", "know", "."] → "I don't know."
 * e.g. ["She", "isn't", "going", "."] → "She isn't going."
 */
export function smartJoin(words) {
  if (!words || words.length === 0) return '';

  const result = [words[0]];

  for (let i = 1; i < words.length; i++) {
    const w = words[i];
    const prev = result[result.length - 1];

    // Contractions and possessives: attach to previous word
    if (/^n't$/i.test(w) || /^'re$/i.test(w) || /^'s$/i.test(w) || /^'ll$/i.test(w) || /^'ve$/i.test(w) || /^'d$/i.test(w) || /^'m$/i.test(w)) {
      result[result.length - 1] = prev + w;
      continue;
    }

    // Punctuation: attach to previous word
    if (/^[.,;:!?]$/.test(w)) {
      result[result.length - 1] = prev + w;
      continue;
    }

    // Opening quote after space? keep space
    // Everything else: add space
    result.push(w);
  }

  return result.join(' ');
}
