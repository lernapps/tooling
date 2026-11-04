import { expect, test } from "vite-plus/test";
import { check, describe, generate, mistakes, reason, solution, wrong } from "./BruchFaerben.ts";

const props = {
  task: "Färbe den Bruch {a}/{b}.",
  mistakes: ["Du hast {n} Stücke gefärbt, das sind {b} − {a}.", "Du hast den ganzen Streifen gefärbt."],
};

test("a of b pieces is right; the rest and the whole strip are wrong", () => {
  for (let seed = 1; seed <= 50; seed++) {
    const task = generate(seed, props);
    expect(task.a).toBeGreaterThan(0);
    expect(task.a).toBeLessThan(task.b);
    expect(check(task, solution(task))).toBe(true);
    expect(check(task, wrong(task))).toBe(false);
    for (const answer of mistakes(task)) if (answer !== undefined) expect(check(task, answer)).toBe(false);
    expect(new Set(mistakes(task)).size).toBe(2);
  }
});

test("describe fills in the task; each typical mistake gets its message", () => {
  const task = { a: 3, b: 8 };
  expect(describe(task, props, "de").task).toBe("Färbe den Bruch 3/8.");
  expect(reason(task, 5, props)).toBe("Du hast 5 Stücke gefärbt, das sind 8 − 3.");
  expect(reason(task, 8, props)).toBe("Du hast den ganzen Streifen gefärbt.");
  expect(reason(task, 4, props)).toBeUndefined();
});
