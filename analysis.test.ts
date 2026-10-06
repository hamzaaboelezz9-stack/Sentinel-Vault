import { it, expect } from "vitest";
import { analyze } from "../packages/crypto/analyze";
it("computes empirical Shannon entropy and reports dictionary, keyboard, repeat and leetspeak patterns without returning the secret", () => {
  expect(analyze("aaaa").shannonBitsPerCharacter).toBe(0);
  expect(analyze("aabb").empiricalBits).toBe(4);
  expect(analyze("qwerty12345").score).toBeLessThan(3);
  expect(analyze("p@ssw0rd").patterns).toContain(
    "Dictionary word with leetspeak",
  );
  const report = analyze("qwerty12345");
  expect(JSON.stringify(report)).not.toContain("qwerty12345");
  expect(report.suggestions.length).toBeGreaterThan(0);
  expect(() => analyze("a".repeat(4097))).toThrow();
});
