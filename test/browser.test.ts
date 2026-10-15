// The choice of the checks' browser where Playwright's own Chromium is missing (check/visit.ts).
import { expect, test } from "vite-plus/test";
import { chooseBrowsers } from "../check/visit.ts";

const installed = ["/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell"];

test("an installed Chromium where downloads are off, else a download as in CI", () => {
  expect(chooseBrowsers({ PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: "1" }, installed)).toEqual([
    { use: "installed", executablePath: installed[0] },
    { use: "download" },
  ]);
  expect(chooseBrowsers({ PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: "1" }, [])).toEqual([{ use: "download" }]);
  expect(chooseBrowsers({}, installed)).toEqual([{ use: "download" }]);
  expect(chooseBrowsers({ PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD: "0" }, installed)).toEqual([{ use: "download" }]);
});
