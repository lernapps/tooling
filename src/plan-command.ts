// `lernapps plan`: the one way an assistant reads and changes the tasks of the current plan (src/plan.ts).
//   next   prints the next open task of the phase, with the hints of the phase
//   done   ticks it (a checkpoint: with the creator's answer), enters the next phase after the last task, prints the next
//   skip   ticks it as skipped, with the reason
//   add    adds a task
//   new    starts the plan of an increment from the increment template, as the plan of the app's archetype
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import {
  applyArchetype,
  currentPlan,
  describePosition,
  planAdd,
  planDone,
  planFrontMatter,
  PlanError,
  planPosition,
  startPlan,
  PLANS,
  plans,
} from "./plan.ts";
import { UsageError } from "./usage.ts";

export const PLAN_USAGE = `Usage: lernapps plan <next | done | skip | add | new> [options]

Reads and changes the tasks of the current plan, the file with the highest number in .vibe/plans/. The tasks, the
phase and the other keys of the front matter change only through these commands. What you find out and decide you
write into the plan yourself, in its sections Goal, Key decisions, Notes, Answers, Entry draft, Content method and
Retrospective.

  next                      print the next open task of the current phase, with the hints of the phase
  done [--answer <words>]   tick that task and print the next one; after the last task of a phase, enter the next
                            phase. A checkpoint is ticked only with the creator's answer: --answer "<their words>"
  skip <reason>             tick that task as skipped, because it does not apply; never a checkpoint
  add [--at <place>] <task> add a task: at a place the plan names (a line "tasks: <place>"), in the order of the
                            calls; without --at, right after the next open task
  new <short name>          start the plan of an increment: .vibe/plans/<NN>-<short name>.md, from the increment
                            template, for the archetype of the app's first plan

Options:
  -h, --help   print this help

Exit codes: 0 on success, 1 when the plan cannot do it (the message says what to do instead), 2 on a usage error.
`;

const OPTIONS = {
  answer: { type: "string" },
  at: { type: "string" },
  help: { type: "boolean", short: "h", default: false },
} as const;

/** A file of the guidance, from this package: guidance/ beside src/ in the repository, beside dist/ once packed. */
export function guidanceFile(name: string): string {
  return join(dirname(fileURLToPath(import.meta.url)), "..", "guidance", name);
}

/** The archetype's part of a plan (guidance/plan-<archetype>.md); empty when the package has none for it. */
export function archetypePart(archetype: string): string {
  const file = guidanceFile(`plan-${archetype}.md`);
  return existsSync(file) ? readFileSync(file, "utf8") : "";
}

function current(root: string): string {
  const plan = currentPlan(root);
  if (plan === undefined) {
    throw new PlanError(
      "no plan here: .vibe/plans/ is empty. Start an app with `npx --yes @lernapps/tooling init <name>`",
    );
  }
  return plan;
}

function startIncrement(root: string, name: string): string {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) {
    throw new UsageError(`new needs a short name in lower case with hyphens, not ${name}`);
  }
  const existing = plans(root);
  const first = existing[0];
  if (first === undefined) {
    throw new PlanError("no plan here yet: the first plan comes from `npx --yes @lernapps/tooling init <name>`");
  }
  const archetype = planFrontMatter(join(root, first))["archetype"];
  const number = Number((existing.at(-1) ?? "").slice(PLANS.length + 1, PLANS.length + 3)) + 1;
  const plan = `${PLANS}/${String(number).padStart(2, "0")}-${name}.md`;
  let text = startPlan(
    readFileSync(guidanceFile("increment-template.md"), "utf8"),
    name,
    new Date().toISOString().slice(0, 10),
  );
  if (typeof archetype === "string") text = applyArchetype(text, archetype, archetypePart(archetype));
  mkdirSync(dirname(join(root, plan)), { recursive: true });
  writeFileSync(join(root, plan), text);
  return plan;
}

export function planCommand(args: string[], root = "."): number {
  const { values, positionals } = parseArgs({ args, options: OPTIONS, strict: true, allowPositionals: true });
  const [action, ...rest] = positionals;
  if (values.help || action === undefined) {
    process.stdout.write(PLAN_USAGE);
    return action === undefined && !values.help ? 2 : 0;
  }
  try {
    if (action === "new") {
      if (rest.length !== 1) throw new UsageError("new takes one short name");
      const plan = startIncrement(root, rest[0] ?? "");
      process.stdout.write(`lernapps plan: started ${plan}\n\n`);
      process.stdout.write(describePosition(plan, planPosition(readFileSync(join(root, plan), "utf8"))));
      return 0;
    }
    const plan = current(root);
    const file = join(root, plan);
    const text = readFileSync(file, "utf8");
    let changed: string;
    switch (action) {
      case "next":
        if (rest.length > 0) throw new UsageError(`next takes no arguments, not ${rest.join(" ")}`);
        changed = text;
        break;
      case "done":
        if (rest.length > 0) throw new UsageError('done takes no arguments; a checkpoint: --answer "<their words>"');
        changed = planDone(text, values.answer === undefined ? {} : { answer: values.answer });
        break;
      case "skip":
        changed = planDone(text, { skip: rest.join(" ") });
        break;
      case "add":
        changed = planAdd(text, rest.join(" "), values.at);
        break;
      default:
        throw new UsageError(`unknown plan command: ${action}`);
    }
    if (changed !== text) writeFileSync(file, changed);
    process.stdout.write(describePosition(plan, planPosition(changed), action === "next"));
    return 0;
  } catch (error) {
    if (!(error instanceof PlanError)) throw error;
    process.stderr.write(`lernapps plan: ${error.message}\n`);
    return 1;
  }
}
