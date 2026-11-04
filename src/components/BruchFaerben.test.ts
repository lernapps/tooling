import { expect, test } from "vite-plus/test";
import { check, describe, generate, mistakes, reason, solution, wrong } from "./BruchFaerben.ts";

const props = {
  task: "Der Streifen hat {n} Teile. Färbe den Bruch {z}/{n}.",
  mistakes: ["Das ist der Rest.", "Das sind alle {n} Teile."],
};

test("z parts are right; the rest and all parts are wrong", () => {
  for (let seed = 1; seed <= 50; seed++) {
    const task = generate(seed, props);
    expect([4, 5, 6, 8, 10, 12]).toContain(task.n);
    expect(task.z).toBeGreaterThan(0);
    expect(task.z).toBeLessThan(task.n);
    expect(check(task, solution(task))).toBe(true);
    expect(check(task, wrong(task))).toBe(false);
    for (const answer of mistakes(task)) if (answer !== undefined) expect(check(task, answer)).toBe(false);
    expect(new Set(mistakes(task)).size).toBe(2);
  }
});

test("describe fills in the task; each typical mistake gets its message", () => {
  const task = { n: 8, z: 3 };
  expect(describe(task, props, "de")).toEqual({
    task: "Der Streifen hat 8 Teile. Färbe den Bruch 3/8.",
    solution: "3 Teile gefärbt: 3 von 8 Teilen",
  });
  expect(reason(task, 5, props)).toBe("Das ist der Rest.");
  expect(reason(task, 8, props)).toBe("Das sind alle 8 Teile.");
  expect(reason(task, 4, props)).toBeUndefined();
});
