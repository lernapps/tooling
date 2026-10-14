// A component makes no network request: no fetch, XMLHttpRequest, WebSocket, EventSource or sendBeacon, and no import
// from a URL. What it needs comes through its props or is bundled. The explainer's build checks the same on the SFC
// compiler's output, with the same wording (lint/component.ts); this rule reports it in the editor and on commit.
import type { ESTree } from "vite-plus/lint/plugins";
import { memberName } from "../ast.ts";
import { GLOBAL_OBJECTS, importSource, isComponentCode, isFreeReference, isUrl, NETWORK } from "../component.ts";
import { lintRule } from "../rule.ts";

export default lintRule({
  id: "vue-component-no-network",
  description: "A component makes no network request and imports nothing from a URL.",
  messages: {
    request: "{{name}}: a component makes no network request; give it what it needs through its props.",
    beacon: "sendBeacon: a component makes no network request.",
    import: "an import from {{source}}; a component loads nothing from the network, so bundle what it needs.",
  },
  create(context) {
    if (!isComponentCode(context.filename)) return {};
    const fromUrl = (node: ESTree.Node) => {
      const found = importSource(node);
      if (found !== undefined && isUrl(found.source)) {
        context.report({ node: found.node, messageId: "import", data: { source: found.source } });
      }
    };
    return {
      ImportDeclaration: fromUrl,
      ExportNamedDeclaration: fromUrl,
      ExportAllDeclaration: fromUrl,
      ImportExpression: fromUrl,
      Identifier(node: ESTree.IdentifierReference) {
        if (NETWORK.has(node.name) && isFreeReference(context, node)) {
          context.report({ node, messageId: "request", data: { name: node.name } });
        }
      },
      MemberExpression(node) {
        const key = memberName(node);
        if (key === "sendBeacon") context.report({ node, messageId: "beacon" });
        else if (
          key !== undefined &&
          NETWORK.has(key) &&
          node.object.type === "Identifier" &&
          GLOBAL_OBJECTS.has(node.object.name)
        ) {
          context.report({ node, messageId: "request", data: { name: key } });
        }
      },
    };
  },
});
