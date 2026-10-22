// build-strudel-json.mjs
// Generates strudel.json from the samples/ folder.
// Usage (from the repo root):  node build-strudel-json.mjs

import { readdirSync, statSync, writeFileSync } from "node:fs";
import { join, extname } from "node:path";

const REPO = "denji-macaroni/strudel-sound-kit";
const BRANCH = "main";

// Whitelist: only these packs end up in strudel.json.
// Folder in samples/  →  bank name in Strudel  (s("bd").bank("cfr") → "cfr_bd")
// Packs that are not redistributed (e.g. cdr-amen) stay out of here on purpose.
const PACKS = {
  "cfr-dirt": "cfr",
};

const AUDIO = new Set([".wav", ".mp3", ".ogg", ".flac", ".aif", ".aiff", ".m4a"]);

const natural = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

// URL-safe path with forward slashes (Windows uses backslashes)
const toUrlPath = (...segments) => segments.map(encodeURIComponent).join("/");

const out = { _base: `https://raw.githubusercontent.com/${REPO}/${BRANCH}/` };

for (const [packDir, bank] of Object.entries(PACKS)) {
  const packPath = join("samples", packDir);

  const soundDirs = readdirSync(packPath)
    .filter((d) => statSync(join(packPath, d)).isDirectory())
    .sort(natural.compare);

  for (const soundDir of soundDirs) {
    const files = readdirSync(join(packPath, soundDir))
      .filter((f) => AUDIO.has(extname(f).toLowerCase()))
      .sort(natural.compare);

    if (files.length === 0) continue;

    out[`${bank}_${soundDir}`] = files.map((f) =>
      toUrlPath("samples", packDir, soundDir, f)
    );
  }
}

writeFileSync("strudel.json", JSON.stringify(out, null, 2) + "\n");

const keys = Object.keys(out).filter((k) => k !== "_base");
console.log(`strudel.json: ${keys.length} sounds`);
for (const k of keys) console.log(`  ${k.padEnd(18)} ${out[k].length} file`);
