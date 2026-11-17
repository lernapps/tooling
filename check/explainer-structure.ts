// What an explainer page is made of, counted from its YAML alone, for the checks explainer-text-load,
// explainer-repetition, explainer-interaction and explainer-exercise-variety: words of reading text and of feedback,
// the longest run of text blocks, what opens the page, the kinds of exercise, and phrases the page says twice. No
// build, no browser, no model: the same page gives the same numbers.
import { parse } from "yaml";

/** Blocks that are prose for the learner to read. */
const PROSE = new Set(["text", "definition", "quote"]);
/** Boxes: their blocks count as part of the page, in order. */
const BOXES = new Set(["section", "example", "note"]);
/** What shows something to look at: no reading needed first. */
const VISUAL = new Set(["figure", "labelled-figure", "table", "timeline", "video", "formula", "code"]);
/** An answer chosen from given options: a learner can guess it. */
const CHOICE = new Set(["single-choice", "true-false", "multiple-choice"]);
/** Every exercise block of the explainer. */
const EXERCISE = new Set([
  "single-choice",
  "multiple-choice",
  "true-false",
  "number",
  "ordering",
  "matching",
  "generated",
  "language-task",
  "speaking-task",
  "open-task",
]);

export interface PageMetrics {
  /** Words the learner reads before and besides the exercises: text, definitions, quotes, table and box titles not counted. */
  proseWords: number;
  /** Words of the exercises' own texts: the task, the explanation, background of options, hints, steps, messages. */
  feedbackWords: number;
  /** The longest run of prose blocks with nothing to look at or do between them, in document order. */
  longestProseRun: number;
  /** Position (1-based, among the page's blocks in document order, sections left out) of the first figure, table, exercise or component, or 0 when there is none. */
  firstActivity: number;
  /** One entry per exercise: its kind (`language-task` with its mode, `vue-component`, the quiz type). */
  exercises: string[];
  /** Exercises a learner can answer by guessing from options: single-choice, true-false, multiple-choice. */
  choiceExercises: number;
  /** Blocks that need a hand: components. Exercises are counted in `exercises`. */
  components: number;
  /**
   * Phrases of five words that two blocks of the same part of the page say: two text blocks, or two exercises of one type
   * (lower case). A phrase said by the text and again by an exercise, or by exercises of different types, is not listed:
   * repeating in another form is a way to teach.
   */
  repeated: string[];
}

type Obj = Record<string, unknown>;
const isObj = (value: unknown): value is Obj => typeof value === "object" && value !== null && !Array.isArray(value);
const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

const WORD = /[\p{L}\p{N}][\p{L}\p{N}'’-]*/gu;
/** The words of a text, Markdown marks and formulas left out. */
export const wordsOf = (text: string): string[] =>
  (text.replace(/\$[^$]*\$/g, " ").match(WORD) ?? []).map((w) => w.toLowerCase());

/** The text of a field as a string: a string, or the German of a language map. */
function str(value: unknown): string {
  if (typeof value === "string") return value;
  if (isObj(value) && typeof value["de"] === "string") return value["de"];
  return "";
}

/** The texts of an exercise that explain or comment: what a learner reads after an answer or on a hint. */
function feedbackTexts(block: Obj): string[] {
  const texts = [str(block["explanation"]), str(block["hint"])];
  for (const option of list(block["options"])) if (isObj(option)) texts.push(str(option["info"]));
  for (const mistake of list(block["mistakes"])) if (isObj(mistake)) texts.push(str(mistake["message"]));
  for (const step of list(block["steps"])) texts.push(str(step));
  for (const item of list(block["items"])) {
    if (!isObj(item)) continue;
    for (const mistake of list(item["mistakes"])) if (isObj(mistake)) texts.push(str(mistake["message"]));
  }
  return texts.filter((text) => text !== "");
}

/** The five-word phrases of a text. */
function shingles(words: string[]): Set<string> {
  const found = new Set<string>();
  for (let i = 0; i + 5 <= words.length; i++) found.add(words.slice(i, i + 5).join(" "));
  return found;
}

/** The kind of an exercise as the variety check counts it. */
const kindOf = (block: Obj): string =>
  block["type"] === "language-task" ? `language-task:${str(block["mode"]) || "write"}` : String(block["type"]);

/**
 * The numbers of one page. Anything that is not a page of blocks (a recap page has no exercise but is still read) gives
 * the numbers of what it has.
 */
export function measurePage(text: string): PageMetrics {
  let value: unknown;
  try {
    value = parse(text);
  } catch {
    value = undefined;
  }
  const flat: Obj[] = [];
  const walk = (blocks: unknown): void => {
    for (const block of list(blocks)) {
      if (!isObj(block)) continue;
      if (BOXES.has(String(block["type"]))) {
        if (block["type"] !== "section") flat.push(block);
        walk(block["blocks"]);
      } else flat.push(block);
    }
  };
  walk(isObj(value) ? value["blocks"] : undefined);

  let proseWords = 0;
  let feedbackWords = 0;
  let run = 0;
  let longestProseRun = 0;
  let firstActivity = 0;
  let components = 0;
  let choiceExercises = 0;
  const exercises: string[] = [];
  /** One entry per block: its part (text, or the type of the exercise) and the phrases it says. */
  const said: { part: string; phrases: Set<string> }[] = [];
  let position = 0;

  for (const block of flat) {
    const type = String(block["type"]);
    if (type === "example" || type === "note") continue; // the blocks inside count, in order
    position++;
    const active = EXERCISE.has(type) || VISUAL.has(type) || type === "vue-component";
    if (active && firstActivity === 0) firstActivity = position;
    if (PROSE.has(type)) {
      const texts = [str(block["text"]), str(block["explanation"])].filter((t) => t !== "");
      const words = texts.flatMap(wordsOf);
      proseWords += words.length;
      said.push({ part: "text", phrases: shingles(words) });
      run++;
      longestProseRun = Math.max(longestProseRun, run);
      continue;
    }
    run = 0;
    if (type === "vue-component") components++;
    if (EXERCISE.has(type)) {
      exercises.push(kindOf(block));
      if (CHOICE.has(type)) choiceExercises++;
      const task = [str(block["text"]), str(block["task"])].flatMap(wordsOf);
      const feedback = feedbackTexts(block).flatMap(wordsOf);
      feedbackWords += task.length + feedback.length;
      said.push({ part: type, phrases: shingles(feedbackTexts(block).flatMap(wordsOf)) });
    }
  }

  const count = new Map<string, number>();
  for (const { part, phrases } of said)
    for (const phrase of phrases) count.set(`${part}\n${phrase}`, (count.get(`${part}\n${phrase}`) ?? 0) + 1);
  const repeated = [...count].filter(([, n]) => n > 1).map(([key]) => key.slice(key.indexOf("\n") + 1));
  return {
    proseWords,
    feedbackWords,
    longestProseRun,
    firstActivity,
    exercises,
    choiceExercises,
    components,
    repeated,
  };
}
