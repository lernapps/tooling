// Renders the quiz into the page at build time: every question with its controls, the solutions at the end and the
// data the engine needs. Without JavaScript the page reads as a worksheet with its answer key; with JavaScript the
// engine (engine.ts) turns it into a quiz, one question at a time. The engine and the end-to-end tests rely on the
// ids, classes and data attributes written here.
import { translator } from "../shared/i18n.ts";
import de from "./messages/de.json" with { type: "json" };
import { mixed, type Question, type Quiz } from "./quiz.ts";

const t = translator(de);
const numbers = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 10 });

/** What the engine reads from the page (script#quiz-data). */
export interface QuizData {
  quiz: Quiz;
  /** The name of the app's storage, when the quiz keeps the last result on the device. */
  storage?: string;
}

const escape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export const questionId = (question: Question) => `frage-${question.id}`;
export const solutionId = (question: Question) => `loesung-${question.id}`;

function controls(question: Question): string {
  const name = questionId(question);
  switch (question.type) {
    case "single-choice":
    case "multiple-choice": {
      const type = question.type === "single-choice" ? "radio" : "checkbox";
      return question.options
        .map(
          (option, index) =>
            `<label class="quiz-option"><input type="${type}" name="${name}" value="${index}"> <span>${escape(option.text)}</span></label>`,
        )
        .join("\n");
    }
    case "true-false":
      return [true, false]
        .map(
          (value) =>
            `<label class="quiz-option"><input type="radio" name="${name}" value="${value}"> <span>${t(value ? "true" : "false")}</span></label>`,
        )
        .join("\n");
    case "number":
      return [
        `<label class="quiz-number">${t("yourAnswer")}`,
        `<input type="text" inputmode="decimal" autocomplete="off" name="${name}"${question.unit === undefined ? "" : ` aria-describedby="${name}-unit"`}>`,
        question.unit === undefined ? "" : `<span id="${name}-unit">${escape(question.unit)}</span>`,
        `</label>`,
      ].join(" ");
    case "ordering": {
      const places = question.items
        .map((_item, place) => `<option value="${place}">${t("place", { place: place + 1 })}</option>`)
        .join("");
      return [
        `<p class="quiz-hint">${t("orderHint")}</p>`,
        `<ul class="quiz-pairs">`,
        ...mixed(question.items.length, question.id).map(
          (index) =>
            `<li><label><span>${escape(question.items[index] ?? "")}</span> <select name="${name}-${index}" data-item="${index}"><option value="">${t("choose")}</option>${places}</select></label></li>`,
        ),
        `</ul>`,
      ].join("\n");
    }
    case "matching": {
      const rights = mixed(question.pairs.length, question.id)
        .map((index) => `<option value="${index}">${escape(question.pairs[index]?.right ?? "")}</option>`)
        .join("");
      return [
        `<p class="quiz-hint">${t("matchHint")}</p>`,
        `<ul class="quiz-pairs">`,
        ...question.pairs.map(
          (pair, index) =>
            `<li><label><span>${escape(pair.left)}</span> <select name="${name}-${index}" data-left="${index}"><option value="">${t("choose")}</option>${rights}</select></label></li>`,
        ),
        `</ul>`,
      ].join("\n");
    }
  }
}

function renderQuestion(question: Question): string {
  const id = questionId(question);
  return [
    `<li class="quiz-question" id="${id}" data-id="${question.id}" data-type="${question.type}">`,
    `<form class="quiz-form" novalidate>`,
    `<fieldset>`,
    `<legend class="quiz-text">${escape(question.text)}</legend>`,
    controls(question),
    `</fieldset>`,
    `<div class="quiz-feedback" role="status"></div>`,
    `<p class="quiz-actions" hidden><button type="submit" class="quiz-check">${t("check")}</button> <button type="button" class="quiz-next" hidden>${t("next")}</button></p>`,
    `</form>`,
    `</li>`,
  ].join("\n");
}

function rightAnswerText(question: Question): string {
  switch (question.type) {
    case "single-choice":
    case "multiple-choice":
      return question.options
        .filter((option) => option.correct)
        .map((option) => escape(option.text))
        .join("; ");
    case "true-false":
      return t(question.answer ? "statementTrue" : "statementFalse");
    case "number": {
      const unit = question.unit === undefined ? "" : ` ${escape(question.unit)}`;
      const tolerance =
        question.tolerance > 0
          ? ` ${t("tolerance", { tolerance: `${numbers.format(question.tolerance)}${unit}` })}`
          : "";
      return `${numbers.format(question.answer)}${unit}${tolerance}`;
    }
    case "ordering":
      return question.items.map((item, index) => `${index + 1}. ${escape(item)}`).join(", ");
    case "matching":
      return question.pairs.map((pair) => `${escape(pair.left)} – ${escape(pair.right)}`).join("; ");
  }
}

function optionFeedback(question: Question): string {
  const entries =
    question.type === "single-choice" || question.type === "multiple-choice"
      ? question.options.map((option) => ({ text: option.text, feedback: option.feedback }))
      : question.type === "true-false"
        ? [
            { text: t("true"), feedback: question.feedback.true },
            { text: t("false"), feedback: question.feedback.false },
          ]
        : [];
  if (entries.length === 0) return "";
  return [
    `<p>${t("whyOptions")}</p>`,
    `<ul>`,
    ...entries.map((entry) => `<li><strong>${escape(entry.text)}:</strong> ${escape(entry.feedback)}</li>`),
    `</ul>`,
  ].join("\n");
}

function renderSolution(question: Question): string {
  return [
    `<li class="quiz-solution" id="${solutionId(question)}">`,
    `<h3>${escape(question.text)}</h3>`,
    `<p><strong>${t("rightAnswer")}</strong> ${rightAnswerText(question)}</p>`,
    optionFeedback(question),
    `<p>${escape(question.explanation)}</p>`,
    `<p><a href="#${questionId(question)}">${t("toQuestion")}</a></p>`,
    `</li>`,
  ].join("\n");
}

/** The page's title and description, and the quiz itself for the page's body. */
export function renderQuiz(data: QuizData): { title: string; description: string; body: string } {
  const { quiz } = data;
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  const body = [
    `<main class="quiz" id="quiz">`,
    `<h1>${escape(quiz.title)}</h1>`,
    `<p class="quiz-intro">${escape(quiz.intro)}</p>`,
    `<p class="quiz-howto">${t("howto")}</p>`,
    `<noscript><p>${t("noscript")}</p></noscript>`,
    `<h2 class="quiz-heading">${t("questions")}</h2>`,
    `<p class="quiz-progress" hidden></p>`,
    `<ol class="quiz-questions">`,
    ...quiz.questions.map(renderQuestion),
    `</ol>`,
    `<section class="quiz-result" id="ergebnis" hidden tabindex="-1">`,
    `<h2>${t("result")}</h2>`,
    `<p class="quiz-score"></p>`,
    `<p class="quiz-last" hidden></p>`,
    `<p><a class="quiz-restart" href="./">${t("restart")}</a></p>`,
    `</section>`,
    `<section class="quiz-solutions" id="loesungen">`,
    `<h2>${t("solutions")}</h2>`,
    `<ol>`,
    ...quiz.questions.map(renderSolution),
    `</ol>`,
    `</section>`,
    `</main>`,
    `<footer class="quiz-footer"><p>${t("footer")} · <a href="https://lernapps.net/imprint/">${t("imprint")}</a> · <a href="https://lernapps.net/privacy/">${t("privacy")}</a></p></footer>`,
    `<script type="application/json" id="quiz-data">${json}</script>`,
  ].join("\n");
  return { title: quiz.title, description: quiz.intro, body };
}
