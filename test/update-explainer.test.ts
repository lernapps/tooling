// `lernapps update` moves an explainer from format 1 to format 2 (learning map): format: 2 and strand: none, only
// where the runtime knows format 2 (the one this tooling depends on does), and never over a format or strand the app
// already says. The runtime an app gets: ^ a released version, or the commit this tooling depends on.
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "vite-plus/test";
import { migrateExplainer, removeMapLinks } from "../generator/update.ts";
import { runtimeSpec } from "../generator/create.ts";
import { appTemplates, repoRoot } from "./support.ts";

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

  test("is active with the runtime this tooling depends on: it knows format 2", () => {
    expect(migrateExplainer(appTemplates())).toHaveLength(1);
    expect(appYaml()).toMatch(/^format: 2\nstrand: none$/m);
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

describe("runtimeSpec", () => {
  test("a released runtime is ^ its version; one built from a commit is the commit this tooling depends on", () => {
    expect(runtimeSpec("0.3.0")).toBe("^0.3.0");
    const own = (
      JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8")) as {
        dependencies: Record<string, string>;
      }
    ).dependencies["@lernapps/app-templates"];
    expect(runtimeSpec("0.0.0")).toBe(own);
  });
});

describe("removeMapLinks", () => {
  const start = process.cwd();
  let app: string;
  const file = () => readFileSync(join(app, "src/prozent/seite.yaml"), "utf8");
  const MAP = "https://lernapps.net/apps/map/mathematik/c/prozent/";

  beforeEach(() => {
    app = mkdtempSync(join(tmpdir(), "lernapps-maplinks-"));
    mkdirSync(join(app, "src/prozent"), { recursive: true });
    writeFileSync(join(app, "src/app.yaml"), V1);
    process.chdir(app);
  });
  afterEach(() => process.chdir(start));

  const write = (text: string) => writeFileSync(join(app, "src/prozent/seite.yaml"), text);

  test("removes the map links of a question, with the other links, comments and layout kept", () => {
    write(`blocks:
  - type: choice
    id: a
    links:
      - title: Karte
        url: ${MAP}
      # a page that fits
      - title: Wikipedia
        url: https://de.wikipedia.org/wiki/Prozentrechnung
    explanation: Text
  - type: choice
    id: b
    links:
      - title: Wikipedia
        url: https://de.wikipedia.org/wiki/Prozent
      - title: Karte
        url: ${MAP}
`);
    const lines = removeMapLinks();
    expect(lines).toEqual([expect.stringMatching(/seite\.yaml: removed 2 links to the learning map/)]);
    expect(file()).toBe(`blocks:
  - type: choice
    id: a
    links:
      # a page that fits
      - title: Wikipedia
        url: https://de.wikipedia.org/wiki/Prozentrechnung
    explanation: Text
  - type: choice
    id: b
    links:
      - title: Wikipedia
        url: https://de.wikipedia.org/wiki/Prozent
`);
    expect(removeMapLinks()).toEqual([]);
  });

  test("keeps a question whose only link is one to the map, and says where", () => {
    const only = `blocks:
  - type: choice
    links:
      - title: Karte
        url: ${MAP}
    explanation: Text
`;
    write(only);
    expect(removeMapLinks()).toEqual([expect.stringMatching(/seite\.yaml:3: .*only a link to the learning map/)]);
    expect(file()).toBe(only);
  });

  test("leaves an app that is no explainer, and files without map links, alone", () => {
    write("links:\n  - title: x\n    url: https://example.org/\n");
    expect(removeMapLinks()).toEqual([]);
    writeFileSync(join(app, "src/app.yaml"), "title: Quiz\n");
    write(`links:\n  - title: Karte\n    url: ${MAP}\n  - title: y\n    url: https://example.org/\n`);
    expect(removeMapLinks()).toEqual([]);
    expect(file()).toContain(MAP);
  });
});
