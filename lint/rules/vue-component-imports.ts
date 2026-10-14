// A component imports only from vue, the runtime @lernapps/app-templates, @lernapps/tooling/storage, i18n and a11y,
// and its own folder (./<file>): the build bundles it into its island, and what it may do is checked there. Types may
// come from anywhere. The explainer's build checks the same, with the same wording (lint/component.ts).
import type { ESTree } from "vite-plus/lint/plugins";
import { importSource, IMPORTS, isComponentCode, isUrl, TOOLING_IMPORTS } from "../component.ts";
import { lintRule } from "../rule.ts";

const allowed = (source: string) =>
  source === "vue" ||
  source === "@lernapps/app-templates" ||
  source.startsWith("@lernapps/app-templates/") ||
  TOOLING_IMPORTS.includes(source) ||
  (source.startsWith("./") && !source.slice(2).includes("/"));

export default lintRule({
  id: "vue-component-imports",
  description:
    "A component imports only from vue, the runtime, @lernapps/tooling's storage, i18n and a11y, and its own folder.",
  messages: {
    import: `an import from {{source}}; a component imports only from ${IMPORTS}.`,
  },
  create(context) {
    if (!isComponentCode(context.filename)) return {};
    const check = (node: ESTree.Node) => {
      const found = importSource(node);
      // an import from a URL is vue-component-no-network's
      if (found === undefined || isUrl(found.source) || allowed(found.source)) return;
      context.report({ node: found.node, messageId: "import", data: { source: found.source } });
    };
    return {
      ImportDeclaration: check,
      ExportNamedDeclaration: check,
      ExportAllDeclaration: check,
      ImportExpression: check,
    };
  },
});
