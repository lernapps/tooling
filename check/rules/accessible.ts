// The findings of axe-core for WCAG 2.1 A and AA on each page; warnings when the entry declares the app's limits.
import { declaredLimit, type Check } from "../check.ts";

export default {
  id: "accessible",
  url: "https://lernapps.net/tooling/rules/#accessible",
  description:
    "axe-core finds no violation of WCAG 2.1 A or AA on any page of the built app; warnings when the entry declares the app's limits.",
  severity: "error",
  run: (context) => {
    const severity = declaredLimit(context);
    return context.app?.pages.flatMap(({ page, axe }) =>
      axe.map(({ id, help, helpUrl, targets }) => ({
        ...(severity ? { severity } : {}),
        where: `${page} ${targets[0] ?? ""}${targets.length > 1 ? ` (and ${targets.length - 1} more)` : ""}`.trim(),
        found: `${help} (axe ${id})`,
        fix: `${help}: ${helpUrl}`,
      })),
    );
  },
} satisfies Check;
