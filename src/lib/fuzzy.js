/* Fuzzy matching for the command palette.
   "prt" matches "Portfolio": letters must appear in order, and the score rewards
   consecutive letters, word starts and exact substrings. Returns null when there is no match. */
export function fuzzy(query, text) {
  const q = query.toLowerCase(), t = text.toLowerCase();
  const idx = [];
  let score = 0, last = -2, qi = 0;
  for (let i = 0; i < t.length && qi < q.length; i++) {
    if (t[i] !== q[qi]) continue;
    idx.push(i);
    score += 1 + (i === last + 1 ? 3 : 0) + (i === 0 || ' -/'.includes(t[i - 1]) ? 4 : 0);
    last = i; qi++;
  }
  if (qi < q.length) return null;
  const at = t.indexOf(q);
  if (at >= 0) score += 10 - Math.min(at, 8);          // exact substring bonus
  return { score: score - t.length * 0.02, idx };
}
