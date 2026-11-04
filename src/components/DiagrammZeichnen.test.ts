import { expect, test } from "vite-plus/test";
import {
  check,
  describe,
  falscherAbschnitt,
  generate,
  mistakes,
  params,
  reason,
  show,
  solution,
  wrong,
} from "./DiagrammZeichnen.ts";

const props = {
  szenarien: [
    "Ein Wagen fährt 3 s lang an bis {v} m/s, fährt 3 s gleich schnell und bremst 3 s bis zum Stillstand.",
    "Ein Wagen fährt 3 s mit {v} m/s, bremst 3 s auf {h} m/s ab und fährt 3 s mit {h} m/s weiter.",
    "Ein Wagen steht 3 s, fährt dann 3 s an bis {v} m/s und fährt 3 s mit {v} m/s weiter.",
  ],
  mistakes: ["Die Linie ist überall waagerecht.", "Die Form stimmt, die Zahlen nicht."],
  fehlerAbschnitt: "Abschnitt {n} ({von} bis {bis} s) passt nicht.",
  fehlerWert: "Ein Wert passt nicht.",
};

test("the solution passes; a level line and the shape too high fail, for every task", () => {
  const gesehen = new Set<number>();
  for (let seed = 1; seed <= 50; seed++) {
    const task = generate(seed, props);
    gesehen.add(task.szenario);
    expect(check(task, solution(task))).toBe(true);
    expect(check(task, wrong(task))).toBe(false);
    for (const answer of mistakes(task)) {
      if (answer !== undefined) expect(check(task, answer)).toBe(false);
    }
    expect(Math.max(...solution(task), ...(mistakes(task)[1] ?? []))).toBeLessThanOrEqual(12);
  }
  expect(gesehen.size).toBe(3);
});

test("a little off still counts; one section with the wrong shape does not", () => {
  const task = { szenario: 0, v: 8 };
  expect(check(task, [1, 7, 8, 0])).toBe(true);
  expect(check(task, [0, 8, 6, 0])).toBe(false);
  expect(falscherAbschnitt(task, [0, 8, 6, 0])).toBe(1);
  expect(check(task, [0, 8, 8])).toBe(false);
});

test("the message names the first section that does not fit, or the typical mistake", () => {
  const task = { szenario: 0, v: 8 };
  expect(reason(task, [8, 8, 8, 8], props)).toBe("Die Linie ist überall waagerecht.");
  expect(reason(task, [3, 11, 11, 3], props)).toBe("Die Form stimmt, die Zahlen nicht.");
  expect(reason(task, [0, 8, 5, 0], props)).toBe("Abschnitt 2 (3 bis 6 s) passt nicht.");
  expect(reason(task, [0, 8, 8, 4], props)).toBe("Ein Wert passt nicht.");
});

test("describe, params and show state the task and its solution", () => {
  const task = { szenario: 1, v: 6 };
  expect(describe(task, props, "de")).toEqual({
    task: "Ein Wagen fährt 3 s mit 6 m/s, bremst 3 s auf 3 m/s ab und fährt 3 s mit 3 m/s weiter.",
    solution: "6 m/s bei 0 s, 6 m/s bei 3 s, 3 m/s bei 6 s, 3 m/s bei 9 s",
  });
  expect(params(task, props, "de")["Aufgabe"]).toContain("bremst 3 s auf 3 m/s ab");
  expect(show([1, 2, 3, 4])).toContain("3 m/s bei 6 s");
});
