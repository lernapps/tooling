// The preset of the archetype quiz (@lernapps/tooling/quiz/preset), on the shared base: an app's vite.config.ts is
//
//   import { quiz } from "@lernapps/tooling/quiz/preset";
//   export default quiz();
//
// It adds a build step that reads the question bank (src/quiz.json), validates it against its JSON Schema and fails
// the build with a message naming each problem, and renders every question into index.html where it says
// <!-- quiz -->, so the page reads without JavaScript. The app's src/main.ts starts the engine
// (@lernapps/tooling/quiz) on that page.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { mergeConfig, type Plugin, type UserConfig } from "vite-plus";
import { lernapps } from "../shared/preset.ts";
import { renderQuiz, type QuizData } from "./render.ts";
import { parseBank } from "./validate.ts";

/** Where the question bank is, relative to the app's root. */
export const BANK = "src/quiz.json";
const MARKER = "<!-- quiz -->";

const escapeAttribute = (text: string) => text.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

/** The app's name from its package.json: the prefix of what it stores on the device. */
function appName(root: string): string {
  try {
    const manifest: unknown = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
    if (typeof manifest === "object" && manifest !== null && "name" in manifest && typeof manifest.name === "string") {
      return manifest.name;
    }
  } catch {
    // no package.json: the default name
  }
  return "quiz";
}

/** The build step of the quiz: validates the question bank and renders it into index.html. */
export function quizPlugin(): Plugin {
  let root = process.cwd();
  let data: QuizData | undefined;
  const load = (): QuizData => {
    const file = join(root, BANK);
    let text: string;
    try {
      text = readFileSync(file, "utf8");
    } catch {
      throw new Error(`${BANK} is missing: the quiz's questions belong there (schema quiz.v1.schema.json)`);
    }
    const quiz = parseBank(text, BANK);
    return quiz.rememberLastResult === true ? { quiz, storage: appName(root) } : { quiz };
  };
  return {
    name: "lernapps-quiz",
    configResolved(config) {
      root = config.root;
    },
    buildStart() {
      this.addWatchFile(join(root, BANK));
      try {
        data = load();
      } catch (error) {
        this.error(error instanceof Error ? error.message : String(error));
      }
    },
    handleHotUpdate({ file, server }) {
      if (file === join(root, BANK)) {
        data = undefined;
        server.ws.send({ type: "full-reload" });
      }
    },
    transformIndexHtml(html) {
      data ??= load();
      if (!html.includes(MARKER)) {
        throw new Error(`index.html has no ${MARKER}: put it in <body>, where the quiz goes`);
      }
      const { title, description, body } = renderQuiz(data);
      const head = `<title>${escapeAttribute(title)}</title>\n    <meta name="description" content="${escapeAttribute(description)}" />`;
      const withHead = /<title>[\s\S]*?<\/title>/.test(html)
        ? html.replace(/<title>[\s\S]*?<\/title>/, head)
        : html.replace("</head>", `    ${head}\n  </head>`);
      return withHead.replace(MARKER, () => body);
    },
  };
}

/** The preset of a quiz: the shared base with the quiz's build step, the app's own settings merged over it. */
export const quiz = (config: UserConfig = {}): UserConfig => lernapps(mergeConfig({ plugins: [quizPlugin()] }, config));

export default quiz();
