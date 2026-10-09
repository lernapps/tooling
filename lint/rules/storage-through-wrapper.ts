// Storage only through the preset's wrapper (@lernapps/tooling/storage): it keeps data on the device, under the app's
// own prefix (apps on lernapps.net share one origin), and keeps the app working when the browser blocks storage.
// Direct use of the browser's storage and any cookie is reported.
import type { ESTree } from "vite-plus/lint/plugins";
import { memberName } from "../ast.ts";
import { lintRule } from "../rule.ts";

const STORAGE = new Set(["localStorage", "sessionStorage", "indexedDB"]);
const GLOBALS = new Set(["window", "globalThis", "self"]);

const name = (node: ESTree.Node): string | undefined => (node.type === "Identifier" ? node.name : undefined);

export default lintRule({
  id: "storage-through-wrapper",
  description: "Store only through createStorage of @lernapps/tooling/storage, on the device; no cookies.",
  messages: {
    storage:
      "{{what}} used directly. Store through createStorage from @lernapps/tooling/storage: it keeps the data on the device, under the app's prefix, and works when storage is blocked.",
    cookie:
      "Cookie set or read. Set no cookies; keep what the app must remember on the device through createStorage from @lernapps/tooling/storage.",
  },
  create(context) {
    return {
      Identifier(node: ESTree.IdentifierReference) {
        if (!STORAGE.has(node.name)) return;
        const parent = node.parent;
        // a property of something else (`settings.localStorage`), or a key in an object literal
        if (parent.type === "MemberExpression" && parent.property === node && !parent.computed) return;
        if (parent.type === "Property" && parent.key === node && !parent.computed && !parent.shorthand) return;
        context.report({ node, messageId: "storage", data: { what: node.name } });
      },
      MemberExpression(node) {
        const key = memberName(node);
        if (key === undefined) return;
        const object = name(node.object);
        if (object !== undefined && GLOBALS.has(object) && STORAGE.has(key)) {
          context.report({ node, messageId: "storage", data: { what: key } });
        } else if (object === "document" && key === "cookie") {
          context.report({ node, messageId: "cookie" });
        }
      },
    };
  },
});
