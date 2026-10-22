(function (root) {
  'use strict';
  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’']/g, ' ').replace(/[^a-z0-9]+/g, ' ').trim().replace(/\s+/g, ' ');
  const cache = new WeakMap();
  function prepare(item) {
    if (cache.has(item)) return cache.get(item);
    const parts = {
      title: normalize(item.title), aliases: (item.aliases || []).map(normalize),
      authorities: (item.authorities || []).map(normalize), abilities: (item.abilities || []).map(normalize),
      text: normalize(item.keywords), kind: normalize(item.kind)
    };
    parts.all = [' ' + parts.title + ' ', ...parts.aliases.map(s => ' ' + s + ' '), ...parts.authorities.map(s => ' ' + s + ' '), ...parts.abilities.map(s => ' ' + s + ' '), ' ' + parts.text + ' '].join(' ');
    cache.set(item, parts); return parts;
  }
  function rank(items, query, kind) {
    const q = normalize(query), tokens = q.split(' ').filter(Boolean);
    if (!tokens.length) return [];
    const scored = [];
    for (const item of items) {
      if (kind && item.kind !== kind) continue;
      const p = prepare(item);
      if (!tokens.every((t,i) => p.all.includes(' ' + t + ' ') || (i === tokens.length-1 && t.length >= 2 && [p.title,...p.aliases,...p.authorities,...p.abilities].some(s => s.split(' ').some(w => w.startsWith(t)))))) continue;
      let score = 10;
      if (p.title === q) score += 2000;
      if (p.aliases.includes(q)) score += 1800;
      if (p.authorities.includes(q)) score += 1700;
      if (p.abilities.includes(q)) score += 1600;
      if (p.title.startsWith(q)) score += 900;
      if ((' ' + p.title + ' ').includes(' ' + q + ' ')) score += 700;
      if (tokens.every(t => (' ' + p.title + ' ').includes(' ' + t + ' '))) score += 500;
      if (tokens.every(t => p.authorities.some(a => (' ' + a + ' ').includes(' ' + t + ' ')))) score += 400;
      if (tokens.every(t => p.abilities.some(a => (' ' + a + ' ').includes(' ' + t + ' ')))) score += 350;
      if ((item.kind || '') === 'Effigi' || (item.kind || '') === 'Roots') score += 25;
      scored.push({item, score});
    }
    scored.sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title, 'it'));
    return scored.map(x => x.item);
  }
  root.AVARENNE_SEARCH = {normalize, rank};
  if (typeof module !== 'undefined' && module.exports) module.exports = root.AVARENNE_SEARCH;
})(typeof window !== 'undefined' ? window : globalThis);
