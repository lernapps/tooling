import { expect, test } from "vite-plus/test";
import {
  about,
  check,
  describe,
  generate,
  KINDS,
  lacking,
  mistakes,
  params,
  reason,
  show,
  solution,
  wrong,
} from "./VtZeichnen.ts";

const props = {
  tasks: ["Stehen, dann schneller", "Gleichmäßig, dann bremsen", "Gegebene Werte"],
  mistakes: ["Alle gleich hoch.", "Sprung auf 0.", "Stillstand ist null hoch.", "Zuerst soll es stehen."],
  missing: ["m0", "m1", "m2", "m3", "m4", "m5"],
};

test("the seed picks the kind of drive in turn", () => {
  expect([1, 2, 3, 4].map((seed) => generate(seed).kind)).toEqual([0, 1, 2, 0]);
});

test("the solution fits, the wrong answer and each typical mistake do not", () => {
  for (let seed = 1; seed <= 50; seed++) {
    const task = generate(seed);
    expect(check(task, solution(task))).toBe(true);
    expect(check(task, wrong(task))).toBe(false);
    for (const answer of mistakes(task)) if (answer !== undefined) expect(check(task, answer)).toBe(false);
    expect(mistakes(task)).toHaveLength(about.mistakes.length);
  }
});

test("other right drawings count where the text allows them", () => {
  expect(check({ kind: 0 }, [0, 1, 3, 4, 9])).toBe(true);
  expect(check({ kind: 0 }, [0, 5, 6, 7, 8])).toBe(true);
  expect(check({ kind: 1 }, [8, 8, 5, 3, 0])).toBe(true);
  expect(check({ kind: 1 }, [4, 4, 3, 2, 0])).toBe(true);
  expect(check({ kind: 1 }, [4, 4, 3, 2, 1])).toBe(false);
});

test("the given drive needs exactly its values", () => {
  expect(check({ kind: 2 }, [6, 6, 0, 3, 3])).toBe(true);
  expect(check({ kind: 2 }, [6, 6, 0, 3, 4])).toBe(false);
  expect(check({ kind: 2 }, [6, 0, 0, 3, 3])).toBe(false);
});

test("answers out of range or of the wrong length are rejected", () => {
  expect(check({ kind: 0 }, [0, 2, 4, 6])).toBe(false);
  expect(check({ kind: 0 }, [0, 2, 4, 6, 11])).toBe(false);
  expect(check({ kind: 0 }, [0, 2, 4, 6, 8.5])).toBe(false);
});

test("each wrong drawing gets its reason: a typical mistake first, else what is lacking", () => {
  expect(reason({ kind: 1 }, [5, 5, 5, 5, 5], props)).toBe(props.mistakes[0]);
  expect(reason({ kind: 1 }, [6, 6, 0, 0, 0], props)).toBe(props.mistakes[1]);
  expect(reason({ kind: 2 }, [6, 6, 6, 3, 3], props)).toBe(props.mistakes[2]);
  expect(reason({ kind: 0 }, [2, 3, 4, 5, 6], props)).toBe(props.mistakes[3]);
  expect(reason({ kind: 0 }, [0, 3, 3, 5, 6], props)).toBe(props.missing[1]);
  expect(reason({ kind: 1 }, [6, 5, 4, 3, 2], props)).toBe(props.missing[2]);
  expect(reason({ kind: 1 }, [6, 6, 5, 4, 3], props)).toBe(props.missing[4]);
  expect(reason({ kind: 2 }, [1, 1, 1, 1, 1], props)).toBe(props.missing[5]);
  expect(reason({ kind: 0 }, [0, 2, 4, 6, 8], props)).toBeUndefined();
  expect(lacking({ kind: 1 }, [6, 6, 4, 2, 0])).toEqual([]);
});

test("describe, params and show state the task and the drawing", () => {
  for (let kind = 0; kind < KINDS; kind++) {
    expect(describe({ kind }, props, "de").task).toBe(props.tasks[kind]);
    expect(params({ kind }, props, "de")).toEqual({ Aufgabe: props.tasks[kind] });
  }
  expect(show([0, 2, 4, 6, 8])).toBe("0, 2, 4, 6, 8 m/s");
});
