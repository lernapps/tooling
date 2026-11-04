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
} from "./DiagrammZeichnen.ts";

const props = {
  aufgabe: "Zeichne das Diagramm: {geschichte}",
  bewegungen: [
    { geschichte: "Ein Rad fährt an, rollt und bremst.", v0: 0, v1: 8, v2: 8, v3: 0 },
    { geschichte: "Ein Auto fährt gleichmäßig und bremst dann.", v0: 10, v1: 10, v2: 10, v3: 0 },
    { geschichte: "Ein Roller wird schneller.", v0: 4, v1: 4, v2: 10, v3: 10 },
  ],
  mistakes: ["Bremsen vergessen.", "Anfahren vergessen.", "Von hinten gelesen."],
};

test("every task: the solution is right, the wrong answer and each mistake are not", () => {
  for (let seed = 1; seed <= 50; seed++) {
    const task = generate(seed, props);
    expect(generate(seed, props)).toEqual(task);
    expect(check(task, solution(task))).toBe(true);
    expect(check(task, wrong(task))).toBe(false);
    for (const answer of mistakes(task)) if (answer !== undefined) expect(check(task, answer)).toBe(false);
  }
});

test("the stories come in turn", () => {
  expect(generate(1, props).index).toBe(0);
  expect(generate(2, props).index).toBe(1);
  expect(generate(4, props).index).toBe(0);
});

test("typical mistakes get their message, only where they differ from the solution", () => {
  const rad = generate(1, props);
  expect(mistakes(rad)).toEqual([[0, 8, 8, 8], [8, 8, 8, 0], undefined]);
  expect(reason(rad, [0, 8, 8, 8], props)).toBe("Bremsen vergessen.");
  expect(reason(rad, [8, 8, 8, 0], props)).toBe("Anfahren vergessen.");
  expect(reason(rad, [1, 2, 3, 4], props)).toBeUndefined();
  const auto = generate(2, props);
  expect(mistakes(auto)).toEqual([[10, 10, 10, 10], undefined, [0, 10, 10, 10]]);
  expect(reason(auto, [0, 10, 10, 10], props)).toBe("Von hinten gelesen.");
});

test("another order of the points is not right; the wrong answer stays in range", () => {
  const rad = generate(1, props);
  expect(check(rad, [0, 8, 8])).toBe(false);
  expect(check(rad, [0, 8, 8, 0, 0])).toBe(false);
  const grenze = generate(1, { ...props, bewegungen: [{ geschichte: "x", v0: 0, v1: 12, v2: 12, v3: 12 }] });
  expect(wrong(grenze)[3]).toBe(11);
});

test("describe, template, params and show", () => {
  const task = generate(3, props);
  expect(describe(task, props, "de")).toEqual({
    task: "Zeichne das Diagramm: Ein Roller wird schneller.",
    solution: "Geschwindigkeit bei 0, 4, 8 und 12 s: 4, 4, 10, 10 m/s",
  });
  expect(template(props, "de")).toBe(props.aufgabe);
  expect(params(task, props, "de")).toEqual({ geschichte: "Ein Roller wird schneller." });
  expect(show([1, 2, 3, 4])).toBe("1, 2, 3, 4 m/s");
});
