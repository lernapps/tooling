import { expect, test } from "vite-plus/test";
import {
  check,
  describe,
  generate,
  mistakes,
  params,
  reason,
  show,
  solution,
  template,
  wrong,
} from "./BruchEinstellen.ts";

const props = {
  task: "Stelle den Bruch {z}/{n} ein.",
  mistakes: ["Rest: {r} statt {z} von {n}.", "Der Nenner ist {n}, nicht {z}."],
};

test("the fraction of the task is right; the rest and the swapped numbers are wrong", () => {
  for (let seed = 1; seed <= 50; seed++) {
    const task = generate(seed, props);
    expect(task.z).toBeGreaterThanOrEqual(2);
    expect(task.z).toBeLessThan(task.n);
    expect(2 * task.z).not.toBe(task.n);
    expect(check(task, solution(task))).toBe(true);
    expect(check(task, wrong(task))).toBe(false);
    for (const answer of mistakes(task)) if (answer !== undefined) expect(check(task, answer)).toBe(false);
    for (const answer of mistakes(task))
      if (answer !== undefined) {
        expect(answer.nenner).toBeGreaterThanOrEqual(2);
        expect(answer.zaehler).toBeLessThanOrEqual(answer.nenner);
      }
    expect(new Set(mistakes(task).map((a) => JSON.stringify(a))).size).toBe(2);
    expect(Object.keys(params(task, props, "de"))).toEqual(["z", "n"]);
  }
});

test("describe fills in the task; each typical mistake gets its message", () => {
  const task = { n: 8, z: 3, form: "kreis" as const };
  expect(describe(task, props, "de").task).toBe("Stelle den Bruch 3/8 ein.");
  expect(reason(task, { nenner: 8, zaehler: 5 }, props)).toBe("Rest: 5 statt 3 von 8.");
  expect(reason(task, { nenner: 3, zaehler: 3 }, props)).toBe("Der Nenner ist 8, nicht 3.");
  expect(reason(task, { nenner: 6, zaehler: 1 }, props)).toBeUndefined();
  expect(template(props, "de")).toBe(props.task);
  expect(show({ nenner: 8, zaehler: 3 })).toBe("3 von 8 Teilen");
});
