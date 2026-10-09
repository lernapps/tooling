// A catalog entry (`--entry <file>`) against the app: its URL and every topic's deep link answer without an error.
import type { Check } from "../check.ts";

async function status(url: string): Promise<number> {
  try {
    const response = await fetch(url, { redirect: "follow" });
    await response.body?.cancel();
    return response.status;
  } catch {
    return 0;
  }
}

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
    const answers = await Promise.all(links.map(async (link) => ({ ...link, status: await status(link.url) })));
    return answers
      .filter((link) => link.status === 0 || link.status >= 400)
      .map((link) => ({
        where: link.where,
        found: `${link.url} ${link.status === 0 ? "cannot be fetched" : `answers ${link.status}`}`,
        fix: "Point the topic's path (relative to url) to a page of the app, or correct the app's url",
      }));
  },
} satisfies Check;
