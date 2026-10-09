// The Playwright configuration of a lernapps app (@lernapps/tooling/playwright): end-to-end tests in e2e/*.e2e.ts
// against the built app, served by `vp preview`, in Chromium at desktop width and at 360 px. An app's
// playwright.config.ts is
//
//   export { default } from "@lernapps/tooling/playwright";
//
// or `export default playwright({ ... })` with its own settings over these. `lernapps check --pre-push` runs them.
import { defineConfig, devices, type PlaywrightTestConfig } from "playwright/test";

const PORT = 4317;
const URL = `http://127.0.0.1:${PORT}/`;

const base: PlaywrightTestConfig = {
  testDir: "e2e",
  testMatch: "*.e2e.ts",
  forbidOnly: true,
  reporter: [["line"]],
  use: { baseURL: URL },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "360px", use: { ...devices["Desktop Chrome"], viewport: { width: 360, height: 740 } } },
  ],
  webServer: { command: `vp preview --host 127.0.0.1 --port ${PORT} --strictPort`, url: URL },
};

/** The configuration, with the app's own settings over it. */
export const playwright = (config: PlaywrightTestConfig = {}) => defineConfig(base, config);

export default playwright();
