// The contract of the rule catalog (docs/arc42 ch. 8, concept "Rule catalog"), end to end on a fresh clone:
//   - `npm run check` (the CI command, and the hooks) fails when an id appears twice in the same kind of artifact,
//     when a lint rule or check has no id, or when its messages do not link to where its rule is explained;
//   - the same id in a skill, a check, a lint rule and a rubric item is one rule, and no artifact needs the others;
//   - `npm run rules` lists every rule grouped by id as YAML; `npm run build` writes the rule page.
// The fixtures are real artifacts planted into the clone: a skill section, a rubric item, a check, a lint rule.
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { afterEach, beforeAll, describe, expect, test } from "vite-plus/test";
import { parse } from "yaml";
import { freshClone, ok, run, type Result } from "./support.ts";

const inner = process.env["LERNAPPS_E2E_INNER"] === "1";
const SLOW = 15 * 60 * 1000;
const RULES = "https://lernapps.net/tooling/rules/#";

const output = (result: Result) => `${result.stdout}\n${result.stderr}`;

/** A skill with one section per rule, each headed by its rule block. */
const skill = (name: string, ...rules: { id: string; scope?: string }[]) =>
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
    "the same rule told in a skill, checked by a check and a lint rule, and judged by the rubric keeps npm run check green",
    { timeout: SLOW },
    () => {
      plant("skills/planted/SKILL.md", skill("planted", { id: "planted-rule" }));
      plant("check/rules/planted.ts", check({ id: "planted-rule", url: `${RULES}planted-rule` }));
      plant("lint/rules/planted-rule.ts", lintRule(`${RULES}planted-rule`));
      plant("review/planted.md", "# Planted\n\n## The planted item\n\n```rubric\nid: planted-rule\n```\n\nJudge it.\n");
      const result = check_();
      expect(result.code, output(result)).toBe(0);
    },
  );

  test("a check or a rubric item whose rule no skill tells keeps npm run check green", { timeout: SLOW }, () => {
    plant("check/rules/planted.ts", check({ id: "planted-check-only", url: `${RULES}planted-check-only` }));
    plant(
      "review/planted.md",
      "# Planted\n\n## The planted item\n\n```rubric\nid: planted-rubric-only\n```\n\nJudge it.\n",
    );
    const result = check_();
    expect(result.code, output(result)).toBe(0);
  });

  test("a rule id used twice in one skill turns npm run check red and names the id", { timeout: SLOW }, () => {
    plant("skills/planted/SKILL.md", skill("planted", { id: "planted-twice" }, { id: "planted-twice" }));
    const result = check_();
    expect(result.code, output(result)).not.toBe(0);
    expect(output(result)).toMatch(/planted-twice.*appears twice in a skill/);
  });

  test("a rule id used in another skill turns npm run check red", { timeout: SLOW }, () => {
    plant("skills/planted/SKILL.md", skill("planted", { id: "learners-act" }));
    const result = check_();
    expect(result.code, output(result)).not.toBe(0);
    expect(output(result)).toMatch(/learners-act.*appears twice in a skill/);
  });

  test("a rubric item without its rule id turns npm run check red and names the item", { timeout: SLOW }, () => {
    plant("review/archetypes/planted.md", "# Planted\n\n## The planted item\n\nJudge it, without an id.\n");
    const result = check_();
    expect(result.code, output(result)).not.toBe(0);
    expect(output(result)).toMatch(/review\/archetypes\/planted\.md:3: rubric item "The planted item" has no rule id/);
  });

  test("two checks with the same id turn npm run check red", { timeout: SLOW }, () => {
    plant("check/rules/planted.ts", check({ id: "planted-rule", url: `${RULES}planted-rule` }));
    plant("check/rules/planted-again.ts", check({ id: "planted-rule", url: `${RULES}planted-rule` }));
    const result = check_();
    expect(result.code, output(result)).not.toBe(0);
    expect(output(result)).toMatch(/planted-rule.*appears twice in a check/);
  });

  test("a check without an id turns npm run check red", { timeout: SLOW }, () => {
    plant("check/rules/planted.ts", check({ url: `${RULES}planted-rule` }));
    const result = check_();
    expect(result.code, output(result)).not.toBe(0);
    expect(output(result)).toMatch(/check\/rules\/planted\.ts.*no valid rule id/);
  });

  test("a check whose messages do not link to its rule turns npm run check red", { timeout: SLOW }, () => {
    plant("check/rules/planted.ts", check({ id: "planted-rule" }));
    const result = check_();
    expect(result.code, output(result)).not.toBe(0);
    expect(output(result)).toMatch(/check\/rules\/planted\.ts.*link/);
  });

  test("a lint rule whose messages link elsewhere turns npm run check red", { timeout: SLOW }, () => {
    plant("lint/rules/planted-rule.ts", lintRule("https://example.org/planted-rule"));
    const result = check_();
    expect(result.code, output(result)).not.toBe(0);
    expect(output(result)).toMatch(/lint\/rules\/planted-rule\.ts.*link/);
  });

  test("npm run rules lists every rule grouped by id, with each artifact that carries it", { timeout: SLOW }, () => {
    plant("skills/planted/SKILL.md", skill("planted", { id: "planted-rule" }));
    plant("check/rules/planted.ts", check({ id: "planted-rule", url: `${RULES}planted-rule` }));
    const result = ok("npm", ["run", "--silent", "rules"], clone);
    const list = parse(result.stdout) as Record<string, { in: string; file: string; text?: string }[]>;
    expect(Object.keys(list)).toContain("no-request-before-click");
    expect(list["planted-rule"]?.map((entry) => [entry.in, entry.file])).toEqual([
      ["skill", "skills/planted/SKILL.md:10"],
      ["check", "check/rules/planted.ts"],
    ]);
    expect(list["planted-rule"]?.[0]?.text).toBe("Explains the rule planted-rule.");
    expect(list["learners-act"]?.map((entry) => entry.in)).toEqual(["skill", "rubric item"]);
  });

  test("a rule block with an unknown severity turns npm run check red", { timeout: SLOW }, () => {
    plant(
      "skills/planted/SKILL.md",
      skill("planted", { id: "planted-rule" }).replace("severity: error", "severity: fatal"),
    );
    const result = check_();
    expect(result.code, output(result)).not.toBe(0);
    expect(output(result)).toMatch(/planted-rule.*severity/);
  });

  test("the rule page lists every rule and passes check:site", { timeout: SLOW }, () => {
    plant("skills/planted/SKILL.md", skill("planted", { id: "planted-site", scope: "site" }, { id: "planted-judged" }));
    const rubric = readFileSync(join(clone, "review/rubric.md"), "utf8");
    plant(
      "review/rubric.md",
      `${rubric}\n## The planted item\n\n\`\`\`rubric\nid: planted-judged\n\`\`\`\n\nJudge it.\n`,
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
      "planted-site",
      "planted-judged",
    ]) {
      expect(page, id).toContain(`id="${id}"`);
    }
    expect(page).toContain("Explains the rule planted-site.");
    expect(page).toContain("Explains the rule planted-judged.");
    expect(page).toContain("skills/planted/SKILL.md");
    expect(page).toContain("review/rubric.md");
    expect(readFileSync(join(clone, "_site/index.html"), "utf8")).toContain('href="rules/"');
    const site = run("npm", ["run", "check:site"], clone);
    expect(site.code, output(site)).toBe(0);
  });
});
