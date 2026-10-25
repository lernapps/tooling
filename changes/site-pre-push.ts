#!/usr/bin/env node
// The pre-push hook of every platform site (the website, the catalog, the docs). A site does not install the tooling
// for it: its scripts/pre-push.mjs fetches this folder and src/ at the commit it pins (TOOLING_REF, which Renovate moves
// with the workflows' tooling-ref) and runs this file with node, in the site's folder, git's lines on standard input.
// It first asks the change scope (changes.ts), as every hook and CI do:
//   none  (only the plan, .vibe/**)  nothing, one line
//   docs  (only docs/**/*.md)        the site's build and check (npm run build, npm run check), as CI's job `build`
//   all   (anything else)            the same, and then the site's own fast tests, if it names them as the npm script
//                                    test:pre-push
// CI runs everything a change can affect, so it catches what the hook leaves out.
//
//   node changes/site-pre-push.ts [<remote> [<url>]]   reads "<local ref> <local sha> <remote ref> <remote sha>"
//
// Quiet like the pre-commit hook: what the steps print goes to node_modules/.cache/lernapps/pre-push.log; the hook
// prints one line saying what it checked, or on a failure one line naming the step and the log. Without lines on
// standard input (run by hand) the changed paths are not known: scope all.
// Only Node's own modules, like changes.ts: node runs it from the fetched folder without installing anything.
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ChangesConfigError, classifyPush, loadRules, pushedFiles, readStdin, SITE_CHECK, stepEnv } from "./changes.ts";
import type { Scope } from "./changes.ts";

/** The npm script with the site's own fast tests, which a push of scope all runs after the build and the check. */
export const PRE_PUSH_TESTS = "test:pre-push";

export const LOG = "node_modules/.cache/lernapps/pre-push.log";

/** A step: its name in the hook's line, and the command. */
export type Step = [name: string, command: readonly string[]];

/** The npm scripts the site's package.json in `cwd` names. */
function scripts(cwd: string): Record<string, unknown> {
  const file = join(cwd, "package.json");
  if (!existsSync(file)) return {};
  const manifest = JSON.parse(readFileSync(file, "utf8")) as { scripts?: Record<string, unknown> };
  return manifest.scripts ?? {};
}

/** The steps of a scope in the site in `cwd`; each runs after the one before has passed. */
export function steps(scope: Scope, cwd: string, check = "check"): Step[] {
  if (scope === "none") return [];
  const npm = (script: string): Step => [`npm run ${script}`, ["npm", "run", "--silent", script]];
  const site = [npm("build"), npm(check)];
  if (scope === "docs" || scripts(cwd)[PRE_PUSH_TESTS] === undefined) return site;
  return [...site, npm(PRE_PUSH_TESTS)];
}

/** Runs the steps one after the other, their output into the log; the step that failed and its exit code. */
function runLogged(cwd: string, log: string) {
  return (all: readonly Step[]): { name: string; code: number } | undefined => {
    for (const [name, [program = "", ...args]] of all) {
      writeFileSync(log, `$ ${[program, ...args].join(" ")}\n`, { flag: "a" });
      // stdin ignored: a step never sees git's lines
      const result = spawnSync(program, args, {
        cwd,
        env: stepEnv(process.env),
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        maxBuffer: 256 * 1024 * 1024,
      });
      const error = result.error ? `${result.error.message}\n` : "";
      writeFileSync(log, `${result.stdout ?? ""}${result.stderr ?? ""}${error}`, { flag: "a" });
      if (result.status !== 0) return { name, code: result.status ?? 1 };
    }
    return undefined;
  };
}

export interface Options {
  cwd: string;
  write: (text: string) => void;
  /** Runs the steps; a test passes its own. */
  run?: (steps: readonly Step[]) => { name: string; code: number } | undefined;
}

/** The hook: the exit code of the push. */
export function sitePrePush(lines: string, { cwd, write, run }: Options): number {
  const say = (message: string) => write(`lernapps pre-push: ${message}\n`);
  const pushed = lines
    .split("\n")
    .map((line) => line.trim().split(/\s+/))
    .filter((fields) => fields.length === 4);
  if (pushed.length > 0 && pushed.every(([, local = ""]) => /^0+$/.test(local))) {
    say("nothing to check, the push only deletes");
    return 0;
  }
  let rules;
  try {
    rules = loadRules(cwd);
  } catch (error) {
    if (!(error instanceof ChangesConfigError)) throw error;
    say(error.message);
    return 1;
  }
  const { scope, reason } = classifyPush(pushedFiles(lines, cwd), rules);
  const plan = steps(scope, cwd, SITE_CHECK[rules.kind]);
  if (plan.length === 0) {
    say(`nothing to check, the push changes only the plan (${reason})`);
    return 0;
  }
  const log = join(cwd, LOG);
  mkdirSync(dirname(log), { recursive: true });
  writeFileSync(log, `lernapps pre-push: scope ${scope} (${reason})\n`);
  const failure = (run ?? runLogged(cwd, log))(plan);
  if (failure !== undefined) {
    say(`${failure.name} failed (exit ${failure.code}); the full output is in ${LOG}`);
    return failure.code;
  }
  say(`scope ${scope}: ${plan.map(([name]) => name).join(", ")} passed (CI runs the rest)`);
  return 0;
}

if (process.argv[1] !== undefined && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = sitePrePush(readStdin(), {
    cwd: process.cwd(),
    write: (text) => process.stdout.write(text),
  });
}
