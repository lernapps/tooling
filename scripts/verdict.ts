// Checks a review verdict (docs/arc42 ch. 5, "Review procedure"): the review agent runs it on its verdict before it
// hands the verdict to the owner, and the tests run it on the recorded verdict of a fixture app.
//
//   node scripts/verdict.ts <file>   (npm run --silent verdict -- <file>)
//
// The verdict is YAML, valid against review/verdict.v1.schema.json. Beyond the schema, every finding names a rule of
// the catalog (npm run rules) with its link, or proposes a rule that is not in the catalog yet. One line when the
// verdict is good, exit 0; one line per problem otherwise, exit 1; 2 on a usage error.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Ajv2020, type ErrorObject } from "ajv/dist/2020.js";
import { parse } from "yaml";

const ROOT = resolve(import.meta.dirname, "..");
const SCHEMA = resolve(ROOT, "review/verdict.v1.schema.json");
const RULE_PAGE = "https://lernapps.net/tooling/rules/#";

interface Finding {
  rule?: string;
  link?: string;
  proposal?: { id: string };
  severity: string;
}
interface Verdict {
  reviewed: { commit: string };
  outcome: string;
  findings: Finding[];
}

/** The ids of the rule catalog, read from the artifacts by scripts/rules.ts. */
function ruleIds(): Set<string> {
  const list = spawnSync(process.execPath, [resolve(ROOT, "scripts/rules.ts"), "list"], { encoding: "utf8" });
  if (list.status !== 0) throw new Error(`cannot read the rule catalog:\n${list.stderr}`);
  return new Set(Object.keys((parse(list.stdout) ?? {}) as Record<string, unknown>));
}

/** The schema's messages, said for the agent that writes the verdict. */
function schemaProblems(errors: ErrorObject[], value: unknown): string[] {
  const findings = (value as { findings?: unknown[] } | null)?.findings;
  return (
    errors
      // The branches of if and oneOf: their own message below says what is wrong.
      .filter((error) => error.keyword !== "if" && !error.schemaPath.includes("/oneOf/"))
      .map((error) => {
        const at = error.instancePath === "" ? "/" : error.instancePath;
        if (error.keyword === "oneOf" && /^\/findings\/\d+$/.test(error.instancePath)) {
          return `${at}: name the rule (rule, link) or propose a new one (proposal), not both`;
        }
        if (error.keyword === "not" && error.instancePath === "/findings") {
          return `/outcome: pass, but a finding has severity error; the outcome is fail`;
        }
        if (error.keyword === "contains" && error.instancePath === "/findings" && Array.isArray(findings)) {
          return `/outcome: fail, but no finding has severity error; the outcome is pass`;
        }
        const { additionalProperty, allowedValues } = error.params as {
          additionalProperty?: string;
          allowedValues?: unknown[];
        };
        const detail = additionalProperty ?? allowedValues?.map(String).join(", ");
        return `${at} ${error.message ?? ""}${detail === undefined ? "" : `: ${detail}`}`;
      })
  );
}

function check(file: string): string[] {
  let value: unknown;
  try {
    value = parse(readFileSync(file, "utf8"));
  } catch (error) {
    return [`cannot read: ${error instanceof Error ? error.message : String(error)}`];
  }
  const validate = new Ajv2020({ allErrors: true, strict: true }).compile(
    JSON.parse(readFileSync(SCHEMA, "utf8")) as object,
  );
  if (!validate(value)) return schemaProblems(validate.errors ?? [], value);

  const verdict = value as Verdict;
  const ids = ruleIds();
  const problems: string[] = [];
  verdict.findings.forEach((finding, index) => {
    const at = `/findings/${index}`;
    if (finding.rule !== undefined) {
      if (!ids.has(finding.rule)) {
        problems.push(
          `${at}: ${finding.rule} is no rule of the catalog (npm run rules); propose it as a new rule instead`,
        );
      } else if (finding.link !== `${RULE_PAGE}${finding.rule}`) {
        problems.push(`${at}: the link of ${finding.rule} must be ${RULE_PAGE}${finding.rule}`);
      }
    }
    if (finding.proposal !== undefined && ids.has(finding.proposal.id)) {
      problems.push(`${at}: ${finding.proposal.id} is a rule of the catalog already; name it as rule`);
    }
  });
  return problems;
}

function main(args: string[]): number {
  const [file] = args;
  if (file === undefined || args.length > 1) {
    process.stderr.write("usage: node scripts/verdict.ts <verdict.yaml>\n");
    return 2;
  }
  const problems = check(file);
  if (problems.length > 0) {
    process.stderr.write(`${problems.map((problem) => `verdict: ${file}: ${problem}`).join("\n")}\n`);
    return 1;
  }
  const { reviewed, outcome, findings } = parse(readFileSync(file, "utf8")) as Verdict;
  const errors = findings.filter((finding) => finding.severity === "error").length;
  process.stdout.write(
    `verdict: ok, commit ${reviewed.commit.slice(0, 7)}, ${outcome}, ${findings.length} finding${findings.length === 1 ? "" : "s"} (${errors} error${errors === 1 ? "" : "s"})\n`,
  );
  return 0;
}

process.exitCode = main(process.argv.slice(2));
