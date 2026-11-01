// The edits of scripts/build.sh to the pages it has built, in Node instead of sed: GNU and BSD sed differ (-i, \n in
// the replacement, the address 0,/re/), so the build ran on Linux only.
//
//   head-link <href> <file>...     the arc42 app's pages: a stylesheet link before the first </head>
//   head-script <src> <dir>        every .html file below <dir>: a deferred script before the first </head>
//   local-legal-links <dir>        every .html file below <dir>: the full address of the privacy notice and the imprint
//                                  of lernapps.net becomes the path, which the check of a site wants
import { existsSync, readdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/** The page with `text` and a line break before its first </head>; throws when it has none. */
export function beforeHead(html: string, text: string): string {
  if (!html.includes("</head>")) throw new Error("a page has no </head>");
  return html.replace("</head>", () => `${text}\n</head>`);
}

/** The links to the privacy notice and the imprint at lernapps.net's full address, as paths. */
export const localLegalLinks = (html: string): string =>
  html.replace(/href="https:\/\/lernapps\.net\/(privacy|imprint)\/"/g, 'href="/$1/"');

/** Every .html file below `dir`. */
const pages = (dir: string): string[] =>
  readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith(".html"))
    .map((entry) => join(entry.parentPath, entry.name));

const edit = (file: string, change: (html: string) => string) =>
  writeFileSync(file, change(readFileSync(file, "utf8")));

function main(args: string[]): number {
  const [command, first, ...rest] = args;
  if (command === "head-link" && first !== undefined) {
    // a page the build did not write (the review page of the diff, without ARC42_DIFF_BASE) is skipped
    for (const file of rest.filter((path) => existsSync(path))) {
      edit(file, (html) => beforeHead(html, `<link rel="stylesheet" href="${first}">`));
    }
    return 0;
  }
  if (command === "head-script" && first !== undefined && rest.length === 1) {
    for (const file of pages(rest[0] ?? ""))
      edit(file, (html) => beforeHead(html, `<script src="${first}" defer></script>`));
    return 0;
  }
  if (command === "local-legal-links" && first !== undefined && rest.length === 0) {
    for (const file of pages(first)) edit(file, localLegalLinks);
    return 0;
  }
  console.error("Usage: html-edit.ts head-link <href> <file>... | head-script <src> <dir> | local-legal-links <dir>");
  return 2;
}

// real paths on both sides, as in changes/site-pre-push.ts
if (
  process.argv[1] !== undefined &&
  realpathSync(resolve(process.argv[1])) === realpathSync(fileURLToPath(import.meta.url))
) {
  process.exitCode = main(process.argv.slice(2));
}
