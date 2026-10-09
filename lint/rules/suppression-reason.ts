// A suppression needs a reason: every comment that turns a lint rule off names the rules and, after `--`, why;
// a type error is suppressed only with `@ts-expect-error` and its reason, never with `@ts-ignore` or `@ts-nocheck`.
// The review reads every suppression with its reason.
import { lintRule } from "../rule.ts";

/** `eslint-disable`, `oxlint-disable`, `-line` and `-next-line`: the rules, then `-- reason`. */
const DISABLE = /^\s*(?:eslint|oxlint)-disable(?:-next-line|-line)?(?=\s|$)(.*)$/s;
const TS_DIRECTIVE = /^\s*\/?\s*@ts-(ignore|nocheck|expect-error)\b(.*)$/s;

export default lintRule({
  id: "suppression-reason",
  description: "Every suppression names its rules and gives its reason.",
  messages: {
    rules: "Suppression without rules. Name the rules it turns off: // oxlint-disable-next-line <rule> -- <reason>.",
    reason: "Suppression without a reason. Write why after --: // oxlint-disable-next-line <rule> -- <reason>.",
    typescript: "@ts-{{directive}} hides every type error. Fix the type, or use // @ts-expect-error -- <reason>.",
    expectError: "@ts-expect-error without a reason. Write why after it: // @ts-expect-error -- <reason>.",
  },
  create(context) {
    return {
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          const loc = comment.loc;
          const disable = DISABLE.exec(comment.value);
          if (disable) {
            const [rules = "", ...reason] = (disable[1] ?? "").split("--");
            if (rules.trim() === "") context.report({ loc, messageId: "rules" });
            else if (reason.join("--").trim() === "") context.report({ loc, messageId: "reason" });
            continue;
          }
          const directive = TS_DIRECTIVE.exec(comment.value);
          if (!directive) continue;
          const [, name = "", rest = ""] = directive;
          if (name !== "expect-error") context.report({ loc, messageId: "typescript", data: { directive: name } });
          else if (rest.replace(/^[\s:-]+/, "").trim() === "") context.report({ loc, messageId: "expectError" });
        }
      },
    };
  },
});
