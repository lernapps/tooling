// Every app on lernapps.net shares one origin with the other apps and with the platform, so an app touches only its
// own data in the browser: keys of localStorage and sessionStorage, IndexedDB databases and caches named with the
// prefix `lernapps:<id>:`, where <id> is the app's id in the catalog (the name of its entry, entries/<id>.yaml). The
// visit puts data of another app into the browser and records every access by name (check/visit.ts); without an
// entry the id is not known, so the app's names only have to share one prefix `lernapps:<name>:`. The learner's
// settings for every app (`lernapps:settings:<key>`, a key without a colon) and for every app of the page's archetype
// (`lernapps:settings:<archetype>:`, the archetype the page marks) are every app's to read and write; another
// archetype's are not, and `settings` is never an app's id. Cookies are the rule no-tracking's.
import { basename } from "node:path";
import { FOREIGN_KEY, type Check, type Problem, type StorageAccess } from "../check.ts";

const PREFIX = /^lernapps:([a-z0-9]+(?:-[a-z0-9]+)*):/;

/** The prefix of the learner's settings for more than one app (@lernapps/tooling/storage, createSettings). */
const SETTINGS = "lernapps:settings:";

/** Whether `name` is a setting for every app or for every app of `archetype`. */
function isSetting(name: string, archetype: string | undefined): boolean {
  if (!name.startsWith(SETTINGS)) return false;
  const rest = name.slice(SETTINGS.length);
  const colon = rest.indexOf(":");
  return colon === -1 ? rest !== "" : archetype !== undefined && rest.slice(0, colon) === archetype;
}

const DOING: Record<StorageAccess["action"], string> = {
  read: "reads",
  write: "writes",
  remove: "removes",
  clear: "clears",
  open: "opens",
  delete: "deletes",
  match: "looks up a request in",
};

export default {
  id: "own-data-only",
  url: "https://lernapps.net/tooling/rules/#own-data-only",
  description: "The app reads and writes only its own data in the browser, under the prefix lernapps:<id>:.",
  severity: "error",
  run: ({ app, entry }) => {
    if (!app) return undefined;
    const id = entry ? basename(entry.file).replace(/\.ya?ml$/, "") : undefined;
    // without an entry: the name in the first prefixed name the app keeps, writes or opens is its own, else in the
    // first it reads; never that of the other app whose data the visit put into the browser
    const named = app.pages.flatMap((page) => [
      ...page.storage.map((stored) => stored.slice(stored.indexOf(" ") + 1)),
      ...page.access
        .filter((access) => access.action === "write" || access.action === "open")
        .map((access) => access.name),
    ]);
    const read = app.pages.flatMap((page) => page.access.map((access) => access.name));
    const foreign = PREFIX.exec(FOREIGN_KEY)?.[1];
    const own =
      id ??
      [...named, ...read]
        .map((name) => PREFIX.exec(name)?.[1])
        .find((name) => name !== undefined && name !== foreign && name !== "settings");
    const prefix = own === undefined ? undefined : `lernapps:${own}:`;
    const fix =
      prefix === undefined
        ? 'Name every key, database and cache with the prefix lernapps:<id>:, <id> the app\'s id in the catalog; with @lernapps/tooling/storage: createStorage("<id>")'
        : `Name every key, database and cache with the prefix ${prefix} and touch nothing else; with @lernapps/tooling/storage: createStorage("${own}")`;
    const reserved: Problem[] =
      id === "settings" && app.pages[0]
        ? [
            {
              where: app.pages[0].page,
              found: "has the id settings, the prefix of the learner's settings for every app",
              fix: "Give the entry another name",
            },
          ]
        : [];
    return reserved.concat(
      app.pages.flatMap(({ page, access, storage, archetype }) => {
        const isOwn = (name: string) =>
          (prefix !== undefined && prefix !== SETTINGS && name.startsWith(prefix)) || isSetting(name, archetype);
        const problems: Problem[] = [];
        const seen = new Set<string>();
        const add = (found: string) => {
          if (seen.has(found)) return;
          seen.add(found);
          problems.push({ where: page, found, fix });
        };
        for (const { area, action, name } of access) {
          if (action === "clear") add(`clears all of ${area}, the data of every app on lernapps.net`);
          else if (action === "match") add("looks up a request in every cache, also in those of other apps");
          else if (!isOwn(name)) add(`${DOING[action]} ${area} "${name}", which is not its own`);
        }
        for (const stored of storage) {
          const area = stored.slice(0, stored.indexOf(" "));
          const name = stored.slice(stored.indexOf(" ") + 1);
          if (!isOwn(name)) add(`writes ${area} "${name}", which is not its own`);
        }
        return problems;
      }),
    );
  },
} satisfies Check;
