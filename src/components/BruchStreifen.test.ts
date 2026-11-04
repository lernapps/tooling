import { expect, test } from "vite-plus/test";
import { check, describe, generate, mistakes, params, reason, solution, wrong } from "./BruchStreifen.ts";

const props = {
  task: "Der Streifen hat {n} gleich große Felder. Färbe {z}/{n} davon.",
  mistakes: ["Das sind {n} Felder minus {z}: der Rest.", "Der Zähler {z} sagt, wie viele Felder."],
};

test("z of the n fields is right; the rest and a single field are wrong", () => {
  for (let seed = 1; seed <= 50; seed++) {
    const task = generate(seed, props);
    expect(task.n).toBeGreaterThanOrEqual(5);
    expect(task.n).toBeLessThanOrEqual(12);
    expect(task.z).toBeGreaterThanOrEqual(2);
    expect(task.z).toBeLessThanOrEqual(task.n - 2);
    expect(check(task, solution(task))).toBe(true);
    expect(check(task, wrong(task))).toBe(false);
    for (const answer of mistakes(task)) if (answer !== undefined) expect(check(task, answer)).toBe(false);
    expect(new Set([...mistakes(task), solution(task)]).size).toBe(3);
  }
});

test("the same seed gives the same task", () => {
  expect(generate(7, props)).toEqual(generate(7, props));
  expect(params(generate(7, props), props, "de")).toEqual(generate(7, props));
});

test("describe fills in the task; each typical mistake gets its message", () => {
  const task = { n: 8, z: 3 };
  expect(describe(task, props, "de")).toEqual({
    task: "Der Streifen hat 8 gleich große Felder. Färbe 3/8 davon.",
    solution: "3 von 8 Feldern gefärbt",
  });
  expect(reason(task, 5, props)).toBe("Das sind 8 Felder minus 3: der Rest.");
  expect(reason(task, 1, props)).toBe("Der Zähler 3 sagt, wie viele Felder.");
  expect(reason(task, 4, props)).toBeUndefined();
});
