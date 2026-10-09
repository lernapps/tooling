// Learner texts from the app's message files (@lernapps/tooling/i18n; lint rule learner-text-german): the app keeps
// its texts in src/messages/de.json and shows them through a translator, never as strings in code.
//
//   import de from "./messages/de.json";
//   const t = translator(de);
//   t("solved", { count: 3 }); // "Du hast {count} Aufgaben gelöst." → "Du hast 3 Aufgaben gelöst."

/** The texts of one language, by key. */
export type Messages = Readonly<Record<string, string>>;
/** Values for the placeholders of a text, `{name}`; numbers are formatted for the language. */
export type Params = Readonly<Record<string, string | number>>;

/** The text of `key`, with its placeholders filled; a placeholder without a value stays as it is. */
export function translator<M extends Messages>(
  messages: M,
  locale = "de-DE",
): (key: keyof M & string, params?: Params) => string {
  const numbers = new Intl.NumberFormat(locale);
  return (key, params = {}) =>
    (messages[key] ?? key).replace(/\{(\w+)\}/g, (placeholder, name: string) => {
      const value = params[name];
      if (value === undefined) return placeholder;
      return typeof value === "number" ? numbers.format(value) : value;
    });
}
