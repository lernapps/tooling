// What every lint rule of the plugin shares (docs/arc42 ch. 8, concepts "Rule catalog" and "Terse output"): the rule
// id is the file name in lint/rules/, `meta.docs.url` links the rule's entry on the rule page, and every message ends
// with that link, so the assistant reads what was found, how to fix it and where the rule is explained.
import type { Context, Rule, Visitor } from "vite-plus/lint/plugins";

const RULE_PAGE = "https://lernapps.net/tooling/rules/#";

export interface LintRule {
  /** The rule id, the same as the file name lint/rules/<id>.ts. */
  id: string;
  description: string;
  /** Message templates: what was found and how to fix it, in one or two sentences. */
  messages: Record<string, string>;
  create: (context: Context) => Visitor;
}

/** An ESLint-compatible rule with its link in `meta.docs.url` and in every message. */
export const lintRule = ({ id, description, messages, create }: LintRule): Rule => ({
  meta: {
    type: "problem",
    docs: { description, url: `${RULE_PAGE}${id}` },
    messages: Object.fromEntries(
      Object.entries(messages).map(([key, message]) => [key, `${message} ${RULE_PAGE}${id}`]),
    ),
  },
  create,
});
