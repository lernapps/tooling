// The contract of the generator and the quiz archetype, end to end: `lernapps create --archetype quiz` in a
// temporary folder, then a question bank, gives an app that passes `lernapps check` without further code.
//   - the generator fails on an unknown archetype and on a folder that is not empty;
//   - it writes the template of app-templates at the pinned commit, with the runtime of that commit as dependency,
//     AGENTS.md, the plan, the workflows, LICENSE, the issue form for content errors; it keeps a plan already there;
//   - the app with the fixture bank (test/fixtures/quiz/quiz.json, every type of question) passes `lernapps check`;
//   - in the browser, each type accepts a right answer and rejects a wrong one; then every option's background
//     shows, the right one and the learner's choice marked, with the explanation and links for further reading; a
//     deep link opens its question; the seed in the address gives the order; the page reads without JavaScript,
//     with the same in the answer key at the end;
//   - a broken bank fails the build with a message naming the question and the problem.
// The templates and the runtime come from a local clone of lernapps/app-templates with the pinned commit, named by
// LERNAPPS_TEMPLATES (CI checks it out); without it, the tests that need them are skipped. The packages are installed
// from git.
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { chromium, type Browser, type Page } from "playwright";
import { afterAll, beforeAll, describe, expect, test } from "vite-plus/test";
import { serve } from "../check/visit.ts";
import { frontMatter, frontMatterErrors } from "./plan.ts";
import { freshClone, ok, repoRoot, run, tempDir, type Result } from "./support.ts";

const inner = process.env["LERNAPPS_E2E_INNER"] === "1";
const templates = process.env["LERNAPPS_TEMPLATES"];
const SLOW = 15 * 60 * 1000;
const cli = join(repoRoot, "src/cli.ts");
const BANK = join(repoRoot, "test/fixtures/quiz/quiz.json");

const output = (result: Result) => `${result.stdout}\n${result.stderr}`;
const lernapps = (args: readonly string[], cwd: string) => run("node", [cli, ...args], cwd);

describe.skipIf(inner)("lernapps create refuses", () => {
  test("an unknown archetype, naming the known ones", () => {
    const dir = tempDir("create-unknown");
    const result = lernapps(["create", "--archetype", "essay", dir], repoRoot);
    expect(result.code, output(result)).toBe(2);
    expect(result.stderr).toContain("unknown archetype: essay (known: quiz)");
  });

  test("a folder that is not empty, naming what is there", () => {
    const dir = tempDir("create-full");
    writeFileSync(join(dir, "README.md"), "# Mein Quiz\n");
    const result = lernapps(["create", "--archetype", "quiz", dir], repoRoot);
    expect(result.code, output(result)).toBe(1);
    expect(result.stderr).toContain("is not empty (README.md)");
    expect(existsSync(join(dir, "package.json"))).toBe(false);
  });

  test("an app-templates it cannot fetch, saying how to name a local clone", () => {
    const dir = tempDir("create-offline");
    const result = lernapps(["create", "--archetype", "quiz", dir, "--templates", join(dir, "nowhere")], repoRoot);
    expect(result.code, output(result)).toBe(1);
    expect(result.stderr).toContain("cannot fetch app-templates");
    expect(result.stderr).toContain("LERNAPPS_TEMPLATES");
  });
});

describe.skipIf(inner || templates === undefined)("a quiz app from lernapps create", () => {
  let app = "";
  let tooling = "";
  let browser: Browser;
  let base = "";
  let close = () => {};

  beforeAll(async () => {
    tooling = freshClone();
    app = join(tempDir("quiz"), "naturwunder");
    const created = lernapps(["create", "--archetype", "quiz", app, "--tooling", `git+file://${tooling}`], repoRoot);
    if (created.code !== 0) throw new Error(output(created));
    ok("git", ["init", "--quiet", "--initial-branch=main"], app);
    ok("npm", ["install", "--no-audit", "--no-fund"], app);
    cpSync(BANK, join(app, "src/quiz.json"));
    ok(join(app, "node_modules/.bin/vp"), ["fmt"], app); // as the pre-commit hook formats it
    browser = await chromium.launch();
  }, SLOW);

  afterAll(async () => {
    close();
    await browser?.close();
  });

  test("it writes the template and the files every app has", () => {
    for (const file of [
      "index.html",
      "src/main.ts",
      "vite.config.ts",
      "tsconfig.json",
      "playwright.config.ts",
      "e2e/quiz.e2e.ts",
      "AGENTS.md",
      "LICENSE",
      "renovate.json",
      ".github/workflows/pages.yml",
      ".github/ISSUE_TEMPLATE/inhaltsfehler.yml",
    ]) {
      expect(existsSync(join(app, file)), file).toBe(true);
    }
    const manifest = JSON.parse(readFileSync(join(app, "package.json"), "utf8")) as {
      name: string;
      devDependencies: Record<string, string>;
    };
    expect(manifest.name).toBe("naturwunder");
    expect(manifest.devDependencies["@lernapps/tooling"]).toBe(`git+file://${tooling}`);
    // the runtime of the commit the template was copied from, installed from the same clone
    const pin = (
      JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8")) as { appTemplates: { commit: string } }
    ).appTemplates.commit;
    expect(manifest.devDependencies["@lernapps/app-templates"]).toBe(`git+file://${resolve(templates ?? "")}#${pin}`);
    expect(existsSync(join(app, ".npmrc"))).toBe(false);
    expect(readFileSync(join(app, "AGENTS.md"), "utf8")).toBe(
      readFileSync(join(repoRoot, "guidance/AGENTS.md"), "utf8"),
    );
    const config = readFileSync(join(app, "vite.config.ts"), "utf8");
    expect(config).toContain('from "@lernapps/tooling/preset"');
    expect(config).toContain('from "@lernapps/app-templates/quiz/plugin"');
    expect(config).toContain("lernapps({ plugins: [quiz()] })");
    expect(readFileSync(join(app, "LICENSE"), "utf8")).toContain(`Copyright (c) ${new Date().getFullYear()}`);
    const pages = readFileSync(join(app, ".github/workflows/pages.yml"), "utf8");
    expect(pages).toMatch(/uses: lernapps\/tooling\/actions\/site-check@[0-9a-f]{40} # main/);
    expect(pages).toMatch(/uses: lernapps\/tooling\/actions\/site-deploy@[0-9a-f]{40} # main/);
  });

  test("it starts the plan in Code, for the archetype quiz", () => {
    const plan = join(app, ".vibe/plan.md");
    expect(frontMatterErrors(join(repoRoot, "guidance/plan-front-matter.v1.schema.json"), plan)).toEqual([]);
    expect(frontMatter(readFileSync(plan, "utf8"))).toEqual({ archetype: "quiz", phase: "code", prePushFailures: 0 });
  });

  test("it keeps the plan from the conversation", { timeout: SLOW }, () => {
    const dir = join(tempDir("plan"), "app");
    mkdirSync(join(dir, ".vibe"), { recursive: true });
    ok("git", ["init", "--quiet"], dir);
    const plan = readFileSync(join(repoRoot, "test/fixtures/plans/filled.md"), "utf8");
    writeFileSync(join(dir, ".vibe/plan.md"), plan);
    const result = lernapps(["create", "--archetype", "quiz", dir], repoRoot);
    expect(result.code, output(result)).toBe(0);
    expect(readFileSync(join(dir, ".vibe/plan.md"), "utf8")).toBe(plan);
    expect(existsSync(join(dir, "src/quiz.json"))).toBe(true);
  });

  test("with the fixture bank, the app passes lernapps check", { timeout: SLOW }, () => {
    const result = run("npx", ["--no", "--", "lernapps", "check"], app);
    expect(result.code, output(result)).toBe(0);
    expect(result.stdout).toMatch(/^lernapps check: ok/);
  });

  test("npm run build writes the site for the site actions", { timeout: SLOW }, () => {
    ok("npm", ["run", "build"], app);
    expect(readFileSync(join(app, "_site/index.html"), "utf8")).toContain("Naturwunder der Welt");
  });

  describe("in the browser", () => {
    beforeAll(async () => {
      ok(join(app, "node_modules/.bin/vp"), ["build"], app);
      const served = await serve(join(app, "dist"), "/naturwunder/");
      base = served.base;
      close = () => served.server.close();
    }, SLOW);

    const open = async (address: string, javaScript = true): Promise<Page> => {
      const context = await browser.newContext({ javaScriptEnabled: javaScript });
      const page = await context.newPage();
      await page.goto(new URL(address, base).href);
      return page;
    };
    const question = (page: Page, id: string) => page.locator(`#frage-${id}`);
    /** Text as one line: the layout's line breaks do not matter here. */
    const flat = (text: string) => text.replace(/\s+/g, " ").trim();
    /** Checks the answer; returns what the learner reads then: right or wrong, and what the question reveals. */
    const check = async (page: Page, id: string) => {
      await question(page, id).getByRole("button", { name: "Prüfen" }).click();
      const feedback = (await question(page, id).locator(".quiz-feedback").innerText()).trim();
      return flat(`${feedback} ${await question(page, id).locator(".quiz-reveal").innerText()}`);
    };
    const choose = async (page: Page, id: string, values: readonly string[]) => {
      for (const value of values) await question(page, id).locator(`input[value="${value}"]`).check();
      return check(page, id);
    };
    const place = async (page: Page, id: string, key: string, values: readonly number[]) => {
      for (const [index, value] of values.entries()) {
        await question(page, id).locator(`select[data-${key}="${index}"]`).selectOption(String(value));
      }
      return check(page, id);
    };
    const type = async (page: Page, id: string, text: string) => {
      await question(page, id).locator("input").fill(text);
      return check(page, id);
    };

    const colorado = "Der Colorado ist der größte Fluss im Südwesten Nordamerikas. Er ist gut 2300 km lang.";
    /** Per question of the fixture bank: a right and a wrong answer, and what the learner reads after each. */
    const answers: {
      id: string;
      give: (page: Page, right: boolean) => Promise<string>;
      onRight: readonly string[];
      onWrong: readonly string[];
    }[] = [
      {
        id: "grand-canyon",
        give: (page, right) => choose(page, "grand-canyon", [right ? "0" : "1"]),
        onRight: [`Colorado richtige Antwort deine Wahl ${colorado}`, "Mit rund 6650 km gilt er als längster Fluss"],
        onWrong: ["Nil deine Wahl", `Colorado richtige Antwort ${colorado}`],
      },
      {
        id: "weltnaturerbe",
        give: (page, right) => choose(page, "weltnaturerbe", right ? ["0", "1", "2"] : ["0", "3"]),
        onRight: ["Victoriafälle richtige Antwort deine Wahl", "nur auf der Liste der Vorschläge"],
        onWrong: ["Mont Blanc deine Wahl", "Kilimandscharo richtige Antwort Der Kilimandscharo"],
      },
      {
        id: "totes-meer",
        give: (page, right) => choose(page, "totes-meer", [right ? "true" : "false"]),
        onRight: ["Richtige Antwort: Die Aussage stimmt.", "mehr als 440 m unter dem Meeresspiegel"],
        onWrong: ["Richtige Antwort: Die Aussage stimmt."],
      },
      {
        id: "everest-hoehe",
        give: (page, right) => type(page, "everest-hoehe", right ? "8900" : "8700"),
        onRight: ["Richtige Antwort: 8.848 m (erlaubte Abweichung: 100 m)"],
        onWrong: ["Edmund Hillary und Tenzing Norgay"],
      },
      {
        id: "berge-ordnen",
        give: (page, right) => place(page, "berge-ordnen", "item", right ? [0, 1, 2, 3] : [1, 0, 2, 3]),
        onRight: ["1. Zugspitze, 2. Mont Blanc, 3. Kilimandscharo, 4. Mount Everest"],
        onWrong: ["Die Zugspitze ist mit 2962 m der höchste Berg Deutschlands."],
      },
      {
        id: "wasserfaelle-laender",
        give: (page, right) => place(page, "wasserfaelle-laender", "left", right ? [0, 1, 2] : [1, 2, 0]),
        onRight: ["Niagarafälle – USA und Kanada"],
        onWrong: ["Iguazú-Wasserfälle – Brasilien und Argentinien"],
      },
      {
        id: "galapagos",
        give: (page, right) => choose(page, "galapagos", [right ? "0" : "2"]),
        onRight: ["Galapagosinseln richtige Antwort deine Wahl"],
        onWrong: ["Great Barrier Reef deine Wahl", "Galapagosinseln richtige Antwort"],
      },
      {
        id: "uluru",
        give: (page, right) => choose(page, "uluru", [right ? "false" : "true"]),
        onRight: ["Richtige Antwort: Die Aussage stimmt nicht.", "Seit Oktober 2019"],
        onWrong: ["Richtige Antwort: Die Aussage stimmt nicht."],
      },
    ];

    test.each(answers)(
      "$id accepts the right answer, rejects a wrong one, and then shows what there is to know",
      async ({ id, give, onRight, onWrong }) => {
        const right = await open(`./#frage-${id}`);
        const accepted = await give(right, true);
        expect(accepted).toMatch(/^Richtig!/);
        for (const text of onRight) expect(accepted).toContain(text);
        const wrong = await open(`./#frage-${id}`);
        const rejected = await give(wrong, false);
        expect(rejected).toMatch(/^Leider nicht richtig\./);
        for (const text of onWrong) expect(rejected).toContain(text);
      },
    );

    test("a deep link opens its question, and only it", async () => {
      const page = await open("./?seed=7#frage-berge-ordnen");
      await expect.poll(() => question(page, "berge-ordnen").isVisible()).toBe(true);
      expect(await page.locator(".quiz-question:visible").count()).toBe(1);
    });

    test("the seed in the address gives the order; without one, the address gets one", async () => {
      const order = async (address: string) => {
        const page = await open(address);
        return { page, ids: await page.locator(".quiz-question").evaluateAll((items) => items.map((item) => item.id)) };
      };
      const first = await order("./?seed=11");
      const again = await order("./?seed=11");
      expect(again.ids).toEqual(first.ids);
      const others = await Promise.all([12, 13, 14].map((seed) => order(`./?seed=${seed}`)));
      expect(others.some((other) => other.ids.join() !== first.ids.join())).toBe(true);
      const fresh = await order("./");
      expect(new URL(fresh.page.url()).searchParams.get("seed")).toMatch(/^\d+$/);
    });

    test("all right answers give the full score, the solutions, and only the last result is stored", async () => {
      const page = await open("./?seed=3");
      expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
      for (let step = 0; step < answers.length; step++) {
        const id = await page.locator(".quiz-question:visible").getAttribute("data-id");
        const answer = answers.find((candidate) => candidate.id === id);
        if (answer === undefined) throw new Error(`no visible question at step ${step + 1}`);
        await answer.give(page, true);
        await question(page, answer.id).locator(".quiz-next").click();
      }
      expect(await page.locator(".quiz-score").innerText()).toBe("Du hast 8 von 8 Fragen richtig beantwortet.");
      expect(await page.locator("#loesungen").isVisible()).toBe(true);
      expect(await page.evaluate(() => Object.keys(localStorage))).toEqual(["lernapps:naturwunder:last-result"]);
    });

    test("without JavaScript, every question reads, with the answers at the end", async () => {
      const page = await open("./", false);
      const text = await page.locator("body").innerText();
      const bank = JSON.parse(readFileSync(BANK, "utf8")) as { questions: { id: string; text: string }[] };
      for (const { id, text: asked } of bank.questions) {
        expect(await question(page, id).locator("legend").innerText()).toBe(asked);
        expect(text.indexOf(asked)).toBeLessThan(text.search(/^Lösungen$/m));
      }
      const solutions = flat(await page.locator("#loesungen").innerText());
      expect(solutions).toContain(`Colorado richtige Antwort ${colorado}`);
      expect(solutions).toContain("Richtige Antwort: 8.848 m (erlaubte Abweichung: 100 m)");
      expect(solutions).toContain("1. Zugspitze, 2. Mont Blanc, 3. Kilimandscharo, 4. Mount Everest");
      expect(solutions).toContain("Niagarafälle – USA und Kanada");
      expect(solutions).toContain("Mehr dazu:");
      const reading = page.locator('#loesungen a[href="https://de.wikipedia.org/wiki/Grand_Canyon"]');
      expect(await reading.innerText()).toBe("Grand Canyon (Wikipedia)");
      expect(await reading.getAttribute("rel")).toBe("noopener");
      expect(await page.locator("#quellen").innerText()).toContain("Wikipedia, die freie Enzyklopädie");
      expect(await page.locator('a[href="https://lernapps.net/imprint/"]').count()).toBe(1);
      expect(await page.locator('a[href="https://lernapps.net/privacy/"]').count()).toBe(1);
    });
  });

  describe("a broken question bank", () => {
    const build = (bank: string): Result => {
      writeFileSync(join(app, "src/quiz.json"), bank);
      try {
        return run(join(app, "node_modules/.bin/vp"), ["build"], app);
      } finally {
        cpSync(BANK, join(app, "src/quiz.json"));
      }
    };
    const bank = () => JSON.parse(readFileSync(BANK, "utf8")) as { questions: Record<string, unknown>[] };

    test("a single choice with two correct options fails the build, naming the question", { timeout: SLOW }, () => {
      const broken = bank();
      const options = broken.questions[0]?.["options"] as { correct: boolean }[];
      for (const option of options) option.correct = true;
      const result = build(JSON.stringify(broken));
      expect(result.code).not.toBe(0);
      expect(output(result)).toContain("src/quiz.json is not a valid question bank");
      expect(output(result)).toContain(
        'questions[0] (question "grand-canyon"): a single-choice question needs exactly one correct option; it has 4',
      );
      expect(output(result)).toContain("https://lernapps.net/tooling/schemas/quiz.v1.schema.json");
    });

    test(
      "a question without its options, of an unknown type, or with a duplicate id fails the build",
      {
        timeout: SLOW,
      },
      () => {
        const broken = bank();
        const [first, second, third] = broken.questions;
        if (!first || !second || !third) throw new Error("the fixture bank has fewer than three questions");
        delete second["options"];
        third["type"] = "essay";
        const result = build(JSON.stringify(broken));
        expect(result.code).not.toBe(0);
        expect(output(result)).toContain('questions[1] (question "weltnaturerbe"): options is missing');
        expect(output(result)).toContain('questions[2].type (question "totes-meer"): must be one of single-choice');
        const twice = bank();
        if (twice.questions[1]) twice.questions[1]["id"] = "grand-canyon";
        expect(output(build(JSON.stringify(twice)))).toContain('the id "grand-canyon" appears twice');
      },
    );

    test("a bank that is not JSON fails the build, saying so", { timeout: SLOW }, () => {
      const result = build('{ "title": "Quiz", ');
      expect(result.code).not.toBe(0);
      expect(output(result)).toContain("src/quiz.json is not valid JSON");
    });
  });
});
