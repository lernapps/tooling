// How a consumer reads a plan file (.vibe/plan.md): the YAML front matter, validated against the schema the
// package exports, and the headings of its sections. The hooks and the review read a plan the same way.
import { readFileSync } from "node:fs";
import { Ajv2020 } from "ajv/dist/2020.js";
import { parse } from "yaml";

/** The front matter of a Markdown file: the YAML between the first two `---` lines. */
export function frontMatter(markdown: string): unknown {
  const match = /^---\n([\s\S]*?)\n---\n/.exec(markdown);
  if (!match) throw new Error("no front matter: the file must start with a `---` line");
  return parse(match[1] ?? "");
}

/** Validates the front matter of a plan file against a schema file; returns the messages, empty when valid. */
export function frontMatterErrors(schemaFile: string, planFile: string): string[] {
  const schema: unknown = JSON.parse(readFileSync(schemaFile, "utf8"));
  if (typeof schema !== "object" || schema === null) throw new Error(`${schemaFile}: not a JSON Schema`);
  const validate = new Ajv2020({ allErrors: true, strict: true }).compile(schema);
  if (validate(frontMatter(readFileSync(planFile, "utf8")))) return [];
  return (validate.errors ?? []).map((error) => {
    const { additionalProperty, allowedValues } = error.params as {
      additionalProperty?: string;
      allowedValues?: unknown[];
    };
    const detail = additionalProperty ?? allowedValues?.map(String).join(", ");
    return `front matter${error.instancePath} ${error.message ?? ""}${detail === undefined ? "" : `: ${detail}`}`;
  });
}

/** The headings of a Markdown file, e.g. "## Explore", outside code blocks and HTML comments. */
export function headings(markdown: string): string[] {
  const prose = markdown.replace(/<!--[\s\S]*?-->/g, "").replace(/^```[\s\S]*?^```/gm, "");
  return prose.split("\n").filter((line) => /^#{1,6} /.test(line));
}
