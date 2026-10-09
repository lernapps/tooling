// The only storage of a lernapps app (@lernapps/tooling/storage; lint rule storage-through-wrapper): on the device,
// in localStorage, under the app's own prefix, because every app on lernapps.net shares one origin. Every access is
// wrapped in try/catch: when the browser blocks storage or it is full, the app keeps working and remembers nothing.

/** What an app keeps on the device: JSON values under its own keys. */
export interface DeviceStorage {
  /** The value saved under `key`, if there is one and `guard` accepts it. */
  load<T>(key: string, guard: (value: unknown) => value is T): T | undefined;
  /** Saves a JSON value; false when the browser does not let the app store it. */
  save(key: string, value: unknown): boolean;
  /** Removes the value saved under `key`. */
  remove(key: string): void;
}

/** The storage of the app named `app` (a stable name, e.g. its path on lernapps.net: "brueche"). */
export function createStorage(app: string): DeviceStorage {
  const prefix = `lernapps:${app}:`;
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
        target.setItem(prefix + key, JSON.stringify(value));
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
