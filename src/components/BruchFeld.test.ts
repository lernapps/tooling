import { expect, test } from "vite-plus/test";
import { check, describe, generate, mistakes, reason, solution, wrong } from "./BruchFeld.ts";

const props = {
  task: "Der Streifen hat {n} Teile. Färbe {z} davon.",
  mistakes: ["Du hast {k} Teile gefärbt, das ist der Rest."],
};

test("z of n parts is right; the rest is wrong", () => {
  for (let seed = 1; seed <= 50; seed++) {
    const task = generate(seed, props);
    expect(task.z).toBeGreaterThan(0);
    expect(task.z).toBeLessThan(task.n);
    expect(check(task, solution(task))).toBe(true);
    expect(check(task, wrong(task))).toBe(false);
    for (const answer of mistakes(task)) if (answer !== undefined) expect(check(task, answer)).toBe(false);
  }
});

test("the same seed gives the same task", () => {
  expect(generate(7, props)).toEqual(generate(7, props));
});

test("describe fills in the task; the typical mistake gets its message", () => {
  const task = { n: 8, z: 3 };
  expect(describe(task, props, "de")).toEqual({
    task: "Der Streifen hat 8 Teile. Färbe 3 davon.",
    solution: "3 Teile gefärbt von 8 Teilen",
  });
  expect(reason(task, 5, props)).toBe("Du hast 5 Teile gefärbt, das ist der Rest.");
  expect(reason(task, 4, props)).toBeUndefined();
});
