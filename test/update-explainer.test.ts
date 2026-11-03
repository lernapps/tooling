// `lernapps update` moves an explainer from format 1 to format 2 (learning map): format: 2 and strand: none, only
// where the runtime knows format 2, and never over a format or strand the app already says.
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vite-plus/test";
import { migrateExplainer } from "../generator/update.ts";

const V1 = `# yaml-language-server: $schema=../node_modules/@lernapps/app-templates/runtime/explainer/explainer.v1.schema.json
title: Prozentrechnung
chapters:
  - prozent
`;

describe("migrateExplainer", () => {
  const start = process.cwd();
  let app: string;
  let runtime: string;
  const appYaml = () => readFileSync(join(app, "src/app.yaml"), "utf8");

  beforeEach(() => {
    const root = mkdtempSync(join(tmpdir(), "lernapps-migrate-"));
    app = join(root, "app");
    runtime = join(root, "templates");
    mkdirSync(join(app, "src"), { recursive: true });
    mkdirSync(join(runtime, "runtime/explainer"), { recursive: true });
    writeFileSync(join(app, "src/app.yaml"), V1);
    process.chdir(app);
  });
  afterEach(() => process.chdir(start));

  test("adds format 2 and strand none, and the v2 schema, when the runtime knows format 2", () => {
    writeFileSync(join(runtime, "runtime/explainer/explainer.v2.schema.json"), "{}");
    expect(migrateExplainer(runtime)).toHaveLength(1);
    expect(appYaml()).toBe(V1.replace("v1.schema", "v2.schema").replace("title:", "format: 2\nstrand: none\ntitle:"));
    expect(migrateExplainer(runtime)).toEqual([]);
  });

  test("leaves the app alone when the runtime does not know format 2", () => {
    expect(migrateExplainer(runtime)).toEqual([]);
    expect(appYaml()).toBe(V1);
  });

  test("keeps a strand the app already names", () => {
    writeFileSync(join(runtime, "runtime/explainer/explainer.v2.schema.json"), "{}");
    const named = `format: 2\nstrand: mathematik/stochastik\n${V1}`;
    writeFileSync(join(app, "src/app.yaml"), named);
    expect(migrateExplainer(runtime)).toEqual([]);
    expect(appYaml()).toBe(named);
  });
});
