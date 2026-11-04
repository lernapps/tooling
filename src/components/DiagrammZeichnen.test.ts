import { expect, test } from "vite-plus/test";
import {
  check,
  describe,
  generate,
  mistakes,
  params,
  reason,
  solution,
  template,
  wrong,
  type Props,
} from "./DiagrammZeichnen.ts";

const props: Props = {
  aufgaben: [
    { text: "Ein Auto steht und fährt los.", verlauf: "++++00", start: 0 },
    { text: "Ein Fahrrad bremst bis zum Halt.", verlauf: "----00", start: 4, ende: 0 },
    { text: "Ein Bus fährt an, fährt gleichmäßig und bremst bis zum Halt.", verlauf: "++00--", start: 0, ende: 0 },
  ],
  mistakes: ["waagerecht", "vertauscht"],
  abschnitt: "Schau auf den Abschnitt zwischen {a} s und {b} s.",
  endeFalsch: "Start oder Ende passt nicht.",
  anweisung: "Stelle das Diagramm ein.",
  startText: "Das Tempo bei 0 s ist {v} m/s.",
};

test("every drive has a right answer and a wrong one, and the same task for the same seed", () => {
  for (let seed = 1; seed <= 50; seed++) {
    const task = generate(seed, props);
    expect(generate(seed, props)).toEqual(task);
    expect(check(task, solution(task))).toBe(true);
    expect(check(task, wrong(task))).toBe(false);
    for (const answer of mistakes(task)) if (answer !== undefined) expect(check(task, answer)).toBe(false);
  }
});

test("the seeds go through all drives", () => {
  expect(new Set(Array.from({ length: 6 }, (_, i) => generate(i + 1, props).index))).toEqual(new Set([0, 1, 2]));
});

test("another right line is right, too; wrong start, end or direction is not", () => {
  const bus = generate(3, props);
  expect(check(bus, [0, 2, 4, 4, 4, 2, 0])).toBe(true);
  expect(check(bus, [0, 1, 2, 2, 2, 1, 1])).toBe(false);
  expect(check(bus, [1, 2, 3, 3, 3, 2, 0])).toBe(false);
  expect(check(bus, [0, 1, 2, 2, 2, 1])).toBe(false);
  expect(check(bus, [0, 1, 5, 5, 5, 1, 0])).toBe(false);
});

test("reasons: the mistake's message, else the stretch to look at, never the solution", () => {
  const bus = generate(3, props);
  expect(reason(bus, wrong(bus), props)).toBe("waagerecht");
  expect(reason(bus, [0, 1, 2, 3, 3, 2, 0], props)).toBe("Schau auf den Abschnitt zwischen 2 s und 3 s.");
  expect(reason(bus, [1, 2, 3, 3, 3, 2, 0], props)).toBe("Start oder Ende passt nicht.");
  expect(reason(bus, solution(bus), props)).toBeUndefined();
});

test("describe and template state the task as shown", () => {
  const task = generate(2, props);
  expect(describe(task, props, "de").task).toBe(
    "Ein Fahrrad bremst bis zum Halt. Stelle das Diagramm ein. Das Tempo bei 0 s ist 4 m/s.",
  );
  expect(template(props, "de")).toBe("{Aufgabe} Stelle das Diagramm ein. Das Tempo bei 0 s ist {Start} m/s.");
  expect(Object.keys(params(task, props, "de"))).toEqual(["Aufgabe", "Start"]);
});
