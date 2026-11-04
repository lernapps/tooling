import { expect, test } from "vite-plus/test";
import {
  check,
  describe,
  generate,
  mistakes,
  params,
  reason,
  solution,
  speedsFor,
  template,
  wrong,
  type Props,
} from "./GeschichteEinstellen.ts";

const props: Props = {
  stories: [
    { text: "Anna fährt los, rollt und bremst.", v0: 0, c1: "mehr", c2: "gleich", c3: "weniger" },
    { text: "Ben bremst, rollt und fährt wieder an.", v0: 6, c1: "weniger", c2: "gleich", c3: "mehr" },
    { text: "Clara rollt, wird schneller und noch schneller.", v0: 3, c1: "gleich", c2: "mehr", c3: "mehr" },
  ],
  task: "Lies die Geschichte.",
  sectionLabel: "Abschnitt {n}",
  more: "schneller",
  same: "gleich",
  less: "langsamer",
  mistakes: ["gleich {n}", "Änderung {n}", "Richtung {n}"],
};

test("the right choices pass; the turned direction and each mistake fail", () => {
  for (let seed = 1; seed <= 50; seed++) {
    const task = generate(seed, props);
    expect(check(task, solution(task))).toBe(true);
    expect(check(task, wrong(task))).toBe(false);
    for (const answer of mistakes(task)) if (answer !== undefined) expect(check(task, answer)).toBe(false);
  }
});

test("the same seed gives the same task", () => {
  expect(generate(7, props)).toEqual(generate(7, props));
});

test("the speeds follow the choices and stay between 0 and 10 m/s", () => {
  expect(speedsFor(0, ["mehr", "gleich", "weniger"])).toEqual([3, 3, 0]);
  expect(speedsFor(9, ["mehr", "mehr", "mehr"])).toEqual([10, 10, 10]);
  expect(speedsFor(0, ["weniger", "", ""])).toEqual([0, 0, 0]);
});

test("every story stays inside the speed range with its right choices", () => {
  for (const story of props.stories) {
    const speeds = speedsFor(story.v0, [story.c1, story.c2, story.c3]);
    expect(speeds.every((v) => v >= 0 && v <= 10)).toBe(true);
  }
});

test("each kind of mistake gets its message for the first wrong section", () => {
  const task = generate(1, props);
  expect(reason(task, ["gleich", "gleich", "weniger"], props)).toBe("gleich 1");
  expect(reason(task, ["mehr", "mehr", "weniger"], props)).toBe("Änderung 2");
  expect(reason(task, ["mehr", "gleich", "mehr"], props)).toBe("Richtung 3");
  expect(reason(task, solution(task), props)).toBeUndefined();
});

test("the mistakes for the tutor give the message of their kind", () => {
  const task = generate(1, props);
  const [a, b, c] = mistakes(task);
  expect(reason(task, a as string[], props)).toBe("gleich 1");
  expect(reason(task, b as string[], props)).toBe("Änderung 2");
  expect(reason(task, c as string[], props)).toBe("Richtung 1");
});

test("describe, template and params state the task", () => {
  const task = generate(1, props);
  expect(describe(task, props, "de")).toEqual({
    task: "Lies die Geschichte. Anna fährt los, rollt und bremst.",
    solution: "Abschnitt 1: schneller; Abschnitt 2: gleich; Abschnitt 3: langsamer",
  });
  expect(template(props, "de")).toBe("Lies die Geschichte. {geschichte}");
  expect(params(task, props, "de")).toEqual({ geschichte: "Anna fährt los, rollt und bremst." });
});
