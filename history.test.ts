import { it, expect } from "vitest";
import { prepareRevision } from "../packages/crypto/history";
import { item } from "./fixtures";
it("retains exactly five prior passwords, ignores injected history, and preserves age on username-only edits", async () => {
  let previous = await prepareRevision(
    item({
      history: [
        {
          password: "untrusted injected history",
          changedAt: "2020-01-01T00:00:00Z",
        },
      ],
    }),
    undefined,
    "2026-01-01T00:00:00Z",
  );
  expect(previous.history).toEqual([]);
  for (let version = 1; version <= 7; version++)
    previous = await prepareRevision(
      { ...previous, password: "public version " + version, history: [] },
      previous,
      `2026-01-0${version + 1}T00:00:00Z`,
    );
  expect(previous.history.map((h) => h.password)).toEqual([
    "public version 6",
    "public version 5",
    "public version 4",
    "public version 3",
    "public version 2",
  ]);
  const unchanged = await prepareRevision(
    { ...previous, username: "changed username", history: [] },
    previous,
    "2026-02-01T00:00:00Z",
  );
  expect(unchanged.passwordChangedAt).toBe(previous.passwordChangedAt);
  expect(unchanged.history).toEqual(previous.history);
  expect(unchanged.createdAt).toBe(previous.createdAt);
  expect(unchanged.updatedAt).not.toBe(previous.updatedAt);
});
