// A catalog entry (`--entry <file>`) against the app: its URL and every topic's deep link answer without an error,
// and a topic that names a section (`<page>#<section>`, `#<section>/<sub>`) finds an element with that id on its
// page, in the HTML as the server sends it. A link whose server is rate limited (429) could not be checked: a hint
// that names it, never an error.
import type { Check, Problem } from "../check.ts";
import { linkProblem, linkStatus } from "../status.ts";

/** The section a link names: its fragment, decoded; "" when it names none. */
function sectionOf(link: string): string {
  const hash = new URL(link).hash.slice(1);
  try {
    return decodeURIComponent(hash);
  } catch {
    return hash;
  }
}

export default {
  id: "entry-links-resolve",
  url: "https://lernapps.net/tooling/rules/#entry-links-resolve",
  description:
    "The app's URL and every topic link of its catalog entry resolve; a topic's #<section> is an element id of its page.",
  severity: "error",
  run: async ({ entry }) => {
    if (!entry) return undefined;
    const { url, topics = [] } = entry.value;
    const links = [
      { where: `${entry.file}: url`, url, section: "" },
      ...topics.map((topic, index) => {
        const link = new URL(topic.path, url).href;
        return { where: `${entry.file}: topics[${index}].path ${topic.path}`, url: link, section: sectionOf(link) };
      }),
    ];
    const problems = await Promise.all(
      links.map(async ({ where, url: link, section }): Promise<Problem | undefined> => {
        const { status, ids } = await linkStatus(link, { ids: section !== "" });
        const broken = linkProblem(
          where,
          link,
          status,
          "Point the topic's path (relative to url) to a page of the app, or correct the app's url",
        );
        if (broken !== undefined || section === "" || ids?.has(section)) return broken;
        return {
          where,
          found: `${link}: the page has no element with the id "${section}", so the link does not lead to its section`,
          fix: "Point the topic's #<section> to the id of a section of that page (#<section> or #<section>/<sub>, from the content's ids), or leave the anchor out to link the page",
        };
      }),
    );
    return problems.filter((problem) => problem !== undefined);
  },
} satisfies Check;
