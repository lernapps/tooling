// Learner texts only from the message files: a text written into the page from a string in code (textContent,
// innerHTML, a label or title attribute, the document's title, a text node, an alert, JSX text) is reported. Texts come from the
// app's message files through the preset's i18n helper, where they can be read, checked and corrected in one place.
import type { ESTree } from "vite-plus/lint/plugins";
import { memberName, staticText } from "../ast.ts";
import { lintRule } from "../rule.ts";

/** Properties of an element (or the document) that put text in front of the learner. */
const TEXT_PROPERTIES = new Set([
  "textContent",
  "innerText",
  "outerText",
  "innerHTML",
  "outerHTML",
  "title",
  "placeholder",
  "alt",
  "label",
  "ariaLabel",
  "ariaDescription",
  "ariaPlaceholder",
  "ariaRoleDescription",
  "ariaValueText",
]);
/** Attributes that put text in front of the learner. */
const TEXT_ATTRIBUTES = new Set([
  "title",
  "alt",
  "placeholder",
  "label",
  "aria-label",
  "aria-description",
  "aria-placeholder",
  "aria-roledescription",
  "aria-valuetext",
]);
/** Calls that show a text, with the position of the text among their arguments. */
const TEXT_ARGUMENTS = new Map([
  ["createTextNode", 0],
  ["insertAdjacentText", 1],
  ["insertAdjacentHTML", 1],
  ["alert", 0],
  ["confirm", 0],
  ["prompt", 0],
]);

/** The text a learner would read: markup, entities and placeholders removed. */
const visible = (text: string) =>
  text
    .replace(/<[^>]*>/g, " ")
    .replace(/&[#\w]+;/g, " ")
    .replace(/\$\{\}/g, " ");

const hasWords = (text: string) => /\p{L}{2,}/u.test(visible(text));

function calleeName(node: ESTree.CallExpression): string | undefined {
  const callee = node.callee;
  if (callee.type === "Identifier") return callee.name;
  return memberName(callee);
}

export default lintRule({
  id: "learner-text-german",
  description: "Learner texts come from the message files, not from strings in code.",
  messages: {
    found:
      'Learner text in code ("{{text}}"). Put it into the app\'s message file (src/messages/de.json) and show it with translator from @lernapps/tooling/i18n.',
  },
  create(context) {
    const report = (node: ESTree.Node, text: string) => {
      const shown = visible(text).replace(/\s+/g, " ").trim();
      context.report({
        node,
        messageId: "found",
        data: { text: shown.length > 40 ? `${shown.slice(0, 39)}…` : shown },
      });
    };
    return {
      AssignmentExpression(node) {
        const name = memberName(node.left);
        const text = staticText(node.right);
        if (name !== undefined && TEXT_PROPERTIES.has(name) && text !== undefined && hasWords(text)) {
          report(node.right, text);
        }
      },
      CallExpression(node) {
        const name = calleeName(node);
        if (name === undefined) return;
        if (name === "setAttribute") {
          const attribute = staticText(node.arguments[0]);
          const text = staticText(node.arguments[1]);
          if (attribute !== undefined && TEXT_ATTRIBUTES.has(attribute) && text !== undefined && hasWords(text)) {
            report(node, text);
          }
          return;
        }
        const position = TEXT_ARGUMENTS.get(name);
        if (position === undefined) return;
        const argument = node.arguments[position];
        const text = staticText(argument);
        if (argument && text !== undefined && hasWords(text)) report(argument, text);
      },
      JSXText(node) {
        if (hasWords(node.value)) report(node, node.value);
      },
      JSXAttribute(node) {
        const attribute = node.name.type === "JSXIdentifier" ? node.name.name : undefined;
        const text = staticText(node.value);
        if (attribute !== undefined && TEXT_ATTRIBUTES.has(attribute) && text !== undefined && hasWords(text)) {
          report(node, text);
        }
      },
    };
  },
});
