// Accessibility helpers of a lernapps app (@lernapps/tooling/a11y): what interactive apps need beyond semantic HTML,
// so that feedback reaches screen readers and keyboard users as it reaches everyone else.

const regions = new Map<string, HTMLElement>();

/** A visually hidden live region, created once per politeness. */
function region(politeness: "polite" | "assertive"): HTMLElement {
  const existing = regions.get(politeness);
  if (existing?.isConnected) return existing;
  const element = document.createElement("div");
  element.setAttribute("aria-live", politeness);
  element.setAttribute("aria-atomic", "true");
  element.style.cssText =
    "position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0";
  document.body.append(element);
  regions.set(politeness, element);
  return element;
}

/** Says `text` to screen readers, e.g. the feedback after an answer; "assertive" interrupts, for errors only. */
export function announce(text: string, politeness: "polite" | "assertive" = "polite"): void {
  const live = region(politeness);
  live.textContent = "";
  // a new text node after the region is cleared, so that the same text is announced again
  setTimeout(() => {
    live.textContent = text;
  }, 50);
}

/** Moves the keyboard focus to `element`, e.g. the heading of the next task, making it focusable if needed. */
export function moveFocus(element: HTMLElement): void {
  if (!element.matches("a[href], button, input, select, textarea, [tabindex]")) element.tabIndex = -1;
  element.focus();
}

/** Whether the learner asked for less motion: animate only when this is false. */
export const prefersReducedMotion = (): boolean =>
  globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
