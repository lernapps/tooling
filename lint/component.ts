// What the lint rules of components share (lint/rules/vue-component-*.ts): which files are a component's code, and
// the lists the explainer's build checks on the SFC compiler's output (runtime/explainer/components.ts of
// lernapps/app-templates), so that the editor reports the same as the build, with the same rule ids and wording.
// Oxlint reaches the <script setup> of a .vue file, not its template: what only the template can do (v-html) is
// left to the build.
import type { Context, ESTree } from "vite-plus/lint/plugins";

/**
 * A component's code: a Vue single-file component, or a module next to the components in src/components/ (an
 * exercise's logic module <Name>.ts); not their tests, which run in Node and import the test runner.
 */
export function isComponentCode(filename: string): boolean {
  const path = filename.split("\\").join("/");
  if (path.endsWith(".vue")) return true;
  return /(^|\/)src\/components\/[^/]+\.ts$/.test(path) && !path.endsWith(".test.ts");
}

/** What a component may import from besides its own folder. */
export const TOOLING_IMPORTS = ["@lernapps/tooling/storage", "@lernapps/tooling/i18n", "@lernapps/tooling/a11y"];
export const IMPORTS = `vue, @lernapps/app-templates, ${TOOLING_IMPORTS.join(", ")} and its own folder`;

/** The globals that make a request. */
export const NETWORK = new Set(["fetch", "XMLHttpRequest", "WebSocket", "EventSource"]);

/** The globals that exist only in a browser, not while the build renders the component. */
export const BROWSER = new Set([
  "window",
  "document",
  "navigator",
  "location",
  "history",
  "localStorage",
  "sessionStorage",
  "indexedDB",
  "matchMedia",
  "requestAnimationFrame",
  "cancelAnimationFrame",
  "getComputedStyle",
  "alert",
  "confirm",
  "prompt",
  "screen",
  "customElements",
  "IntersectionObserver",
  "ResizeObserver",
  "MutationObserver",
]);

/** The hooks that never run while the build renders the component: inside them, browser globals are allowed. */
export const BROWSER_HOOKS = new Set(["onMounted", "onBeforeUnmount", "onUnmounted"]);

/** The objects through which a global is reached: window.fetch. */
export const GLOBAL_OBJECTS = new Set(["window", "self", "globalThis"]);

/** An import's source as written, and the node to report: static imports, re-exports and dynamic imports. */
export function importSource(node: ESTree.Node): { source: string; node: ESTree.Node } | undefined {
  if (node.type === "ImportDeclaration") {
    return node.importKind === "type" ? undefined : { source: node.source.value, node };
  }
  if (node.type === "ExportNamedDeclaration" || node.type === "ExportAllDeclaration") {
    if (node.source === null || node.exportKind === "type") return undefined;
    return { source: node.source.value, node };
  }
  if (node.type === "ImportExpression") {
    const source = node.source;
    return {
      source: source.type === "Literal" && typeof source.value === "string" ? source.value : "(an expression)",
      node,
    };
  }
  return undefined;
}

/** A URL as an import's source: a scheme (https:, data:) or protocol-relative. */
export const isUrl = (source: string) => /^[a-z][a-z0-9+.-]*:|^\/\//i.test(source);

/**
 * Whether an identifier is a reference to a global of the browser or the runtime: a name the code reads that no
 * scope of the file declares (Oxlint's isGlobalReference knows only the globals it is configured with). A property
 * name (a.fetch, { fetch: … }) is no reference.
 */
export function isFreeReference(context: Context, node: ESTree.IdentifierReference): boolean {
  const parent = node.parent;
  if (parent.type === "MemberExpression" && parent.property === node && !parent.computed) return false;
  if (
    (parent.type === "Property" || parent.type === "MethodDefinition" || parent.type === "PropertyDefinition") &&
    parent.key === node &&
    !parent.computed &&
    !(parent.type === "Property" && parent.shorthand)
  ) {
    return false;
  }
  for (
    let scope: ReturnType<Context["sourceCode"]["getScope"]> | null = context.sourceCode.getScope(node);
    scope;
    scope = scope.upper
  ) {
    if (scope.type !== "global" && scope.set.has(node.name)) return false;
  }
  return true;
}
