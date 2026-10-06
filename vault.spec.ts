import { test, expect } from "@playwright/test";
import { mkdir } from "node:fs/promises";
test("real passkey, worker crypto, encrypted CRUD, offline edits, sync, export and lock", async ({
  page,
  context,
}) => {
  const client = await context.newCDPSession(page);
  await client.send("WebAuthn.enable");
  await client.send("WebAuthn.addVirtualAuthenticator", {
    options: {
      protocol: "ctap2",
      transport: "internal",
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      automaticPresenceSimulation: true,
    },
  });
  const leaks: string[] = [],
    csp: string[] = [];
  page.on("request", (req) => {
    const body = req.postData();
    if (
      body &&
      [
        "synthetic browser master passage 88402 cosmic orchid",
        "PublicBrowserTestPassword!98",
      ].some((secret) => body.includes(secret))
    )
      leaks.push(req.url());
  });
  page.on("console", (m) => {
    if (m.type() === "error") csp.push(m.text());
  });
  await page.goto("/");
  await mkdir("docs/screenshots", { recursive: true });
  await page.screenshot({
    path: "docs/screenshots/sign-in.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Create an account", exact: true })
    .click();
  await page.getByLabel("Email", { exact: true }).fill("browser@tests.invalid");
  await page
    .getByLabel("Invitation token")
    .fill("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
  await page
    .getByLabel("Master password", { exact: true })
    .fill("synthetic browser master passage 88402 cosmic orchid");
  await page
    .getByLabel("Confirm master password")
    .fill("synthetic browser master passage 88402 cosmic orchid");
  await page.getByRole("button", { name: "Create vault & passkey" }).click();
  await expect(
    page.getByRole("heading", { name: "All credentials", exact: true }),
  ).toBeVisible({ timeout: 20000 });
  await page.getByRole("button", { name: "Add credential" }).click();
  await page.getByLabel("Name", { exact: true }).fill("GitHub · example");
  await page.getByLabel("Username", { exact: true }).fill("portfolio-example");
  await page
    .getByLabel("Password", { exact: true })
    .fill("PublicBrowserTestPassword!98");
  await page.getByLabel("Website URL").fill("https://github.com");
  await page.getByLabel("Folder", { exact: true }).fill("Work");
  await page.getByRole("button", { name: "Save encrypted credential" }).click();
  await expect(
    page.getByRole("button", { name: /GitHub · example/ }),
  ).toBeVisible();
  await page.screenshot({ path: "docs/screenshots/vault.png", fullPage: true });
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.clock.install();
  await page.getByRole("button", { name: /GitHub · example/ }).click();
  await page
    .getByRole("button", { name: "Copy password", exact: true })
    .click();
  await expect(
    page.getByText(
      "Copied. Automatic clearing will be attempted in 30 seconds.",
    ),
  ).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "PublicBrowserTestPassword!98",
  );
  await page.clock.runFor(30050);
  await expect(page.getByText("Clipboard cleared.")).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe("");
  await page
    .getByRole("button", { name: "Copy password", exact: true })
    .click();
  await expect(
    page.getByText(
      "Copied. Automatic clearing will be attempted in 30 seconds.",
    ),
  ).toBeVisible();
  await page.evaluate(() =>
    navigator.clipboard.writeText("new unrelated public clipboard content"),
  );
  await page.clock.runFor(30050);
  await expect(
    page.getByText("Clipboard changed; your newer content was left intact."),
  ).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "new unrelated public clipboard content",
  );
  await page.getByRole("button", { name: "Security settings" }).click();
  await page.getByLabel("Keep an encrypted offline copy").check();
  await expect(page.getByLabel("Keep an encrypted offline copy")).toBeChecked();
  await page.getByRole("button", { name: "All credentials" }).click();
  await context.setOffline(true);
  await page.reload();
  await page
    .getByRole("button", { name: "Open encrypted offline vault" })
    .click();
  await page
    .getByLabel("Master password", { exact: true })
    .fill("synthetic browser master passage 88402 cosmic orchid");
  await page.getByRole("button", { name: "Unlock vault", exact: true }).click();
  await expect(
    page.getByRole("button", { name: /GitHub · example/ }),
  ).toBeVisible({ timeout: 20000 });
  await page.getByRole("button", { name: "Add credential" }).click();
  await page.getByLabel("Name", { exact: true }).fill("Offline example");
  await page
    .getByLabel("Password", { exact: true })
    .fill("AnotherPublicTestPassword!45");
  await page.getByRole("button", { name: "Save encrypted credential" }).click();
  await expect(
    page.getByText("1 encrypted offline change(s) awaiting sync."),
  ).toBeVisible();
  await context.setOffline(false);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Unlock your vault" }),
  ).toBeVisible();
  await page
    .getByLabel("Master password", { exact: true })
    .fill("synthetic browser master passage 88402 cosmic orchid");
  await page.getByRole("button", { name: "Unlock vault", exact: true }).click();
  await expect(
    page.getByText("1 encrypted offline change(s) awaiting sync."),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /Offline example/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Synchronize", exact: true }).click();
  await expect(page.getByText("Encrypted changes synchronized.")).toBeVisible();
  await page.getByRole("button", { name: "Password health" }).click();
  await expect(
    page.getByRole("heading", { name: "Password health", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "docs/screenshots/health.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Security settings" }).click();
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export encrypted JSON backup" })
    .click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("sentinel-encrypted-vault.json");
  expect(leaks).toEqual([]);
  expect(
    csp.filter((v) =>
      /Content Security Policy|Refused to|unsafe-eval/i.test(v),
    ),
  ).toEqual([]);
  await page.getByRole("button", { name: "Lock vault", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Unlock your vault" }),
  ).toBeVisible();
  await page
    .getByLabel("Master password", { exact: true })
    .fill("wrong public fixture");
  await page.getByRole("button", { name: "Unlock vault", exact: true }).click();
  await expect(page.getByText(/Unable to unlock/)).toBeVisible();
});
