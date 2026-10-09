// The contract of the rule catalog (docs/arc42 ch. 8, concept "Rule catalog"), end to end on a fresh clone:
//   - `npm run check` (the CI command, and the hooks) fails when a rule id is declared twice, when a `checked`
//     rule has no implementation, when a lint rule or check has no id, or when its messages do not link to
//     where its rule is explained;
//   - `npm run build` writes the rule page, which lists every rule.
//   - it also fails when a `reviewed` rule has no rubric item;
// The fixtures are real artifacts planted into the clone: a skill section, a rubric item, a check, a lint rule.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { afterEach, beforeAll, describe, expect, test } from "vite-plus/test";
import { freshClone, ok, run, type Result } from "./support.ts";

const inner = process.env["LERNAPPS_E2E_INNER"] === "1";
const SLOW = 15 * 60 * 1000;
const RULES = "https://lernapps.net/tooling/rules/#";

const output = (result: Result) => `${result.stdout}\n${result.stderr}`;

/** A skill with one section per rule, each headed by its rule block. */
const skill = (name: string, ...rules: { id: string; scope?: string; enforcement: string }[]) =>
  [
    "---",
    `name: ${name}`,
    "description: A planted skill of the end-to-end tests.",
    "---",
    "",
    `# ${name}`,
    "",
    ...rules.flatMap((rule) => [
      `## The planted rule ${rule.id}`,
      "",
      "```rule",
      `id: ${rule.id}`,
      `scope: ${rule.scope ?? "listing"}`,
      "severity: error",
      `enforcement: ${rule.enforcement}`,
      "```",
      "",
      `Explains the rule ${rule.id}.`,
      "",
    ]),
  ].join("\n");

/** A check of the built app, as the check CLI will load it from check/rules/. */
const check = (fields: { id?: string; url?: string }) =>
  [
    "export default {",
    ...(fields.id === undefined ? [] : [`  id: ${JSON.stringify(fields.id)},`]),
    ...(fields.url === undefined ? [] : [`  url: ${JSON.stringify(fields.url)},`]),
    "  run: (): string[] => [],",
    "};",
    "",
  ].join("\n");

/** A lint rule as the lint plugin will load it from lint/rules/<id>.ts (ESLint-compatible rule object). */
const lintRule = (url?: string) =>
  [
    "export default {",
    "  meta: {",
    '    type: "problem",',
    `    docs: { description: "A planted lint rule."${url === undefined ? "" : `, url: ${JSON.stringify(url)}`} },`,
    '    messages: { found: "Found it." },',
    "  },",
    "  create: () => ({}),",
    "};",
    "",
  ].join("\n");

describe.skipIf(inner)("the rule catalog in a fresh clone", () => {
  let clone = "";
  let head = "";

  beforeAll(() => {
    clone = freshClone();
    ok("npm", ["ci", "--no-audit", "--no-fund"], clone);
    head = ok("git", ["rev-parse", "HEAD"], clone).stdout.trim();
  }, SLOW);

  afterEach(() => {
    ok("git", ["reset", "--quiet", "--hard", head], clone);
    ok("git", ["clean", "--quiet", "-fd"], clone);
    rmSync(join(clone, "_site"), { recursive: true, force: true });
  });

  const plant = (file: string, content: string) => {
    mkdirSync(dirname(join(clone, file)), { recursive: true });
    writeFileSync(join(clone, file), content);
  };
  const check_ = () => run("npm", ["run", "check"], clone);

  test(
    "a checked rule with its check and its lint rule, both linking to the rule, keeps npm run check green",
    {
      timeout: SLOW,
    },
    () => {
      plant("skills/planted/SKILL.md", skill("planted", { id: "planted-rule", enforcement: "checked" }));
      plant("check/rules/planted.ts", check({ id: "planted-rule", url: `${RULES}planted-rule` }));
      plant("lint/rules/planted-rule.ts", lintRule(`${RULES}planted-rule`));
      const result = check_();
      expect(result.code, output(result)).toBe(0);
    },
  );

  test("a rule id declared twice turns npm run check red and names the id", { timeout: SLOW }, () => {
    plant(
      "skills/planted/SKILL.md",
      skill("planted", { id: "planted-twice", enforcement: "guided" }, { id: "planted-twice", enforcement: "guided" }),
    );
    const result = check_();
    expect(result.code, output(result)).not.toBe(0);
    expect(output(result)).toMatch(/planted-twice.*declared twice|declared twice.*planted-twice/);
  });

  test("a rule with the id of a rule in another skill turns npm run check red", { timeout: SLOW }, () => {
    plant("skills/planted/SKILL.md", skill("planted", { id: "learners-act", enforcement: "guided" }));
    const result = check_();
    expect(result.code, output(result)).not.toBe(0);
    expect(output(result)).toMatch(/learners-act.*declared twice/);
  });

  test("a reviewed rule without its rubric item turns npm run check red", { timeout: SLOW }, () => {
    plant("skills/planted/SKILL.md", skill("planted", { id: "planted-unreviewed", enforcement: "reviewed" }));
    const result = check_();
    expect(result.code, output(result)).not.toBe(0);
    expect(output(result)).toMatch(/planted-unreviewed.*no rubric item/);
  });

  test("two checks with the same id turn npm run check red", { timeout: SLOW }, () => {
    plant("skills/planted/SKILL.md", skill("planted", { id: "planted-rule", enforcement: "checked" }));
    plant("check/rules/planted.ts", check({ id: "planted-rule", url: `${RULES}planted-rule` }));
    plant("check/rules/planted-again.ts", check({ id: "planted-rule", url: `${RULES}planted-rule` }));
    const result = check_();
    expect(result.code, output(result)).not.toBe(0);
    expect(output(result)).toMatch(/planted-rule.*implemented twice/);
  });

  test("a checked rule without implementation turns npm run check red", { timeout: SLOW }, () => {
    plant("skills/planted/SKILL.md", skill("planted", { id: "planted-unchecked", enforcement: "checked" }));
    const result = check_();
    expect(result.code, output(result)).not.toBe(0);
    expect(output(result)).toMatch(/planted-unchecked.*no implementation/);
  });

  test("a check without an id turns npm run check red", { timeout: SLOW }, () => {
    plant("check/rules/planted.ts", check({ url: `${RULES}planted-rule` }));
    const result = check_();
    expect(result.code, output(result)).not.toBe(0);
    expect(output(result)).toMatch(/check\/rules\/planted\.ts.*no rule id/);
  });

  test("a check for a rule that is not declared turns npm run check red", { timeout: SLOW }, () => {
    plant("check/rules/planted.ts", check({ id: "planted-nowhere", url: `${RULES}planted-nowhere` }));
    const result = check_();
    expect(result.code, output(result)).not.toBe(0);
    expect(output(result)).toMatch(/planted-nowhere.*not declared/);
  });

  test("a check whose messages do not link to its rule turns npm run check red", { timeout: SLOW }, () => {
    plant("skills/planted/SKILL.md", skill("planted", { id: "planted-rule", enforcement: "checked" }));
    plant("check/rules/planted.ts", check({ id: "planted-rule" }));
    const result = check_();
    expect(result.code, output(result)).not.toBe(0);
    expect(output(result)).toMatch(/check\/rules\/planted\.ts.*link/);
  });

  test("a lint rule whose messages link elsewhere turns npm run check red", { timeout: SLOW }, () => {
    plant("skills/planted/SKILL.md", skill("planted", { id: "planted-rule", enforcement: "checked" }));
    plant("lint/rules/planted-rule.ts", lintRule("https://example.org/planted-rule"));
    const result = check_();
    expect(result.code, output(result)).not.toBe(0);
    expect(output(result)).toMatch(/lint\/rules\/planted-rule\.ts.*link/);
  });

  test("a rule block with an unknown severity turns npm run check red", { timeout: SLOW }, () => {
    plant(
      "skills/planted/SKILL.md",
      skill("planted", { id: "planted-rule", enforcement: "guided" }).replace("severity: error", "severity: fatal"),
    );
    const result = check_();
    expect(result.code, output(result)).not.toBe(0);
    expect(output(result)).toMatch(/planted-rule.*severity/);
  });

  test("the rule page lists every rule and passes check:site", { timeout: SLOW }, () => {
    plant(
      "skills/planted/SKILL.md",
      skill(
        "planted",
        { id: "planted-guided", scope: "site", enforcement: "guided" },
        { id: "planted-reviewed", enforcement: "reviewed" },
      ),
    );
    const rubric = readFileSync(join(clone, "review/rubric.md"), "utf8");
    plant(
      "review/rubric.md",
      `${rubric}\n## The planted item\n\n\`\`\`rubric\nid: planted-reviewed\n\`\`\`\n\nJudge it.\n`,
    );
    ok("npm", ["run", "build"], clone);
    const page = readFileSync(join(clone, "_site/rules/index.html"), "utf8");
    // the first rules of scope listing and site, and the planted ones
    for (const id of [
      "no-request-before-click",
      "no-tracking",
      "readable-without-javascript",
      "accessible",
      "usable-at-360px",
      "imprint-and-privacy",
      "runs-in-browser",
      "no-account",
      "free-of-charge",
      "no-ads",
      "learners-act",
      "planted-guided",
      "planted-reviewed",
    ]) {
      expect(page, id).toContain(`id="${id}"`);
    }
    expect(page).toContain("Explains the rule planted-guided.");
    expect(page).toContain("Explains the rule planted-reviewed.");
    expect(page).toContain("skills/planted/SKILL.md");
    expect(page).toContain("review/rubric.md");
    expect(readFileSync(join(clone, "_site/index.html"), "utf8")).toContain('href="rules/"');
    const site = run("npm", ["run", "check:site"], clone);
    expect(site.code, output(site)).toBe(0);
  });
});
