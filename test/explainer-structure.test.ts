// The structure checks of an explainer in format 2, as `lernapps check` runs them in an app's repo: explainer-text-load
// (text to read, text in a row, what comes first), explainer-repetition (a phrase two blocks of a page both say) and
// explainer-interaction (exercises that are only guessable choices, or all of one kind). Each a hint, each on files
// alone: a page that keeps the limits passes, a page that does not is named with what was counted.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, expect, test } from "vite-plus/test";
import type { Problem } from "../check/check.ts";
import interaction from "../check/rules/explainer-interaction.ts";
import pageVariety from "../check/rules/explainer-page-variety.ts";
import visual from "../check/rules/explainer-visual.ts";
import repetition from "../check/rules/explainer-repetition.ts";
import textLoad from "../check/rules/explainer-text-load.ts";
import { measurePage } from "../check/explainer-structure.ts";
import { tempDir } from "./support.ts";

/** An explainer's repo with one chapter and the pages given (id → the lines of the page after its title). */
function explainer(pages: Record<string, string>): string {
  const dir = tempDir("explainer-structure");
  const files: Record<string, string> = {
    "src/app.yaml": "format: 2\nstrand: none\ntitle: Test\nintro: Ein Test.\nlanguages: [de]\nchapters: [kapitel]\n",
    "src/kapitel/chapter.yaml": `title: Kapitel\npages: [${Object.keys(pages).join(", ")}]\n`,
  };
  for (const [page, body] of Object.entries(pages)) files[`src/kapitel/${page}.yaml`] = `title: ${page}\n${body}`;
  for (const [file, content] of Object.entries(files)) {
    mkdirSync(dirname(join(dir, file)), { recursive: true });
    writeFileSync(join(dir, file), content);
  }
  return dir;
}

const words = (n: number, word = "wort") => Array.from({ length: n }, (_, i) => `${word}${i}`).join(" ");
const text = (t: string) => `  - type: text\n    text: ${JSON.stringify(t)}\n`;
const figure = "  - type: figure\n    image: images/a.svg\n    alt: Bild\n    caption: Bild\n";
const choice = (id: string, kind = "single-choice") =>
  `  - type: ${kind}\n    id: ${id}\n    text: Frage ${id}?\n    options:\n      - { text: a, correct: true, info: Gut. }\n      - { text: b, correct: false, info: Nein. }\n    explanation: Weil.\n`;
const number = (id: string) =>
  `  - type: number\n    id: ${id}\n    text: Wie viel ${id}?\n    answer: 3\n    explanation: Drei.\n`;
const page = (...blocks: string[]) => `blocks:\n${blocks.join("")}`;

const run = (check: { run: (c: { project: string }) => unknown }, project: string) =>
  check.run({ project }) as Problem[] | undefined;

describe("measurePage", () => {
  test("counts reading text apart from the words of the exercises, and finds the first activity and the longest run", () => {
    const m = measurePage(page(text("eins zwei drei"), text("vier fünf"), figure, choice("a")));
    expect(m.proseWords).toBe(5);
    expect(m.longestProseRun).toBe(2);
    expect(m.firstActivity).toBe(3);
    expect(m.exercises).toEqual(["single-choice"]);
    expect(m.feedbackWords).toBeGreaterThan(0);
  });

  test("reads the blocks of a section and of a box in order", () => {
    const m = measurePage(
      "blocks:\n  - type: section\n    id: s\n    title: S\n    blocks:\n      - type: example\n        title: E\n        blocks:\n          - type: text\n            text: eins zwei\n",
    );
    expect(m.proseWords).toBe(2);
    expect(m.firstActivity).toBe(0);
  });

  test("finds a phrase of five words that two blocks both say", () => {
    const m = measurePage(
      page(text("Zu je gehört suis immer, merke dir das."), text("Merke: zu je gehört suis immer, sagt man.")),
    );
    expect(m.repeated).toContain("zu je gehört suis immer");
    expect(
      measurePage(page(text("ganz verschiedene Wörter hier"), text("nichts davon kommt wieder vor"))).repeated,
    ).toEqual([]);
  });
});

describe("explainer-text-load", () => {
  test("checks nothing without an explainer in format 2", () => {
    expect(run(textLoad, tempDir("no-app"))).toBeUndefined();
  });

  test("a short page with a figure first passes", () => {
    expect(run(textLoad, explainer({ a: page(figure, text("kurz"), choice("a")) }))).toEqual([]);
  });

  test("a long page, a long run of text, and a late first activity are named with the numbers", () => {
    const long = run(textLoad, explainer({ a: page(text(words(400)), figure) }));
    expect(long).toEqual([
      expect.objectContaining({
        where: expect.stringContaining("a.yaml"),
        found: expect.stringContaining("400 words of text"),
      }),
    ]);
    const wall = run(
      textLoad,
      explainer({ a: page(text("a b"), text("c d"), text("e f"), text("g h"), text("i j"), figure) }),
    );
    expect(wall?.[0]?.found).toContain("5 text blocks in a row");
    expect(wall?.[0]?.found).toContain("the first figure, table or exercise is block 6");
    expect(textLoad.severity).toBe("hint");
  });

  describe("a reading text (Lesestück)", () => {
    const mark = "  # reading-text\n";
    const section = (marked: boolean, ...blocks: string[]) =>
      `${marked ? mark : ""}  - type: section\n    id: lesen\n    title: Lesen\n    blocks:\n${blocks.map((b) => b.replace(/^(?=.)/gm, "    ")).join("")}`;

    test("counts apart when the line above the block says so, and not otherwise", () => {
      const reading = explainer({ a: page(figure, `${mark}${text(words(400))}`, choice("a")) });
      expect(run(textLoad, reading)).toEqual([]);
      const plain = explainer({ a: page(figure, text(words(400)), choice("a")) });
      expect(run(textLoad, plain)?.[0]?.found).toContain("400 words of text");
      const m = measurePage(page(figure, `${mark}${text(words(400))}`, text("eins zwei")));
      expect(m.readingWords).toBe(400);
      expect(m.proseWords).toBe(2);
    });

    test("marks every block of a marked section, also with a comment or a blank line between", () => {
      const m = measurePage(
        page(
          section(true, text("a b c"), text("d e")),
          `  # reading-text\n\n  # eine Anmerkung\n${text("x y")}`,
          text("z"),
        ),
      );
      expect(m.readingWords).toBe(7);
      expect(m.proseWords).toBe(1);
      expect(measurePage(page(section(false, text("a b c")))).readingWords).toBe(0);
    });

    test("a reading text longer than the limit is named apart, with the way to mark it in the fix", () => {
      const found = run(textLoad, explainer({ a: page(figure, `${mark}${text(words(700))}`, choice("a")) }));
      expect(found?.[0]?.found).toContain("700 words of reading text (more than 600)");
      expect(found?.[0]?.fix).toContain("# reading-text");
    });
  });
});

describe("explainer-repetition", () => {
  test("a page that says things once passes", () => {
    expect(
      run(repetition, explainer({ a: page(text("Verschiedene Sätze sagen verschiedene Dinge."), choice("a")) })),
    ).toEqual([]);
  });

  test("a sentence said in the text and again in an exercise is not named: repeating in another part is a way to teach", () => {
    const sentence = `${words(30, "satz")} zu je gehört suis`;
    const exercise = `  - type: number\n    id: n\n    text: Wie viel?\n    answer: 3\n    explanation: ${JSON.stringify(sentence)}\n`;
    expect(run(repetition, explainer({ a: page(text(sentence), exercise) }))).toEqual([]);
  });

  test("a sentence said again in two text blocks is named", () => {
    const sentence = `${words(30, "satz")} zu je gehört suis`;
    const dir = explainer({ a: page(text(sentence), text(sentence), text(sentence)) });
    expect(run(repetition, dir)).toEqual([
      expect.objectContaining({ found: expect.stringContaining("phrases of five words") }),
    ]);
    expect(repetition.severity).toBe("hint");
  });
});

describe("explainer-interaction", () => {
  test("a page with fewer than four exercises is named from four pages on, a recap page is left out", () => {
    const two = page(choice("a"), choice("b"));
    const four = page(choice("a"), choice("b", "multiple-choice"), number("c"), number("d"));
    const problems = run(interaction, explainer({ a: two, b: four, c: four, d: four }));
    expect(problems).toEqual([expect.objectContaining({ found: expect.stringContaining("only 2 exercises") })]);
    expect(run(interaction, explainer({ a: two }))).toEqual([]);
    const recap = "recap: mathematik/prozent\nblocks: []\n";
    expect(run(interaction, explainer({ a: recap, b: four, c: four, d: four }))).toEqual([]);
  });

  test("a page of guessable choices only is named, also when they are all of one kind", () => {
    const problems = run(interaction, explainer({ a: page(choice("a"), choice("b"), choice("c")) }));
    expect(problems?.[0]?.found).toContain("3 of 3 exercises are choices");
    expect(problems?.[0]?.found).toContain("all 3 exercises are of one kind");
    expect(interaction.severity).toBe("hint");
  });

  test("a number or a component among the choices passes", () => {
    expect(
      run(interaction, explainer({ a: page(choice("a"), choice("b", "true-false"), number("c"), number("d")) })),
    ).toEqual([]);
    const component = "  - type: vue-component\n    component: X\n    nojs: x\n";
    expect(
      run(interaction, explainer({ a: page(component, choice("a"), choice("b"), choice("c", "multiple-choice")) })),
    ).toEqual([]);
  });
});

describe("explainer-page-variety", () => {
  const pageWith = (...kinds: string[]) =>
    page(...kinds.map((kind, i) => (kind === "number" ? number(`n${i}`) : choice(`c${i}`, kind))));

  test("checks nothing without an explainer in format 2, and with fewer than four pages", () => {
    expect(run(pageVariety, tempDir("no-app"))).toBeUndefined();
    const same = pageWith("single-choice", "number");
    expect(run(pageVariety, explainer({ a: same, b: same, c: same }))).toEqual([]);
  });

  test("pages that practise with different kinds pass", () => {
    const dir = explainer({
      a: pageWith("single-choice", "number"),
      b: pageWith("true-false", "number"),
      c: pageWith("multiple-choice", "number"),
      d: pageWith("single-choice", "true-false"),
    });
    expect(run(pageVariety, dir)).toEqual([]);
  });

  test("half of the pages or more with the same set of kinds is a hint that names the set", () => {
    const same = pageWith("single-choice", "number");
    const dir = explainer({ a: same, b: same, c: same, d: pageWith("true-false", "number") });
    expect(run(pageVariety, dir)).toEqual([
      expect.objectContaining({ found: "3 of 4 pages practise with the same exercise kinds (number, single-choice)" }),
    ]);
    expect(pageVariety.severity).toBe("hint");
  });
});

describe("explainer-visual", () => {
  test("checks nothing without an explainer in format 2, and with fewer than four pages", () => {
    expect(run(visual, tempDir("no-app"))).toBeUndefined();
    expect(run(visual, explainer({ a: page(text("kurz")) }))).toBeUndefined();
  });

  test("an app where half of the pages have a figure or a formula passes; tables alone do not count", () => {
    const withFigure = page(figure, text("kurz"));
    const plain = page(text("kurz"));
    expect(run(visual, explainer({ a: withFigure, b: withFigure, c: plain, d: plain }))).toEqual([]);
    const table = "  - type: table\n    caption: T\n    header: [a, b]\n    rows: [[c, d]]\n";
    const problems = run(visual, explainer({ a: withFigure, b: page(table), c: page(table), d: plain }));
    expect(problems).toEqual([
      expect.objectContaining({
        found: "1 of 4 pages have a figure, formula, code, quote, timeline, video or component",
      }),
    ]);
    expect(visual.severity).toBe("hint");
  });
});
