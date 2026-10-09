// URLs of other hosts in code: what the app loads from another server instead of bundling it. The check of the built
// app finds the requests made before a click; this rule finds their source early, in the editor and on commit.
// Content that the app loads only after the learner clicks for it is suppressed where it occurs, with that reason.
import type { ESTree } from "vite-plus/lint/plugins";
import { lintRule } from "../rule.ts";

/** An absolute or protocol-relative URL and its host. */
const URL_PATTERN = /(?:\bhttps?:)?\/\/((?:[a-z0-9-]+\.)+[a-z]{2,})(?=[/:?#"'`\s]|$)/gi;

/** Hosts that are no request of the app: the platform (imprint, privacy notice) and XML namespaces. */
const ALLOWED = [/(^|\.)lernapps\.net$/i, /^www\.w3\.org$/i];

function otherHosts(text: string): string[] {
  return [...text.matchAll(URL_PATTERN)]
    .map((match) => match[1] ?? "")
    .filter((host) => host !== "" && !ALLOWED.some((allowed) => allowed.test(host)));
}

export default lintRule({
  id: "no-request-before-click",
  description: "No URL of another host in code: bundle what the app needs; load other servers only after a click.",
  messages: {
    found:
      "URL of another host in code ({{host}}). Bundle the file with the app at build time; if the learner clicks to load it, suppress here with that reason (-- loaded after a click).",
  },
  create(context) {
    const check = (node: ESTree.Node, text: string) => {
      for (const host of new Set(otherHosts(text))) context.report({ node, messageId: "found", data: { host } });
    };
    return {
      Literal(node) {
        if (typeof node.value === "string") check(node, node.value);
      },
      TemplateLiteral(node) {
        check(node, node.quasis.map((quasi) => quasi.value.cooked ?? quasi.value.raw).join("${}"));
      },
      JSXText(node) {
        check(node, node.value);
      },
    };
  },
});
