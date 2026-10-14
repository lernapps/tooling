// A catalog entry (`--entry <file>`) against the app: its URL and every topic's deep link answer without an error. A
// link whose server is rate limited (429) could not be checked: a hint that names it, never an error.
import type { Check } from "../check.ts";
import { linkProblem, linkStatus } from "../status.ts";

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
    const problems = await Promise.all(
      links.map(async ({ where, url: link }) =>
        linkProblem(
          where,
          link,
          (await linkStatus(link)).status,
          "Point the topic's path (relative to url) to a page of the app, or correct the app's url",
        ),
      ),
    );
    return problems.filter((problem) => problem !== undefined);
  },
} satisfies Check;
