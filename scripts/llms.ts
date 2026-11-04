// Writes llms.txt, the entry point for AI assistants at https://lernapps.net/tooling/llms.txt: site/llms.txt (the
// entry criteria, how to start, the fallback without npx) with guidance/AGENTS.md appended, the process rules every
// app gets, so that an assistant has them from its first read, before any file is in its folder.
//
//   node scripts/llms.ts <out>   (scripts/build.sh writes _site/llms.txt, evals/harbor/run.sh the eval image's)
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");

export function llms(): string {
  const entry = readFileSync(resolve(ROOT, "site/llms.txt"), "utf8").trimEnd();
  const agents = readFileSync(resolve(ROOT, "guidance/AGENTS.md"), "utf8")
    .trimEnd()
    // its headings one level down, below the heading of llms.txt that introduces it
    .replace(/^(#+) /gm, "#$1 ");
  return `${entry}\n\n${agents}\n`;
}

if (import.meta.main) {
  const out = process.argv[2];
  if (!out) {
    process.stderr.write("usage: node scripts/llms.ts <out>\n");
    process.exit(2);
  }
  writeFileSync(out, llms());
}
