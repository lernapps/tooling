// The site rules of lernapps.net, for an app served there (`--site <path>`): lernapps-check of the site frame
// (@lernapps/site) on the bundle. The site frame owns these rules; this check only reports its messages.
import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import type { Check } from "../check.ts";

const require = createRequire(import.meta.url);

export default {
  id: "site-check",
  url: "https://lernapps.net/tooling/rules/#site-check",
  description: "The bundle of an app on lernapps.net passes lernapps-check of the site frame.",
  severity: "error",
  run: ({ app, site }) => {
    if (site === undefined || app?.bundle === undefined) return undefined;
    const script = join(dirname(require.resolve("@lernapps/site/frame")), "check.mjs");
    const { SITE_PATH_PREFIX: _prefix, ...env } = process.env;
    const result = spawnSync(process.execPath, [script, "--site", site, "--out", app.bundle], {
      encoding: "utf8",
      env,
    });
    if (result.status === 0) return [];
    const lines = `${result.stderr}\n${result.stdout}`.split("\n").filter((line) => line.trim() !== "");
    return lines.map((line) => {
      const at = /^([^\s:]+\.(?:html|css)): (.*)$/.exec(line);
      return {
        where: at?.[1] ?? app.bundle ?? "",
        found: at?.[2] ?? line,
        fix: "Meet the site rules of lernapps.net: nothing loaded from other servers, every link resolves, every page links /privacy/ and /imprint/ (lernapps-check of @lernapps/site)",
      };
    });
  },
} satisfies Check;
