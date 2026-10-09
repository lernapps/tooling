// The Playwright configuration of a lernapps app (@lernapps/tooling/playwright): end-to-end tests in e2e/*.e2e.ts
// against the built app, served by `vp preview` on a free port, in Chromium at desktop width and at 360 px. An app's
// playwright.config.ts is
//
//   export { default } from "@lernapps/tooling/playwright";
//
// or `export default playwright({ ... })` with its own settings over these. `lernapps check --pre-push` runs them.
import { createServer } from "node:net";
import { defineConfig, devices, type PlaywrightTestConfig } from "playwright/test";

/** A port nobody listens on now, so that several apps (or test runs) can check at the same time. */
const freePort = () =>
  new Promise<number>((resolve, reject) => {
    const server = createServer();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => resolve(typeof address === "object" && address !== null ? address.port : 4317));
    });
  });

// Chosen once, when Playwright loads this configuration; its workers inherit the variable and load the same port.
const PORT = (process.env["LERNAPPS_PREVIEW_PORT"] ??= String(await freePort()));
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
