// The edits of scripts/build.sh to the built pages (scripts/html-edit.ts), which replaced sed: the same on Linux and macOS.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vite-plus/test";
import { beforeHead, localLegalLinks } from "../scripts/html-edit.ts";
import { repoRoot, run, tempDir } from "./support.ts";

const page = (body = "") => `<html>\n<head>\n<title>x</title>\n</head>\n<body>${body}</body>\n</html>\n`;
const edit = (...args: string[]) => run("node", [join(repoRoot, "scripts/html-edit.ts"), ...args], repoRoot);

test("text goes before the first </head>, on a line of its own, and only there", () => {
  const twice = `${page()}<!-- </head> -->\n`;
  const out = beforeHead(twice, '<script src="/c.js" defer></script>');
  expect(out).toContain('<title>x</title>\n<script src="/c.js" defer></script>\n</head>\n<body>');
  expect(out.match(/c\.js/g)).toHaveLength(1);
  expect(() => beforeHead("<html></html>", "x")).toThrow("no </head>");
});

test("the legal links of lernapps.net become paths, other addresses stay", () => {
  const html =
    '<a href="https://lernapps.net/privacy/">p</a> <a href="https://lernapps.net/imprint/">i</a> <a href="https://lernapps.net/apps/">a</a>';
  expect(localLegalLinks(html)).toBe(
    '<a href="/privacy/">p</a> <a href="/imprint/">i</a> <a href="https://lernapps.net/apps/">a</a>',
  );
});

test("the commands edit the files below a folder, the files named, and skip a file that is not there", () => {
  const dir = tempDir("html-edit");
  mkdirSync(join(dir, "a/b"), { recursive: true });
  writeFileSync(join(dir, "index.html"), page());
  writeFileSync(join(dir, "a/b/index.html"), page('<a href="https://lernapps.net/privacy/">p</a>'));
  writeFileSync(join(dir, "a/x.js"), "</head>");
  expect(edit("head-script", "/lernapps-count.js", dir).code).toBe(0);
  expect(readFileSync(join(dir, "index.html"), "utf8")).toContain(
    '<script src="/lernapps-count.js" defer></script>\n</head>',
  );
  expect(readFileSync(join(dir, "a/b/index.html"), "utf8")).toContain("lernapps-count.js");
  expect(readFileSync(join(dir, "a/x.js"), "utf8")).toBe("</head>");
  expect(edit("local-legal-links", dir).code).toBe(0);
  expect(readFileSync(join(dir, "a/b/index.html"), "utf8")).toContain('<a href="/privacy/">p</a>');
  const linked = edit("head-link", "../spa.css", join(dir, "index.html"), join(dir, "missing.html"));
  expect(linked.code, linked.stderr).toBe(0);
  expect(readFileSync(join(dir, "index.html"), "utf8")).toContain(
    'defer></script>\n<link rel="stylesheet" href="../spa.css">\n</head>',
  );
  expect(edit("nonsense").code).toBe(2);
});
