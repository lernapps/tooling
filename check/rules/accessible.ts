// The findings of axe-core for WCAG 2.1 A and AA on each page.
import type { Check } from "../check.ts";

export default {
  id: "accessible",
  url: "https://lernapps.net/tooling/rules/#accessible",
  description: "axe-core finds no violation of WCAG 2.1 A or AA on any page of the built app.",
  severity: "error",
  run: ({ app }) =>
    app?.pages.flatMap(({ page, axe }) =>
      axe.map(({ id, help, helpUrl, targets }) => ({
        where: `${page} ${targets[0] ?? ""}${targets.length > 1 ? ` (and ${targets.length - 1} more)` : ""}`.trim(),
        found: `${help} (axe ${id})`,
        fix: `${help}: ${helpUrl}`,
      })),
    ),
} satisfies Check;
