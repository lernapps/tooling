// The HTTP status of a link, for the checks that ask whether links resolve (links-resolve, entry-links-resolve). A
// server that answers 429 Too Many Requests is asked again after a short wait, a bounded number of times: it may
// ask for an hour (Retry-After), but a check never waits longer than a few seconds per link. A link still rate
// limited then keeps the status 429, and its check reports it as not checked, at severity hint: it fails nothing.
import type { Problem } from "./check.ts";

/** The status a rate-limited server answers with. */
const RATE_LIMITED = 429;
const RETRIES = 2;
/** The longest wait before one retry, whatever the server's Retry-After says. */
const MAX_WAIT = 2000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** The wait before retry `attempt` (0, 1, ...): the server's Retry-After in seconds, else 0.5 s doubled, at most 2 s. */
function wait(retryAfter: string | null, attempt: number): number {
  const seconds = Number(retryAfter);
  const asked = retryAfter !== null && Number.isFinite(seconds) && seconds >= 0 ? seconds * 1000 : 500 * 2 ** attempt;
  return Math.min(asked, MAX_WAIT);
}

/**
 * The status of `url` after redirects, and whether it is an HTML page; status 0 when it cannot be fetched. With `ids`,
 * also the element ids of an HTML page that answers without an error, as the server sends it (no script runs).
 */
export async function linkStatus(
  url: string,
  options: { ids?: boolean } = {},
): Promise<{ status: number; html: boolean; ids?: Set<string> }> {
  for (let attempt = 0; ; attempt++) {
    let response: Response;
    let ids: Set<string> | undefined;
    try {
      response = await fetch(url, { redirect: "follow" });
      const html = (response.headers.get("content-type") ?? "").includes("html");
      if (options.ids && html && response.ok) ids = elementIds(await response.text());
      else await response.body?.cancel();
    } catch {
      return { status: 0, html: false };
    }
    if (response.status !== RATE_LIMITED || attempt >= RETRIES) {
      return {
        status: response.status,
        html: (response.headers.get("content-type") ?? "").includes("html"),
        ...(ids ? { ids } : {}),
      };
    }
    await sleep(wait(response.headers.get("retry-after"), attempt));
  }
}

/** The character references an attribute value may carry, decoded. */
const decodeReferences = (value: string) =>
  value
    .replace(/&#x([0-9a-f]+);/gi, (_match, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_match, decimal: string) => String.fromCodePoint(Number(decimal)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");

const VALUE = String.raw`\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))`;
const ID = new RegExp(String.raw`\sid${VALUE}`, "i");
const NAME = new RegExp(String.raw`\sname${VALUE}`, "i");

/** The ids of the elements of an HTML page (`id`, and `name` of an `<a>`, which a fragment also finds). */
export function elementIds(html: string): Set<string> {
  const ids = new Set<string>();
  for (const tag of html.match(/<[a-zA-Z][^>]*>/g) ?? []) {
    for (const match of [ID.exec(tag), /^<a\s/i.test(tag) ? NAME.exec(tag) : null]) {
      if (match) ids.add(decodeReferences(match[1] ?? match[2] ?? match[3] ?? ""));
    }
  }
  return ids;
}

/** The fix of a link that could not be checked. */
const CHECK_AGAIN_LATER =
  "Nothing to fix for this: the server limits how often it may be asked. Check again later (lernapps check); the other links were checked";

/**
 * The problem a check reports for `link` at `where` that answered `status`, undefined when it resolves. A broken link
 * gets the check's `fix`; a rate-limited one is not checked: severity hint, with nothing to fix.
 */
export function linkProblem(where: string, link: string, status: number, fix: string): Problem | undefined {
  if (status === RATE_LIMITED) {
    return {
      where,
      found: `${link} could not be checked: the server answers 429 Too Many Requests (rate limited), also after ${RETRIES} retries`,
      fix: CHECK_AGAIN_LATER,
      severity: "hint",
    };
  }
  if (status === 0) return { where, found: `${link} cannot be fetched`, fix };
  if (status >= 400) return { where, found: `${link} answers ${status}`, fix };
  return undefined;
}
