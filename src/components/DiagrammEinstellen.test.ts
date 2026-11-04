import { expect, test } from "vite-plus/test";
import {
  STORY_COUNT,
  check,
  describe,
  firstWrong,
  generate,
  mistakes,
  params,
  reason,
  show,
  solution,
  wrong,
} from "./DiagrammEinstellen.ts";

const props = {
  task: "Stelle die Fahrt ein: {story}",
  stories: ["Geschichte 1", "Geschichte 2", "Geschichte 3", "Geschichte 4", "Geschichte 5", "Geschichte 6"],
  kindWords: ["schneller", "gleichbleibend", "langsamer", "Stillstand"],
  sectionName: "Abschnitt {n}",
  sectionWrong: "Abschnitt {n} passt nicht.",
  mistakes: ["Nichts geändert.", "Vertauscht."],
};

test("every task has a solution that passes; the wrong answer and each typical mistake fail", () => {
  for (let seed = 1; seed <= 50; seed++) {
    const task = generate(seed, props);
    expect(task.story).toBeLessThan(STORY_COUNT);
    expect(check(task, solution(task))).toBe(true);
    expect(check(task, wrong(task))).toBe(false);
    for (const answer of mistakes(task)) if (answer !== undefined) expect(check(task, answer)).toBe(false);
    expect(new Set(mistakes(task).map((a) => a?.join())).size).toBe(2);
  }
});

test("other speeds with the same changes also pass", () => {
  // story 1: faster, steady, slower, slower
  expect(check({ story: 0 }, [15, 15, 10, 5])).toBe(true);
  expect(check({ story: 0 }, [20, 20, 5, 0])).toBe(true);
  expect(check({ story: 0 }, [20, 15, 10, 0])).toBe(false);
});

test("the first section that does not fit is named", () => {
  expect(firstWrong({ story: 0 }, [20, 20, 20, 0])).toBe(3);
  expect(reason({ story: 0 }, [20, 20, 20, 0], props)).toBe("Abschnitt 3 passt nicht.");
  expect(reason({ story: 0 }, [10, 10, 10, 10], props)).toBe("Nichts geändert.");
  expect(reason({ story: 0 }, solution({ story: 0 }), props)).toBeUndefined();
});

test("describe, params and show", () => {
  expect(describe({ story: 1 }, props, "de")).toEqual({
    task: "Stelle die Fahrt ein: Geschichte 2",
    solution: "Abschnitt 1: gleichbleibend; Abschnitt 2: langsamer; Abschnitt 3: Stillstand; Abschnitt 4: schneller",
  });
  expect(params({ story: 1 }, props, "de")).toEqual({ story: "Geschichte 2" });
  expect(show([20, 20, 10, 0])).toBe("20, 20, 10, 0 m/s");
});
