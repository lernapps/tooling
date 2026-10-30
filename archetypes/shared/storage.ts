// The only storage of a lernapps app (@lernapps/tooling/storage; lint rule storage-through-wrapper): on the device,
// in localStorage, under the app's own prefix, because every app on lernapps.net shares one origin. That origin's
// localStorage is small (about 5 MB in most browsers) and shared, so an app keeps at most STORAGE_QUOTA under its
// prefix: a save beyond it is refused. The learner's settings for every app or every app of an archetype are kept
// under SETTINGS_PREFIX, which every app shares, within SETTINGS_QUOTA (createSettings). Every access is wrapped in try/catch: when the browser blocks storage, it is
// full or the app's quota is used up, the app keeps working and remembers nothing more.

/**
 * What an app may keep under its prefix: 100 kB (100,000 bytes), measured as browsers count localStorage, 2 bytes per
 * UTF-16 code unit of every key (with the prefix) and value.
 */
export const STORAGE_QUOTA = 100_000;

/** What an app keeps on the device: JSON values under its own keys. */
export interface DeviceStorage {
  /** The value saved under `key`, if there is one and `guard` accepts it. */
  load<T>(key: string, guard: (value: unknown) => value is T): T | undefined;
  /**
   * Saves a JSON value; false when the browser does not let the app store it, or when the app's values would then
   * take more than STORAGE_QUOTA. A refused save keeps the value saved before.
   */
  save(key: string, value: unknown): boolean;
  /** Removes the value saved under `key`. */
  remove(key: string): void;
}

/** The storage of the app named `app`: its id in the catalog (entries/<id>.yaml, rule own-data-only), e.g. "brueche". */
export function createStorage(app: string): DeviceStorage {
  return prefixed(`lernapps:${app}:`, `lernapps:${app}:`, STORAGE_QUOTA);
}

/** The values under `prefix`, which may take at most `quota` bytes together with every other value under `counted`. */
function prefixed(prefix: string, counted: string, quota: number): DeviceStorage {
  /** The bytes the values under `counted` take, without the one under `except`. */
  const used = (target: Storage, except: string): number => {
    let bytes = 0;
    for (let i = 0; i < target.length; i++) {
      const key = target.key(i);
      if (key === null || key === except || !key.startsWith(counted)) continue;
      bytes += (key.length + (target.getItem(key)?.length ?? 0)) * 2;
    }
    return bytes;
  };
  const store = (): Storage | undefined => {
    try {
      return globalThis.localStorage;
    } catch {
      return undefined;
    }
  };
  return {
    load(key, guard) {
      try {
        const text = store()?.getItem(prefix + key);
        if (text === null || text === undefined) return undefined;
        const value: unknown = JSON.parse(text);
        return guard(value) ? value : undefined;
      } catch {
        return undefined;
      }
    },
    save(key, value) {
      try {
        const target = store();
        if (!target) return false;
        const text = String(JSON.stringify(value));
        if (used(target, prefix + key) + (prefix.length + key.length + text.length) * 2 > quota) return false;
        target.setItem(prefix + key, text);
        return true;
      } catch {
        return false;
      }
    },
    remove(key) {
      try {
        store()?.removeItem(prefix + key);
      } catch {
        // nothing stored, nothing to remove
      }
    },
  };
}

/**
 * What the learner's settings for every app and for every app of an archetype take together under SETTINGS_PREFIX:
 * 10 kB (10,000 bytes), counted as STORAGE_QUOTA is. A setting for one app only counts towards that app's quota.
 */
export const SETTINGS_QUOTA = 10_000;

/**
 * Where the learner's settings for more than one app are kept: `lernapps:settings:<key>` for every app,
 * `lernapps:settings:<archetype>:<key>` for every app of an archetype. `settings` is never the id of an app.
 */
export const SETTINGS_PREFIX = "lernapps:settings:";

/** Where a setting holds: for this app only, for every app of its archetype, or for every app. */
export type SettingScope = "app" | "archetype" | "all";

/** The learner's settings as one app sees them (`createSettings`). */
export interface Settings {
  /** The setting under `key` that holds for this app, the most specific one, with where it holds. */
  load<T>(key: string, guard: (value: unknown) => value is T): { value: T; scope: SettingScope } | undefined;
  /**
   * Saves a setting where it holds and removes the more specific ones this app would read first, so that it takes
   * effect here too (for every app also the archetype's, which other apps of the archetype then lose); false when the browser does not let the app store it, the quota is used up, the app has no archetype
   * for `archetype`, or `key` has a colon. A refused save changes nothing.
   */
  save(key: string, value: unknown, scope: SettingScope): boolean;
  /** Removes the setting under `key` where it holds; one that is more general may then hold. */
  remove(key: string, scope: SettingScope): void;
}

/**
 * The learner's settings for the app named `app` (its id, as for `createStorage`) of the archetype `archetype`
 * (`explainer`, as its pages mark it with `<meta name="lernapps-archetype">`): the app's own one under
 * `lernapps:<app>:settings:<key>` goes before the archetype's, which goes before the one for every app
 * (rule own-data-only lets an app touch these and no other archetype's). A key has no colon, so that a key for every
 * app is never taken for an archetype's.
 */
export function createSettings(app: string, archetype?: string): Settings {
  const stores: [SettingScope, DeviceStorage | undefined][] = [
    ["app", prefixed(`lernapps:${app}:settings:`, `lernapps:${app}:`, STORAGE_QUOTA)],
    [
      "archetype",
      archetype === undefined
        ? undefined
        : prefixed(`${SETTINGS_PREFIX}${archetype}:`, SETTINGS_PREFIX, SETTINGS_QUOTA),
    ],
    ["all", prefixed(SETTINGS_PREFIX, SETTINGS_PREFIX, SETTINGS_QUOTA)],
  ];
  const valid = (key: string) => key !== "" && !key.includes(":");
  return {
    load(key, guard) {
      if (!valid(key)) return undefined;
      for (const [scope, store] of stores) {
        const value = store?.load(key, guard);
        if (value !== undefined) return { value, scope };
      }
      return undefined;
    },
    save(key, value, scope) {
      const at = stores.findIndex(([where]) => where === scope);
      const store = stores[at]?.[1];
      if (!valid(key) || store === undefined || !store.save(key, value)) return false;
      for (const [, narrower] of stores.slice(0, at)) narrower?.remove(key);
      return true;
    },
    remove(key, scope) {
      if (valid(key)) stores.find(([where]) => where === scope)?.[1]?.remove(key);
    },
  };
}
