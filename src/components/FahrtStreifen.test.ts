import { expect, test } from "vite-plus/test";
import {
  about,
  check,
  describe,
  generate,
  KINDS,
  mistakes,
  params,
  positions,
  reason,
  show,
  solution,
  wrong,
} from "./FahrtStreifen.ts";

const props = {
  tasks: ["Bremsen und wenden", "Anfahren und anhalten", "Gleichbleibend fahren"],
  mistakes: [
    "Bremsen ist kein Sprung auf 0.",
    "Wenden ohne Bremsen.",
    "Stillstand ist keine gleichbleibende Fahrt.",
    "Es fehlt das Anhalten.",
  ],
  missing: ["kein Bremsen", "keine Wende", "kein Anfahren", "kein Anhalten", "nicht gleichbleibend"],
};

test("the seed picks the kind of drive in turn", () => {
  expect([1, 2, 3, 4].map((seed) => generate(seed).kind)).toEqual([0, 1, 2, 0]);
  expect(generate(50)).toEqual(generate(50));
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

test("other right drives count: the property decides, not one model drive", () => {
  expect(check({ kind: 0 }, [5, 3, 1, -1, -3])).toBe(true);
  expect(check({ kind: 0 }, [-5, -2, 2, 4, 4])).toBe(true);
  expect(check({ kind: 1 }, [0, 2, 5, 3, 0])).toBe(true);
  expect(check({ kind: 1 }, [-2, -4, -4, -1, 0])).toBe(true);
  expect(check({ kind: 2 }, [-2, -2, -2, -2, -2])).toBe(true);
  expect(check({ kind: 2 }, [-6, -6, -6, -6, -6])).toBe(true);
});

test("typical wrong drives are rejected, each with its reason", () => {
  expect(check({ kind: 0 }, [4, 0, 0, 0, 0])).toBe(false);
  expect(check({ kind: 0 }, [5, 0, 0, 0, -5])).toBe(false);
  expect(check({ kind: 1 }, [2, 6, 0, 0, 0])).toBe(false);
  expect(check({ kind: 1 }, [2, 4, 0, 2, 0])).toBe(false);
  expect(check({ kind: 2 }, [3, 3, 3, 3, 3])).toBe(false);
  expect(reason({ kind: 0 }, [4, 0, 0, 0, 0], props)).toBe(props.mistakes[0]);
  expect(reason({ kind: 0 }, [4, 4, -4, -4, -4], props)).toBe(props.mistakes[1]);
  expect(reason({ kind: 2 }, [0, 0, 0, 0, 0], props)).toBe(props.mistakes[2]);
  expect(reason({ kind: 1 }, [1, 2, 3, 4, 5], props)).toBe(props.mistakes[3]);
  // no typical mistake: the message says what is lacking
  expect(reason({ kind: 0 }, [1, 2, 3, 4, 5], props)).toBe(props.missing[0]);
  expect(reason({ kind: 0 }, [3, 2, 2, 2, 2], props)).toBe(props.missing[1]);
  expect(reason({ kind: 1 }, [3, 2, 1, 0, 0], props)).toBe(props.missing[2]);
  expect(reason({ kind: 2 }, [-3, -3, -3, -3, -2], props)).toBe(props.missing[4]);
  expect(reason({ kind: 2 }, [-3, -3, -3, -3, -3], props)).toBeUndefined();
  expect(reason({ kind: 2 }, [3, 3, 3, 3, 3], props)).toBe(props.missing[4]);
});

test("braking, then turning must come in this order", () => {
  expect(check({ kind: 0 }, [-3, 2, 2, 1, 1])).toBe(false);
  expect(check({ kind: 0 }, [4, 2, 4, 4, 4])).toBe(false);
});

test("a drive with the wrong number of seconds is rejected; positions add the speeds up", () => {
  expect(check({ kind: 2 }, [3, 3, 3])).toBe(false);
  expect(positions([2, 4, -1, 0, 3])).toEqual([0, 2, 6, 5, 5, 8]);
});

test("describe, template, params and show state the task and the drive", () => {
  for (let kind = 0; kind < KINDS; kind++) {
    const task = { kind };
    expect(describe(task, props, "de").task).toBe(props.tasks[kind]);
    expect(params(task, props, "de")).toEqual({ Aufgabe: props.tasks[kind] });
  }
  expect(show([4, 2, 0, -2, -4])).toBe("4, 2, 0, −2, −4 m/s");
});
