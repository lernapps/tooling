// The contract of the shared preset, end to end, on the quiz app from `lernapps create` (test/app-fixture.ts,
// shared by the test files and copied here): the app only extends the preset (vite.config.ts, tsconfig.json and the
// hooks of @lernapps/tooling, nothing configured of its own), and gets every lint rule and both git hooks.
//   - `npm install` installs the hooks of the package;
//   - each lint rule gives its verdict on a source snippet, through the preset's configuration: every snippet is its
//     own file, and one `vp lint` run reports on all of them.
// That the hooks stop a commit with a lint error and a push with a request to another host, and that the helpers
// (storage, i18n, a11y) and the Playwright configuration work in the app, is tested once, with the app check action
// that must find the same: app-check.e2e.test.ts.
import { mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { basename, join } from "node:path";
import { beforeAll, describe, expect, test } from "vite-plus/test";
import { quizApp } from "./app-fixture.ts";
import { ok, repoRoot, run, type Result } from "./support.ts";

const inner = process.env["LERNAPPS_E2E_INNER"] === "1";
const SLOW = 15 * 60 * 1000;
const RULES = "https://lernapps.net/tooling/rules/#";
const HOOKS = "node_modules/@lernapps/tooling/archetypes/shared/hooks";

const output = (result: Result) => `${result.stdout}\n${result.stderr}`;

/**
 * Snippets with the verdict of each lint rule, each its own file in the app. `rule` is the rule as Oxlint names
 * it in its output; every lint rule of the package (lint/rules/<id>.ts) has cases here.
 */
const verdicts: { rule: string; name: string; snippet: string; reported: boolean; file?: string }[] = [
  {
    rule: "lernapps(no-request-before-click)",
    name: "a URL of another host",
    snippet: 'export const font = "https://fonts.example.org/inter.woff2";\n',
    reported: true,
  },
  {
    rule: "lernapps(no-request-before-click)",
    name: "a protocol-relative URL in a template",
    snippet: "export const load = (name: string) => fetch(`//cdn.example.org/${name}.json`);\n",
    reported: true,
  },
  {
    rule: "lernapps(no-request-before-click)",
    name: "links to lernapps.net, an XML namespace and a relative URL",
    snippet:
      'export const imprint = "https://lernapps.net/imprint/";\n' +
      'export const svg = "http://www.w3.org/2000/svg";\n' +
      'export const data = "./data.json";\n',
    reported: false,
  },
  {
    rule: "lernapps(storage-through-wrapper)",
    name: "localStorage used directly",
    snippet: 'localStorage.setItem("count", "1");\nexport {};\n',
    reported: true,
  },
  {
    rule: "lernapps(storage-through-wrapper)",
    name: "IndexedDB through window",
    snippet: 'export const open = () => window.indexedDB.open("brueche");\n',
    reported: true,
  },
  {
    rule: "lernapps(storage-through-wrapper)",
    name: "a cookie",
    snippet: 'document.cookie = "besuch=1";\nexport {};\n',
    reported: true,
  },
  {
    rule: "lernapps(storage-through-wrapper)",
    name: "the preset's storage, and a property named localStorage",
    snippet:
      'import { createStorage } from "@lernapps/tooling/storage";\n\n' +
      'export const storage = createStorage("brueche");\n' +
      "export const settings = { localStorage: false };\n",
    reported: false,
  },
  {
    rule: "lernapps(learner-text-german)",
    name: "a text written into the page",
    snippet: 'export const praise = (element: HTMLElement) => {\n  element.textContent = "Richtig!";\n};\n',
    reported: true,
  },
  {
    rule: "lernapps(learner-text-german)",
    name: "a label set as an attribute",
    snippet:
      'export const label = (element: HTMLElement) => {\n  element.setAttribute("aria-label", "Nächste Aufgabe");\n};\n',
    reported: true,
  },
  {
    rule: "lernapps(learner-text-german)",
    name: "the document's title",
    snippet: 'document.title = "Brüche üben";\nexport {};\n',
    reported: true,
  },
  {
    rule: "lernapps(learner-text-german)",
    name: "texts from the message file, numbers and symbols",
    snippet:
      'import de from "./messages/de.json";\n\n' +
      "export const show = (element: HTMLElement, count: number) => {\n" +
      "  element.textContent = de.next;\n" +
      '  element.setAttribute("aria-label", de.solved);\n' +
      '  element.title = "–";\n' +
      "  element.dataset['count'] = String(count);\n" +
      '  new URLSearchParams().append("thema", "brueche");\n' +
      "};\n",
    reported: false,
  },
  {
    rule: "lernapps(suppression-reason)",
    name: "a suppression without a reason",
    snippet:
      "export const reset = () => {\n" +
      "  // oxlint-disable-next-line lernapps/storage-through-wrapper\n" +
      "  localStorage.clear();\n" +
      "};\n",
    reported: true,
  },
  {
    rule: "lernapps(suppression-reason)",
    name: "@ts-ignore",
    snippet: '// @ts-ignore\nexport const count: number = "drei";\n',
    reported: true,
  },
  {
    rule: "lernapps(suppression-reason)",
    name: "suppressions with their reasons",
    snippet:
      "export const reset = () => {\n" +
      "  // oxlint-disable-next-line lernapps/storage-through-wrapper -- removes the data of the app's first version\n" +
      "  localStorage.clear();\n" +
      "};\n" +
      "// @ts-expect-error -- a planted type error with its reason\n" +
      'export const count: number = "drei";\n',
    reported: false,
  },
  // Component code: the <script setup> of a .vue file, and the modules of src/components/ (lint/component.ts).
  {
    rule: "lernapps(vue-component-no-network)",
    name: "fetch in a component, and an import from a URL",
    file: "src/verdicts/Netz.vue",
    snippet:
      '<script setup lang="ts">\n' +
      'import confetti from "https://cdn.example.org/confetti.js";\n\n' +
      'const count = await fetch("./count.json").then((response) => response.json());\n' +
      "confetti();\n" +
      "</script>\n\n<template>\n  <p>{{ count }}</p>\n</template>\n",
    reported: true,
  },
  {
    rule: "lernapps(vue-component-no-network)",
    name: "a request through window in a logic module",
    file: "src/components/Netz.ts",
    snippet: 'export const load = () => window.fetch("./aufgaben.json");\n',
    reported: true,
  },
  {
    rule: "lernapps(vue-component-no-html-injection)",
    name: "innerHTML and eval in a component",
    file: "src/verdicts/Html.vue",
    snippet:
      '<script setup lang="ts">\n' +
      'import { onMounted, ref } from "vue";\n\n' +
      "const box = ref<HTMLElement>();\n" +
      'const count = eval("1 + 1") as number;\n' +
      "onMounted(() => {\n" +
      "  if (box.value) box.value.innerHTML = `<b>${count}</b>`;\n" +
      "});\n" +
      '</script>\n\n<template>\n  <p ref="box">{{ count }}</p>\n</template>\n',
    reported: true,
  },
  {
    rule: "lernapps(vue-component-imports)",
    name: "an import from another package",
    file: "src/verdicts/Paket.vue",
    snippet:
      '<script setup lang="ts">\n' +
      'import { shuffle } from "lodash-es";\n\n' +
      "const count = shuffle([1, 2, 3]).length;\n" +
      "</script>\n\n<template>\n  <p>{{ count }}</p>\n</template>\n",
    reported: true,
  },
  {
    rule: "lernapps(vue-component-browser-globals)",
    name: "window outside onMounted",
    file: "src/verdicts/Breite.vue",
    snippet:
      '<script setup lang="ts">\n' +
      "const count = window.innerWidth;\n" +
      "</script>\n\n<template>\n  <p>{{ count }}</p>\n</template>\n",
    reported: true,
  },
  {
    rule: "lernapps(storage-through-wrapper)",
    name: "localStorage in a component",
    file: "src/verdicts/Speicher.vue",
    snippet:
      '<script setup lang="ts">\n' +
      'import { onMounted, ref } from "vue";\n\n' +
      "const count = ref(0);\n" +
      'onMounted(() => (count.value = Number(localStorage.getItem("count"))));\n' +
      "</script>\n\n<template>\n  <p>{{ count }}</p>\n</template>\n",
    reported: true,
  },
  {
    rule: "lernapps(vue-component-browser-globals)",
    name: "a component as the build expects it: browser globals in onMounted, imports from vue, the tooling and its folder",
    file: "src/verdicts/Gut.vue",
    snippet:
      '<script setup lang="ts">\n' +
      'import { onMounted, onUnmounted, ref } from "vue";\n' +
      'import { createStorage } from "@lernapps/tooling/storage";\n' +
      'import { double } from "./gut.ts";\n\n' +
      "const props = defineProps<{ start: number; label: string }>();\n" +
      "const count = ref(double(props.start));\n" +
      'const storage = createStorage("verdicts");\n' +
      "const resize = (event: UIEvent) => (count.value = (event.target as Window).innerWidth);\n" +
      "onMounted(() => {\n" +
      '  window.addEventListener("resize", resize);\n' +
      "  document.title = props.label;\n" +
      '  storage.save("count", count.value);\n' +
      "});\n" +
      'onUnmounted(() => window.removeEventListener("resize", resize));\n' +
      "</script>\n\n<template>\n  <p>{{ count }}</p>\n</template>\n",
    reported: false,
  },
  {
    rule: "lernapps(vue-component-no-network)",
    name: "the same component, and a property named fetch",
    file: "src/verdicts/gut.ts",
    snippet: "export const double = (value: number) => value * 2;\nexport const options = { fetch: false };\n",
    reported: false,
  },
  {
    rule: "lernapps(vue-component-no-html-injection)",
    name: "a component that lets its template render the text",
    file: "src/verdicts/Text.vue",
    snippet:
      '<script setup lang="ts">\n' +
      "const props = defineProps<{ html: string }>();\n" +
      "const count = props.html.length;\n" +
      "</script>\n\n<template>\n  <p>{{ count }}</p>\n</template>\n",
    reported: false,
  },
  {
    rule: "lernapps(vue-component-imports)",
    name: "type imports from anywhere, the runtime, and its own folder",
    file: "src/components/Gut.ts",
    snippet:
      'import type { UserConfig } from "vite-plus";\n' +
      'import { double } from "./Doppelt.ts";\n\n' +
      "export const config: UserConfig = {};\n" +
      "export const twice = (value: number) => double(value);\n",
    reported: false,
  },
  {
    rule: "lernapps(learner-text-german)",
    name: "a text in a component, which gets its texts through its props",
    file: "src/verdicts/Titel.vue",
    snippet:
      '<script setup lang="ts">\n' +
      'import { onMounted } from "vue";\n\n' +
      "const count = 1;\n" +
      'onMounted(() => (document.title = "Brüche üben"));\n' +
      "</script>\n\n<template>\n  <p>{{ count }}</p>\n</template>\n",
    reported: false,
  },
  {
    rule: "typescript(no-explicit-any)",
    name: "any",
    snippet: "export const value: any = 1;\n",
    reported: true,
  },
];

interface Diagnostic {
  code: string;
  filename: string;
  message: string;
  url?: string;
  help?: string;
}

describe.skipIf(inner)("an app that only extends the preset", () => {
  let app = "";
  /** The diagnostics of one `vp lint` run over every snippet, each in its own file. */
  let diagnostics: Diagnostic[] = [];
  let lint: Result;
  const file = (index: number) => verdicts[index]?.file ?? `src/verdicts/snippet-${String(index).padStart(2, "0")}.ts`;

  beforeAll(() => {
    app = quizApp();
    mkdirSync(join(app, "src/verdicts/messages"), { recursive: true });
    // the app's message file, as the snippets that show learner texts import it
    writeFileSync(
      join(app, "src/verdicts/messages/de.json"),
      `${JSON.stringify({ next: "Nächste Aufgabe", solved: "Du hast {count} Aufgaben gelöst." }, null, 2)}\n`,
    );
    mkdirSync(join(app, "src/components"), { recursive: true });
    writeFileSync(join(app, "src/components/Doppelt.ts"), "export const double = (value: number) => value * 2;\n");
    for (const [index, verdict] of verdicts.entries()) writeFileSync(join(app, file(index)), verdict.snippet);
    lint = run(join(app, "node_modules/.bin/vp"), ["lint", "--format", "json", "src/verdicts", "src/components"], app);
    diagnostics = (JSON.parse(lint.stdout) as { diagnostics: Diagnostic[] }).diagnostics;
  }, SLOW);

  test("npm install installs the hooks of the preset", () => {
    expect(ok("git", ["config", "core.hooksPath"], app).stdout.trim()).toBe(`${HOOKS}/_`);
  });

  test.each(verdicts.map((verdict, index) => ({ ...verdict, index })))(
    "$rule on $name: reported $reported",
    ({ rule, reported, index }) => {
      const found = diagnostics.filter((diagnostic) => diagnostic.filename === file(index) && diagnostic.code === rule);
      if (reported) {
        expect(found, output(lint)).not.toEqual([]);
        const id = /^lernapps\((.+)\)$/.exec(rule)?.[1];
        if (id !== undefined) expect(JSON.stringify(found)).toContain(`${RULES}${id}`);
      } else {
        expect(found, output(lint)).toEqual([]);
      }
    },
  );

  test("the snippets that report nothing pass the lint", () => {
    const clean = verdicts.flatMap((verdict, index) => (verdict.reported ? [] : [file(index)]));
    const dirty = diagnostics.filter((diagnostic) => clean.includes(diagnostic.filename));
    expect(dirty, JSON.stringify(dirty)).toEqual([]);
  });
});

// Not inside a test copy: the rule catalog's tests plant lint rules there that have no snippets.
test.skipIf(inner)("every lint rule of the package has a reported and a passing snippet", () => {
  const ids = readdirSync(join(repoRoot, "lint/rules"))
    .filter((file) => file.endsWith(".ts"))
    .map((file) => basename(file, ".ts"));
  expect(ids.length).toBeGreaterThan(0);
  for (const id of ids) {
    const cases = verdicts.filter((verdict) => verdict.rule === `lernapps(${id})`);
    expect(
      cases.map((verdict) => verdict.reported),
      id,
    ).toEqual(expect.arrayContaining([true, false]));
  }
});
