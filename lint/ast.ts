// Small readers of the syntax tree that several lint rules share.
import type { ESTree } from "vite-plus/lint/plugins";

/** The property name of `a.b` or `a["b"]`; undefined for anything else. */
export function memberName(node: ESTree.Node): string | undefined {
  if (node.type !== "MemberExpression") return undefined;
  const key = node.property;
  if (key.type === "Identifier") return node.computed ? undefined : key.name;
  return key.type === "Literal" && typeof key.value === "string" ? key.value : undefined;
}

/** The static text of a string literal or a template (its expressions as `${}`); undefined for anything else. */
export function staticText(node: ESTree.Node | null | undefined): string | undefined {
  if (!node) return undefined;
  if (node.type === "Literal" && typeof node.value === "string") return node.value;
  if (node.type === "TemplateLiteral")
    return node.quasis.map((quasi) => quasi.value.cooked ?? quasi.value.raw).join("${}");
  return undefined;
}
