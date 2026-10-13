// The HTTP status of a link, for the checks that ask whether links resolve (links-resolve, entry-links-resolve). A
// server that answers 429 Too Many Requests is asked again after a short wait, a bounded number of times: it may
// ask for an hour (Retry-After), but a check never waits longer than a few seconds per link. A link still rate
// limited then keeps the status 429, and its check reports it as not checked, at severity hint: it fails nothing.

/** The status a rate-limited server answers with. */
export const RATE_LIMITED = 429;
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

/** The status of `url` after redirects, and whether it is an HTML page; status 0 when it cannot be fetched. */
export async function linkStatus(url: string): Promise<{ status: number; html: boolean }> {
  for (let attempt = 0; ; attempt++) {
    let response: Response;
    try {
      response = await fetch(url, { redirect: "follow" });
      await response.body?.cancel();
    } catch {
      return { status: 0, html: false };
    }
    if (response.status !== RATE_LIMITED || attempt >= RETRIES) {
      return { status: response.status, html: (response.headers.get("content-type") ?? "").includes("html") };
    }
    await sleep(wait(response.headers.get("retry-after"), attempt));
  }
}

/** What a check says about a link that answered `status`: undefined when it resolves. */
export function linkProblem(status: number): { found: string; hint: boolean } | undefined {
  if (status === RATE_LIMITED) {
    return {
      found: `could not be checked: the server answers 429 Too Many Requests (rate limited), also after ${RETRIES} retries`,
      hint: true,
    };
  }
  if (status === 0) return { found: "cannot be fetched", hint: false };
  if (status >= 400) return { found: `answers ${status}`, hint: false };
  return undefined;
}

/** The fix of a link that could not be checked. */
export const CHECK_AGAIN_LATER =
  "Nothing to fix for this: the server limits how often it may be asked. Check again later (lernapps check); the other links were checked";
