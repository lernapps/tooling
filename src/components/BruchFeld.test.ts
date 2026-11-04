import { expect, test } from "vite-plus/test";
import { check, describe, generate, mistakes, reason, solution, wrong } from "./BruchFeld.ts";

const props = {
  task: "Das Rechteck hat {N} gleich große Felder. Färbe den Bruch {Z}/{N}, gelesen: {Z} von {N}.",
  mistakes: ["Das ist der Rest, nicht {Z}/{N}.", "Alle {N} Felder sind das Ganze."],
};

test("Z fields are right; the rest and the whole are wrong", () => {
  for (let seed = 1; seed <= 50; seed++) {
    const task = generate(seed, props);
    expect([4, 5, 6, 8, 10, 12]).toContain(task.N);
    expect(task.Z).toBeGreaterThanOrEqual(1);
    expect(task.Z).toBeLessThan(task.N);
    expect(check(task, solution(task))).toBe(true);
    expect(check(task, wrong(task))).toBe(false);
    for (const answer of mistakes(task)) if (answer !== undefined) expect(check(task, answer)).toBe(false);
    expect(new Set(mistakes(task)).size).toBe(2);
    expect(generate(seed, props)).toEqual(task);
  }
});

test("describe fills in the task; each typical mistake gets its message", () => {
  const task = { Z: 3, N: 8 };
  expect(describe(task, props, "de").task).toBe(
    "Das Rechteck hat 8 gleich große Felder. Färbe den Bruch 3/8, gelesen: 3 von 8.",
  );
  expect(reason(task, 5, props)).toBe("Das ist der Rest, nicht 3/8.");
  expect(reason(task, 8, props)).toBe("Alle 8 Felder sind das Ganze.");
  expect(reason(task, 4, props)).toBeUndefined();
});
