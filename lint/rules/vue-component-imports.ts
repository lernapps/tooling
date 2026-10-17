// A component imports only from vue, the runtime @lernapps/app-templates, @lernapps/tooling/storage, i18n and a11y,
// and its own folder (./<file>): the build bundles it into its island, and what it may do is checked there. Types may
// come from anywhere. The explainer's build checks the same, with the same wording (lint/component.ts). With the
// option { scope: "src" }, which the preset sets for an interactive app (archetypes/shared/preset.ts), a component may
// also import the app's own files in src/ and the libraries in the dependencies of its package.json, as the
// interactive runtime's build allows.
import { readFileSync } from "node:fs";
import { dirname, join, posix, relative } from "node:path";
import type { ESTree } from "vite-plus/lint/plugins";
import { importSource, IMPORTS, isComponentCode, isUrl, TOOLING_IMPORTS } from "../component.ts";
import { lintRule } from "../rule.ts";

const allowed = (source: string) =>
  source === "vue" ||
  source === "@lernapps/app-templates" ||
  source.startsWith("@lernapps/app-templates/") ||
  TOOLING_IMPORTS.includes(source) ||
  (source.startsWith("./") && !source.slice(2).includes("/"));

const SOURCE_IMPORTS = `${IMPORTS}, the app's own files in src/ and the libraries in the dependencies of package.json`;

/** The libraries in the dependencies of the package.json in `cwd`. */
function dependencies(cwd: string): string[] {
  try {
    const manifest = JSON.parse(readFileSync(join(cwd, "package.json"), "utf8")) as {
      dependencies?: Record<string, string>;
    };
    return Object.keys(manifest.dependencies ?? {});
  } catch {
    return [];
  }
}

/** Whether `source`, imported in `file`, is one of the app's files in src/ or a library of its dependencies. */
function inSourceScope(cwd: string, file: string, source: string, libraries: readonly string[]): boolean {
  if (source.startsWith("./") || source.startsWith("../")) {
    const from = relative(cwd, dirname(file)).split("\\").join("/");
    return posix.normalize(posix.join(from, source)).startsWith("src/");
  }
  return libraries.some((name) => source === name || source.startsWith(`${name}/`));
}

export default lintRule({
  id: "vue-component-imports",
  description:
    "A component imports only from vue, the runtime, @lernapps/tooling's storage, i18n and a11y, and its own folder.",
  messages: {
    import: `an import from {{source}}; a component imports only from {{allowed}}.`,
  },
  schema: [{ type: "object", properties: { scope: { type: "string", enum: ["src"] } }, additionalProperties: false }],
  create(context) {
    if (!isComponentCode(context.filename)) return {};
    const sourceScope = (context.options[0] as { scope?: string } | undefined)?.scope === "src";
    const cwd = context.cwd;
    const libraries = sourceScope ? dependencies(cwd) : [];
    const check = (node: ESTree.Node) => {
      const found = importSource(node);
      // an import from a URL is vue-component-no-network's
      if (found === undefined || isUrl(found.source) || allowed(found.source)) return;
      if (sourceScope && inSourceScope(cwd, context.filename, found.source, libraries)) return;
      context.report({
        node: found.node,
        messageId: "import",
        data: { source: found.source, allowed: sourceScope ? SOURCE_IMPORTS : IMPORTS },
      });
    };
    return {
      ImportDeclaration: check,
      ExportNamedDeclaration: check,
      ExportAllDeclaration: check,
      ImportExpression: check,
    };
  },
});
