// Generates the SVG figures of the darstellen page. Run once: node .vibe/gen-images.mjs (writes into src/images/).
import fs from "node:fs";

const DEFS = `  <defs>
    <pattern id="gefaerbt" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="10" height="10" fill="#2f5fb3"/>
      <line x1="0" y1="0" x2="0" y2="10" stroke="#ffffff" stroke-width="3"/>
    </pattern>
  </defs>`;

function write(name, svg) {
  fs.writeFileSync(new URL(`../src/images/${name}.svg`, import.meta.url), svg);
}

function streifen(name, z, n) {
  const w = 580 / n;
  let rects = "";
  for (let i = 0; i < n; i++) {
    const fill = i < z ? "url(#gefaerbt)" : "#ffffff";
    rects += `  <rect x="${(10 + i * w).toFixed(2)}" y="10" width="${w.toFixed(2)}" height="60" fill="${fill}" stroke="#1a1a1a" stroke-width="3"/>\n`;
  }
  write(
    name,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 80" width="600" height="80">\n${DEFS}\n  <rect width="600" height="80" fill="#ffffff"/>\n${rects}</svg>\n`,
  );
}

function kreis(name, z, n) {
  const cx = 100,
    cy = 100,
    r = 88;
  let paths = "";
  for (let i = 0; i < n; i++) {
    const a1 = (-90 + (360 / n) * i) * (Math.PI / 180);
    const a2 = (-90 + (360 / n) * (i + 1)) * (Math.PI / 180);
    const p = (a) => `${(cx + r * Math.cos(a)).toFixed(2)} ${(cy + r * Math.sin(a)).toFixed(2)}`;
    const fill = i < z ? "url(#gefaerbt)" : "#ffffff";
    paths += `  <path d="M${cx} ${cy} L${p(a1)} A${r} ${r} 0 0 1 ${p(a2)} Z" fill="${fill}" stroke="#1a1a1a" stroke-width="3" stroke-linejoin="round"/>\n`;
  }
  write(
    name,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">\n${DEFS}\n  <rect width="200" height="200" fill="#ffffff"/>\n${paths}</svg>\n`,
  );
}

function zahlenstrahl(name, z, n, beschriftung) {
  const x0 = 30,
    breite = 540,
    y = 50;
  let s = `  <line x1="${x0}" y1="${y}" x2="${x0 + breite}" y2="${y}" stroke="#1a1a1a" stroke-width="3"/>\n`;
  for (let i = 0; i <= n; i++) {
    const x = (x0 + (breite * i) / n).toFixed(2);
    const hoch = i === 0 || i === n ? 14 : 9;
    s += `  <line x1="${x}" y1="${y - hoch}" x2="${x}" y2="${y + hoch}" stroke="#1a1a1a" stroke-width="3"/>\n`;
  }
  s += `  <text x="${x0}" y="95" text-anchor="middle" font-family="sans-serif" font-size="22" fill="#1a1a1a">0</text>\n`;
  s += `  <text x="${x0 + breite}" y="95" text-anchor="middle" font-family="sans-serif" font-size="22" fill="#1a1a1a">1</text>\n`;
  const px = (x0 + (breite * z) / n).toFixed(2);
  s += `  <circle cx="${px}" cy="${y}" r="9" fill="#2f5fb3" stroke="#1a1a1a" stroke-width="3"/>\n`;
  if (beschriftung)
    s += `  <text x="${px}" y="20" text-anchor="middle" font-family="sans-serif" font-size="22" fill="#1a1a1a">${beschriftung}</text>\n`;
  write(
    name,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 110" width="600" height="110">\n  <rect width="600" height="110" fill="#ffffff"/>\n${s}</svg>\n`,
  );
}

streifen("streifen-3-von-8", 3, 8);
kreis("kreis-3-von-8", 3, 8);
kreis("kreis-5-von-6", 5, 6);
zahlenstrahl("zahlenstrahl-3-von-8", 3, 8, "3/8");
zahlenstrahl("zahlenstrahl-3-von-5", 3, 5, "");

// two strips one above the other: z/n and the same fraction expanded by k, each with its visible label
function gleichwertig(name, z, n, k) {
  const strip = (zz, nn, y) => {
    const w = 580 / nn;
    let r = "";
    for (let i = 0; i < nn; i++) {
      const fill = i < zz ? "url(#gefaerbt)" : "#ffffff";
      r += `  <rect x="${(10 + i * w).toFixed(2)}" y="${y}" width="${w.toFixed(2)}" height="50" fill="${fill}" stroke="#1a1a1a" stroke-width="3"/>\n`;
    }
    return r;
  };
  const label = (t, y) =>
    `  <text x="10" y="${y}" font-family="sans-serif" font-size="20" fill="#1a1a1a">${t}</text>\n`;
  write(
    name,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 170" width="600" height="170">\n${DEFS}\n  <rect width="600" height="170" fill="#ffffff"/>\n${label(`vorher: ${z}/${n}`, 24)}${strip(z, n, 32)}${label(`erweitert mit ${k}: ${z * k}/${n * k}`, 114)}${strip(z * k, n * k, 122)}</svg>\n`,
  );
}
gleichwertig("erweitert-1-2-mit-2", 1, 2, 2);

// reducing: z/n above, the same fraction reduced by t below, each with its visible label
function gekuerzt(name, z, n, t) {
  const strip = (zz, nn, y) => {
    const w = 580 / nn;
    let r = "";
    for (let i = 0; i < nn; i++) {
      const fill = i < zz ? "url(#gefaerbt)" : "#ffffff";
      r += `  <rect x="${(10 + i * w).toFixed(2)}" y="${y}" width="${w.toFixed(2)}" height="50" fill="${fill}" stroke="#1a1a1a" stroke-width="3"/>\n`;
    }
    return r;
  };
  const label = (tx, y) =>
    `  <text x="10" y="${y}" font-family="sans-serif" font-size="20" fill="#1a1a1a">${tx}</text>\n`;
  write(
    name,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 170" width="600" height="170">\n${DEFS}\n  <rect width="600" height="170" fill="#ffffff"/>\n${label(`vorher: ${z}/${n}`, 24)}${strip(z, n, 32)}${label(`gekürzt mit ${t}: ${z / t}/${n / t}`, 114)}${strip(z / t, n / t, 122)}</svg>\n`,
  );
}
gekuerzt("gekuerzt-4-8-mit-4", 4, 8, 4);

// two fractions as two strips one above the other, each with its visible label
function vergleichBild(name, z1, n1, z2, n2) {
  const strip = (zz, nn, y) => {
    const w = 580 / nn;
    let r = "";
    for (let i = 0; i < nn; i++) {
      const fill = i < zz ? "url(#gefaerbt)" : "#ffffff";
      r += `  <rect x="${(10 + i * w).toFixed(2)}" y="${y}" width="${w.toFixed(2)}" height="50" fill="${fill}" stroke="#1a1a1a" stroke-width="3"/>\n`;
    }
    return r;
  };
  const label = (tx, y) =>
    `  <text x="10" y="${y}" font-family="sans-serif" font-size="20" fill="#1a1a1a">${tx}</text>\n`;
  write(
    name,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 170" width="600" height="170">\n${DEFS}\n  <rect width="600" height="170" fill="#ffffff"/>\n${label(`${z1}/${n1}`, 24)}${strip(z1, n1, 32)}${label(`${z2}/${n2}`, 114)}${strip(z2, n2, 122)}</svg>\n`,
  );
}
vergleichBild("vergleich-3-8-5-8", 3, 8, 5, 8);
vergleichBild("vergleich-3-4-5-8", 3, 4, 5, 8);
