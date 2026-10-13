// A catalog entry (`--entry <file>`) against the app: its URL and every topic's deep link answer without an error. A
// link whose server is rate limited (429) could not be checked: a hint that names it, never an error.
import type { Check } from "../check.ts";
import { CHECK_AGAIN_LATER, linkProblem, linkStatus } from "../status.ts";

export default {
  id: "entry-links-resolve",
  url: "https://lernapps.net/tooling/rules/#entry-links-resolve",
  description: "The app's URL and every topic link of its catalog entry resolve.",
  severity: "error",
  run: async ({ entry }) => {
    if (!entry) return undefined;
    const { url, topics = [] } = entry.value;
    const links = [
      { where: `${entry.file}: url`, url },
      ...topics.map((topic, index) => ({
        where: `${entry.file}: topics[${index}].path ${topic.path}`,
        url: new URL(topic.path, url).href,
      })),
    ];
    const answers = await Promise.all(
      links.map(async (link) => ({ ...link, problem: linkProblem((await linkStatus(link.url)).status) })),
    );
    return answers.flatMap(({ where, url: link, problem }) =>
      problem === undefined
        ? []
        : [
            {
              where,
              found: `${link} ${problem.found}`,
              fix: problem.hint
                ? CHECK_AGAIN_LATER
                : "Point the topic's path (relative to url) to a page of the app, or correct the app's url",
              ...(problem.hint ? { severity: "hint" as const } : {}),
            },
          ],
    );
  },
} satisfies Check;
