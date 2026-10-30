// A catalog entry (`--entry <file>`) against the app: the fitness values it declares match what the visit
// measured. Measured without a click, so the check only catches what the entry cannot be: an app that stores on
// the device, or reads stored data while loading and so keeps it after an input, while the entry says
// `storage: none`.
import type { Check } from "../check.ts";

export default {
  id: "entry-fitness-matches",
  url: "https://lernapps.net/tooling/rules/#entry-fitness-matches",
  description: "The fitness values of the catalog entry match the values measured on the app.",
  severity: "error",
  run: ({ entry, app }) => {
    if (!entry || !app) return undefined;
    const declared = entry.value.fitness?.storage;
    if (declared !== "none" || app.fitness.storage === "none") return [];
    // what it stored, or else what it read on loading and so keeps after an input
    const stored = [
      ...new Set(
        app.pages.flatMap((page) => [
          ...page.storage,
          ...page.cookies,
          ...page.access.map((access) => `${access.area} ${access.name}`),
        ]),
      ),
    ];
    return [
      {
        where: `${entry.file}: fitness.storage`,
        found: `the entry says storage: none, but the app stores on the device (${stored.join(", ")})`,
        fix: "Set fitness.storage to device in the entry, or let the app store nothing",
      },
    ];
  },
} satisfies Check;
