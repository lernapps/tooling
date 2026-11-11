# Read the map

Lists the gaps of one grade band with their place (step in the band) and how many competencies build on them,
directly or further down. Node 18 or later; run it from any folder.

```js
// node read-map.mjs <subject> <band>   e.g. node read-map.mjs franzoesisch 5-6
const [subject, band] = process.argv.slice(2);
const map = await (await fetch(`https://lernapps.net/apps/map/${subject}.json`)).json();
const all = map.strands.flatMap((s) => s.competencies.map((c) => ({ ...c, strand: s.id })));
const byId = new Map(all.map((c) => [c.id, c]));
const step = (c) => c.place?.step ?? (c._s ??= 1 + Math.max(0, ...c.requires.map((r) => byId.get(r))
  .filter((r) => r.gradeBand === c.gradeBand).map(step)));
const after = (id, seen = new Set()) => {
  for (const c of all) if (c.requires.includes(id) && !seen.has(c.id)) { seen.add(c.id); after(c.id, seen); }
  return seen;
};
const gaps = all.filter((c) => c.gradeBand === band && !c.practisedBy.length)
  .map((c) => ({ step: step(c), opens: after(c.id).size, id: c.id, strand: c.strand, requires: c.requires.join(" ") }))
  .sort((a, b) => a.step - b.step || b.opens - a.opens);
console.table(gaps);
```

- `opens` is criterion 3 of the skill: on a map of gaps, prefer what opens most.
- `requires` shows what must be in the cut, practised, or recapped (criterion 2).
