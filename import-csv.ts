import Papa from "papaparse";
import { ItemSchema, type VaultItem } from "./schema";
export function importCsv(text: string): {
  items: VaultItem[];
  skipped: number;
} {
  if (new TextEncoder().encode(text).length > 2097152)
    throw new Error("CSV imports are limited to 2 MiB.");
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) =>
      h
        .replace(/^\uFEFF/, "")
        .trim()
        .toLowerCase(),
  });
  if (
    parsed.errors.length ||
    !parsed.meta.fields?.length ||
    Object.keys((parsed.meta as any).renamedHeaders || {}).length
  )
    throw new Error("Malformed or ambiguous CSV.");
  if (parsed.data.length > 1000) throw new Error("Import at most 1000 rows.");
  const recognized = parsed.meta.fields.some((h) =>
    ["password", "login_password"].includes(h),
  );
  if (!recognized)
    throw new Error("Use a login CSV from Bitwarden, LastPass or 1Password.");
  const items: VaultItem[] = [];
  let skipped = 0;
  const now = new Date().toISOString();
  const mapped = new Set([
    "name",
    "title",
    "username",
    "login_username",
    "password",
    "login_password",
    "url",
    "website",
    "login_uri",
    "notes",
    "extra",
    "folder",
    "grouping",
    "tags",
    "favorite",
    "favourite",
    "fav",
    "type",
  ]);
  for (const [index, row] of parsed.data.entries()) {
    const type = (row.type || "login").toLowerCase();
    if (!["login", "password", "1", ""].includes(type)) {
      skipped++;
      continue;
    }
    const pick = (...keys: string[]) =>
      keys.map((k) => row[k]).find((v) => v !== undefined && v !== "") || "";
    const extra = Object.fromEntries(
      Object.entries(row).filter(([k, v]) => !mapped.has(k) && v),
    );
    const notes =
      pick("notes", "extra") +
      (Object.keys(extra).length
        ? "\n\nAdditional imported fields:\n" + JSON.stringify(extra, null, 2)
        : "");
    const value = {
      site: pick("name", "title") || pick("url", "website", "login_uri"),
      username: pick("username", "login_username"),
      password: pick("password", "login_password"),
      url: pick("url", "website", "login_uri"),
      notes,
      folder: pick("folder", "grouping"),
      tags: (row.tags || "")
        .split(/[,;]/)
        .map((t) => t.trim())
        .filter(Boolean),
      favorite: ["1", "true", "yes"].includes(
        pick("favorite", "favourite", "fav").toLowerCase(),
      ),
      createdAt: now,
      updatedAt: now,
      passwordChangedAt: now,
      history: [],
    };
    const result = ItemSchema.safeParse(value);
    if (!result.success)
      throw new Error(
        `Row ${index + 2} is missing a title or exceeds a field limit. No rows were imported.`,
      );
    items.push(result.data);
  }
  if (!items.length) throw new Error("No supported login entries found.");
  return { items, skipped };
}
