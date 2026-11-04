import { expect, test } from "vite-plus/test";
import { ergebnis, faktoren, fuelle, gemeinsameTeiler, ggT } from "./ErweiternKuerzen.ts";

test("the greatest common divisor and the common divisors", () => {
  expect(ggT(8, 12)).toBe(4);
  expect(gemeinsameTeiler(8, 12)).toEqual([1, 2, 4]);
  expect(gemeinsameTeiler(3, 4)).toEqual([1]);
});

test("expanding offers 1 to 6 and keeps the value; reducing offers only common divisors", () => {
  expect(faktoren("erweitern", 2, 3)).toEqual([1, 2, 3, 4, 5, 6]);
  expect(faktoren("kuerzen", 8, 12)).toEqual([1, 2, 4]);
  for (const f of faktoren("erweitern", 2, 3)) {
    const r = ergebnis("erweitern", 2, 3, f);
    expect(r.zaehler * 3).toBe(r.nenner * 2);
  }
  for (const f of faktoren("kuerzen", 8, 12)) {
    const r = ergebnis("kuerzen", 8, 12, f);
    expect(Number.isInteger(r.zaehler) && Number.isInteger(r.nenner)).toBe(true);
    expect(r.zaehler * 12).toBe(r.nenner * 8);
  }
});

test("the texts are filled with the result", () => {
  expect(fuelle("{z}/{n} = {z2}/{n2} (mal {f}); Zahlen {liste}", "erweitern", 2, 3, 2)).toBe(
    "2/3 = 4/6 (mal 2); Zahlen 2, 3, 4, 5, 6",
  );
  expect(fuelle("{z2}/{n2} mit {liste}", "kuerzen", 8, 12, 4)).toBe("2/3 mit 2, 4");
});
