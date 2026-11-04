import { expect, test } from "vite-plus/test";
import { check, describe, generate, mistakes, params, reason, show, solution, wrong } from "./Bruchfeld.ts";

const props = {
  task: "Der Streifen hat {n} Teile. Färbe {z}/{n}.",
  mistakes: ["Das sind die {r} übrigen Teile.", "Du hast alle {n} Teile gefärbt."],
};

test("z of the n parts is right; the rest and all of them are wrong", () => {
  for (let seed = 1; seed <= 50; seed++) {
    const task = generate(seed, props);
    expect([4, 5, 6, 8, 10]).toContain(task.n);
    expect(task.z).toBeGreaterThan(0);
    expect(task.z).toBeLessThan(task.n);
    expect(check(task, solution(task))).toBe(true);
    expect(check(task, wrong(task))).toBe(false);
    for (const answer of mistakes(task)) if (answer !== undefined) expect(check(task, answer)).toBe(false);
    expect(new Set(mistakes(task)).size).toBe(2);
    expect(params(task, props, "de")).toEqual({ n: task.n, z: task.z });
  }
});

test("the same seed gives the same task", () => {
  expect(generate(7, props)).toEqual(generate(7, props));
});

test("describe fills in the task; each typical mistake gets its message", () => {
  const task = { n: 8, z: 3 };
  expect(describe(task, props, "de")).toEqual({
    task: "Der Streifen hat 8 Teile. Färbe 3/8.",
    solution: "3 von 8 Teilen gefärbt",
  });
  expect(reason(task, 5, props)).toBe("Das sind die 5 übrigen Teile.");
  expect(reason(task, 8, props)).toBe("Du hast alle 8 Teile gefärbt.");
  expect(reason(task, 4, props)).toBeUndefined();
  expect(show(1)).toBe("1 Teil gefärbt");
});
