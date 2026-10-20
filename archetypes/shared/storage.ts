// The only storage of a lernapps app (@lernapps/tooling/storage; lint rule storage-through-wrapper): on the device,
// in localStorage, under the app's own prefix, because every app on lernapps.net shares one origin. That origin's
// localStorage is small (about 5 MB in most browsers) and shared, so an app keeps at most STORAGE_QUOTA under its
// prefix: a save beyond it is refused. Every access is wrapped in try/catch: when the browser blocks storage, it is
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
  const prefix = `lernapps:${app}:`;
  /** The bytes the app's values take, without the one under `except`. */
  const used = (target: Storage, except: string): number => {
    let bytes = 0;
    for (let i = 0; i < target.length; i++) {
      const key = target.key(i);
      if (key === null || key === except || !key.startsWith(prefix)) continue;
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
        if (used(target, prefix + key) + (prefix.length + key.length + text.length) * 2 > STORAGE_QUOTA) return false;
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
