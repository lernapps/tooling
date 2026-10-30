// The storage of an app (@lernapps/tooling/storage) as an app uses it: it saves and loads under the app's prefix,
// refuses a save that would take the app beyond STORAGE_QUOTA, and keeps working when storage is blocked.
import { afterEach, describe, expect, test } from "vite-plus/test";
import { createSettings, createStorage, SETTINGS_QUOTA, STORAGE_QUOTA } from "../archetypes/shared/storage.ts";

/** A localStorage in memory, shared by every app of the origin. */
function memoryStorage(): Storage {
  const items = new Map<string, string>();
  return {
    get length() {
      return items.size;
    },
    key: (index) => [...items.keys()][index] ?? null,
    getItem: (key) => items.get(key) ?? null,
    setItem: (key, value) => void items.set(key, String(value)),
    removeItem: (key) => void items.delete(key),
    clear: () => items.clear(),
  };
}

const isString = (value: unknown): value is string => typeof value === "string";
const original = Object.getOwnPropertyDescriptor(globalThis, "localStorage");
const use = (storage: Storage) =>
  Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });
afterEach(() => {
  if (original) Object.defineProperty(globalThis, "localStorage", original);
  else Reflect.deleteProperty(globalThis, "localStorage");
});

describe("storage", () => {
  test("saves and loads a value under the app's prefix", () => {
    const local = memoryStorage();
    use(local);
    const storage = createStorage("brueche");
    expect(storage.save("stand", "kuerzen")).toBe(true);
    expect(storage.load("stand", isString)).toBe("kuerzen");
    expect(local.getItem("lernapps:brueche:stand")).toBe('"kuerzen"');
  });

  test("refuses a save beyond 100 kB of the app's values and keeps the value before; other apps do not count", () => {
    const local = memoryStorage();
    use(local);
    local.setItem("lernapps:andere:viel", "x".repeat(STORAGE_QUOTA));
    const storage = createStorage("brueche");
    // 2 bytes per UTF-16 code unit of key and value: the prefixed key "lernapps:brueche:a" has 18, the quotes 2
    const fits = "x".repeat(STORAGE_QUOTA / 2 - 18 - 2);
    expect(storage.save("a", fits)).toBe(true);
    expect(storage.save("a", "kurz")).toBe(true); // replacing a value counts the new one only
    expect(storage.save("a", fits)).toBe(true);
    expect(storage.save("b", 1)).toBe(false);
    expect(storage.save("a", `${fits}x`)).toBe(false);
    expect(storage.load("a", isString)).toBe(fits);
    expect(STORAGE_QUOTA).toBe(100_000);
  });

  test("keeps working when the browser blocks storage", () => {
    Object.defineProperty(globalThis, "localStorage", {
      get() {
        throw new Error("SecurityError");
      },
      configurable: true,
    });
    const storage = createStorage("brueche");
    expect(storage.save("stand", 1)).toBe(false);
    expect(storage.load("stand", isString)).toBeUndefined();
    expect(() => storage.remove("stand")).not.toThrow();
  });
});

const isStrings = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

describe("settings", () => {
  test("the app's own setting goes before its archetype's, which goes before the one for every app", () => {
    const local = memoryStorage();
    use(local);
    const brueche = createSettings("brueche", "explainer");
    expect(brueche.save("schrift", "gross", "all")).toBe(true);
    expect(brueche.load("schrift", isString)).toEqual({ value: "gross", scope: "all" });
    expect(brueche.save("schrift", "normal", "archetype")).toBe(true);
    expect(brueche.load("schrift", isString)).toEqual({ value: "normal", scope: "archetype" });
    expect(brueche.save("schrift", "klein", "app")).toBe(true);
    expect(brueche.load("schrift", isString)).toEqual({ value: "klein", scope: "app" });
    expect(local.getItem("lernapps:settings:schrift")).toBe('"gross"');
    expect(local.getItem("lernapps:settings:explainer:schrift")).toBe('"normal"');
    expect(local.getItem("lernapps:brueche:settings:schrift")).toBe('"klein"');
  });

  test("another app of the archetype follows its setting, an app of another archetype only the one for every app", () => {
    use(memoryStorage());
    createSettings("brueche", "explainer").save("bedarf", ["kurze-schritte"], "archetype");
    createSettings("brueche", "explainer").save("schrift", "gross", "all");
    expect(createSettings("prozente", "explainer").load("bedarf", isStrings)).toEqual({
      value: ["kurze-schritte"],
      scope: "archetype",
    });
    expect(createSettings("vokabeln", "quiz").load("bedarf", isStrings)).toBeUndefined();
    expect(createSettings("vokabeln", "quiz").load("schrift", isString)).toEqual({ value: "gross", scope: "all" });
    expect(createSettings("ohne").load("schrift", isString)).toEqual({ value: "gross", scope: "all" });
  });

  test("a save where a setting holds removes the more specific ones this app reads first", () => {
    const local = memoryStorage();
    use(local);
    const brueche = createSettings("brueche", "explainer");
    brueche.save("bedarf", ["mehr-tiefe"], "app");
    expect(brueche.save("bedarf", ["kurze-schritte"], "archetype")).toBe(true);
    expect(local.getItem("lernapps:brueche:settings:bedarf")).toBeNull();
    expect(brueche.load("bedarf", isStrings)).toEqual({ value: ["kurze-schritte"], scope: "archetype" });
    brueche.remove("bedarf", "archetype");
    expect(brueche.load("bedarf", isStrings)).toBeUndefined();
  });

  test("refuses a key with a colon, the archetype's scope without an archetype, and a save beyond the quota", () => {
    const local = memoryStorage();
    use(local);
    expect(createSettings("brueche", "explainer").save("quiz:schrift", "gross", "all")).toBe(false);
    expect(createSettings("ohne").save("schrift", "gross", "archetype")).toBe(false);
    const big = "x".repeat(SETTINGS_QUOTA / 2);
    expect(createSettings("brueche", "explainer").save("schrift", big, "all")).toBe(false);
    expect(local.length).toBe(0);
  });

  test("keeps working when the browser blocks storage", () => {
    Object.defineProperty(globalThis, "localStorage", {
      get() {
        throw new Error("SecurityError");
      },
      configurable: true,
    });
    const settings = createSettings("brueche", "explainer");
    expect(settings.save("schrift", "gross", "all")).toBe(false);
    expect(settings.load("schrift", isString)).toBeUndefined();
    expect(() => settings.remove("schrift", "all")).not.toThrow();
  });
});
