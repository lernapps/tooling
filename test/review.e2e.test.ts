// The contract of the review procedure (review/, docs/arc42 ch. 5, "Review procedure"), as its consumers rely on it:
//   - the owner gives review/prompt.md to a fresh agent; what the prompt points to exists;
//   - the rubric has one file for all apps and one per archetype, every item with a rule id the catalog lists;
//   - the verdict is YAML valid against review/verdict.v1.schema.json, names the reviewed commit, and every finding
//     names a rule of the catalog or proposes a new one and where it would act (`npm run verdict -- <file>`);
//   - a review of a fixture app with a planted ad gives a verdict that names the rule no-ads.
// The review itself is done by an agent, and CI calls no model. So the fixture's verdict is recorded: an agent in a
// fresh context followed review/prompt.md on the fixture repo and wrote test/fixtures/reviews/ad/verdict.yaml. The
// fixture repo is committed with a fixed author, date and message, so its commit is the same on every machine; a
// change to the fixture changes the commit and fails the test until the verdict is recorded again. To record it:
//   node test/review-fixture.ts ad <dir>     the fixture repo, committed; prints its commit
// then start a fresh agent with review/prompt.md on <dir> and copy its verdict here.
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, test } from "vite-plus/test";
import { parse, stringify } from "yaml";
import { reviewFixture } from "./review-fixture.ts";
import { ok, repoRoot, run, tempDir, type Result } from "./support.ts";

const inner = process.env["LERNAPPS_E2E_INNER"] === "1";
const SLOW = 5 * 60 * 1000;
const RULES = "https://lernapps.net/tooling/rules/#";
const RECORDED = join(repoRoot, "test/fixtures/reviews/ad/verdict.yaml");

const output = (result: Result) => `${result.stdout}\n${result.stderr}`;
/** The verdict check a review agent runs on its verdict before it hands it over. */
const verdict = (file: string) => run("npm", ["run", "--silent", "verdict", "--", file], repoRoot);

interface Finding {
  rule?: string;
  proposal?: { id: string; actsIn: string[] };
  severity: string;
  where: string;
  found: string;
  fix: string;
  link?: string;
}
interface Verdict {
  reviewed: { commit: string };
  archetype: string | null;
  outcome: string;
  rules: string[];
  findings: Finding[];
}

const recorded = () => parse(readFileSync(RECORDED, "utf8")) as Verdict;

/** Every rule id of the catalog, with the kinds of artifact that carry it (npm run rules). */
function catalog(): Map<string, string[]> {
  const list = parse(ok("npm", ["run", "--silent", "rules"], repoRoot).stdout) as Record<string, { in: string }[]>;
  return new Map(Object.entries(list).map(([id, entries]) => [id, entries.map((entry) => entry.in)]));
}

describe("the review procedure", () => {
  const prompt = readFileSync(join(repoRoot, "review/prompt.md"), "utf8");

  test("every file of the tooling the prompt names exists", () => {
    const paths = [...prompt.matchAll(/`((?:review|check|skills|guidance)\/[^`*<>\s]+)`/g)].map((match) => match[1]);
    expect(paths.length).toBeGreaterThan(0);
    for (const path of paths) expect(existsSync(join(repoRoot, path ?? "")), path).toBe(true);
  });

  test("the prompt names its inputs, the verdict check and where the verdict goes", () => {
    for (const input of ["validation report", "bundle", "dependencies", "retrospective"]) {
      expect(prompt.toLowerCase()).toContain(input);
    }
    expect(prompt).toContain("npm run --silent verdict --");
    expect(prompt).toContain("verdict.yaml");
  });

  test("the rubric has a file for every archetype of the plan", () => {
    const schema = JSON.parse(readFileSync(join(repoRoot, "guidance/plan-front-matter.v1.schema.json"), "utf8")) as {
      properties: { archetype: { enum: (string | null)[] } };
    };
    const archetypes = schema.properties.archetype.enum.filter((name) => name !== null);
    const files = readdirSync(join(repoRoot, "review/archetypes")).map((file) => file.replace(/\.md$/, ""));
    expect(files.sort()).toEqual([...archetypes].sort());
  });

  test("the rubric judges learners acting, ads, plain language and learner data in public texts", () => {
    const rules = catalog();
    for (const id of ["learners-act", "no-ads", "learner-text-german", "no-learner-data-in-texts"]) {
      expect(rules.get(id), id).toContain("rubric item");
    }
  });
});

describe("a verdict", () => {
  const write = (name: string, value: unknown) => {
    const file = join(tempDir("verdict"), `${name}.yaml`);
    writeFileSync(file, typeof value === "string" ? value : stringify(value));
    return file;
  };
  const changed = (change: (verdict: Verdict) => void) => {
    const value = recorded();
    change(value);
    return value;
  };

  test("that is valid passes the verdict check with one line naming the commit", () => {
    const result = verdict(RECORDED);
    expect(result.code, output(result)).toBe(0);
    expect(result.stdout).toMatch(/^verdict: ok, commit [0-9a-f]{7}, fail, \d+ findings?/);
    expect(result.stdout.trim().split("\n")).toHaveLength(1);
  });

  test("that proposes a new rule, and where it would act, passes", () => {
    const value = changed((verdict) => {
      verdict.findings.push({
        proposal: { id: "planted-new-rule", actsIn: ["check", "skill"] },
        severity: "hint",
        where: "dist/index.html",
        found: "Something no rule covers yet",
        fix: "Do it differently",
      });
    });
    const result = verdict(write("proposal", value));
    expect(result.code, output(result)).toBe(0);
  });

  test.each<[string, (verdict: Verdict) => void, string]>([
    [
      "without the reviewed commit",
      (verdict) => {
        verdict.reviewed = {} as Verdict["reviewed"];
      },
      "/reviewed must have required property 'commit'",
    ],
    [
      "with a finding that names no rule and proposes none",
      (verdict) => {
        delete verdict.findings[0]?.rule;
        delete verdict.findings[0]?.link;
      },
      "/findings/0: name the rule (rule, link) or propose a new one (proposal)",
    ],
    [
      "with a rule id the catalog does not know",
      (verdict) => {
        if (verdict.findings[0]) {
          verdict.findings[0].rule = "planted-unknown";
          verdict.findings[0].link = `${RULES}planted-unknown`;
        }
      },
      "/findings/0: planted-unknown is no rule of the catalog (npm run rules); propose it as a new rule instead",
    ],
    [
      "proposing a rule that exists",
      (verdict) => {
        delete verdict.findings[0]?.rule;
        delete verdict.findings[0]?.link;
        if (verdict.findings[0]) verdict.findings[0].proposal = { id: "no-ads", actsIn: ["check"] };
      },
      "/findings/0: no-ads is a rule of the catalog already; name it as rule",
    ],
    [
      "that passes with an error finding",
      (verdict) => {
        verdict.outcome = "pass";
      },
      "/outcome: pass, but a finding has severity error; the outcome is fail",
    ],
  ])("%s fails the verdict check with a message naming the problem", (_name, change, message) => {
    const result = verdict(write("broken", changed(change)));
    expect(result.code, output(result)).toBe(1);
    expect(output(result)).toContain(message);
  });
});

describe.skipIf(inner)("the review of a fixture app with a planted ad", () => {
  let repo = "";
  let commit = "";

  beforeAll(() => {
    ({ dir: repo, commit } = reviewFixture("ad", tempDir("review-ad")));
  });

  test("the fixture repo has the same commit on every machine", () => {
    expect(reviewFixture("ad", tempDir("review-ad")).commit).toBe(commit);
  });

  test("passes the checks of the built app: no program finds the ad", { timeout: SLOW }, () => {
    const result = run("node", [join(repoRoot, "src/cli.ts"), "check", join(repo, "dist")], repoRoot);
    expect(result.code, output(result)).toBe(0);
    expect(result.stdout).toMatch(/^lernapps check: ok/);
  });

  test("gives a verdict that validates and names the reviewed commit", () => {
    const result = verdict(RECORDED);
    expect(result.code, output(result)).toBe(0);
    expect(recorded().reviewed.commit).toBe(commit);
  });

  test("gives a verdict that fails the app on the rule no-ads, at the ad in the bundle", () => {
    const value = recorded();
    expect(value.outcome).toBe("fail");
    expect(value.rules).toContain("no-ads");
    const ads = value.findings.filter((finding) => finding.rule === "no-ads");
    expect(ads).toHaveLength(1);
    expect(ads[0]?.severity).toBe("error");
    expect(ads[0]?.link).toBe(`${RULES}no-ads`);
    const file = ads[0]?.where.split(/[\s,:]/)[0] ?? "";
    expect(readFileSync(join(repo, file), "utf8")).toContain("Anzeige");
  });
});
