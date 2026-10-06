import { test, expect } from "@playwright/test";
import * as OTPAuth from "otpauth";
import { fillLogin } from "../../extensions/browser/src/autofill";
test("TOTP enrollment and one-use recovery login, then master rotation and pinned contact update", async ({
  page,
  context,
}) => {
  const master = "public browser security master tulip solar 90721",
    next = "public rotated master marigold nebula 42715";
  const cdp = await context.newCDPSession(page);
  await cdp.send("WebAuthn.enable");
  await cdp.send("WebAuthn.addVirtualAuthenticator", {
    options: {
      protocol: "ctap2",
      transport: "internal",
      hasResidentKey: true,
      hasUserVerification: true,
      isUserVerified: true,
      automaticPresenceSimulation: true,
    },
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Create an account", exact: true })
    .click();
  await page
    .getByLabel("Email", { exact: true })
    .fill("security@tests.invalid");
  await page
    .getByLabel("Invitation token")
    .fill("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
  await page.getByLabel("Master password", { exact: true }).fill(master);
  await page.getByLabel("Confirm master password").fill(master);
  await page.getByRole("button", { name: "Create vault & passkey" }).click();
  await expect(
    page.getByRole("heading", { name: "All credentials", exact: true }),
  ).toBeVisible({ timeout: 20000 });
  await page.getByRole("button", { name: "Security settings" }).click();
  await page.getByRole("button", { name: "Set up authenticator" }).click();
  const seed = await page.locator("code.fingerprint").first().textContent();
  const totp = new OTPAuth.TOTP({
    algorithm: "SHA1",
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(seed!),
  });
  await page.getByLabel("Current authenticator code").fill(totp.generate());
  await page.getByRole("button", { name: "Enable TOTP", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Save these recovery codes now" }),
  ).toBeVisible();
  const recovery = await page.locator(".recovery code").first().textContent();
  await page.getByRole("button", { name: "I saved them safely" }).click();
  await page
    .getByRole("button", { name: "Sign out & clear offline copy" })
    .click();
  await expect(
    page.getByRole("heading", { name: "Welcome back" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Sign in with passkey" }).click();
  await expect(
    page.getByRole("heading", { name: "Verify your sign-in" }),
  ).toBeVisible();
  await page.getByLabel("Authenticator or recovery code").fill(recovery!);
  await page.getByLabel("Use a recovery code").check();
  await page.getByRole("button", { name: "Verify", exact: true }).click();
  await page.getByLabel("Master password", { exact: true }).fill(master);
  await page.getByRole("button", { name: "Unlock vault", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "All credentials", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Security settings" }).click();
  await page.getByLabel("Current master password").fill(master);
  await page.getByLabel("New master password", { exact: true }).fill(next);
  await page.getByLabel("Confirm new master password").fill(next);
  await page
    .getByRole("button", { name: "Change master password", exact: true })
    .click();
  await expect(page.getByText(/Master password changed/)).toBeVisible();
  // A contacts update must preserve the new wrapper, not accidentally restore the old worker profile.
  await page.getByRole("button", { name: "Secure sharing" }).click();
  await page.getByLabel("Recipient email").fill("security@tests.invalid");
  await page.getByRole("button", { name: "Find contact" }).click();
  const fp = await page.locator("code.fingerprint").last().textContent();
  await page
    .getByLabel("Enter the fingerprint verified independently")
    .fill(fp!);
  await page.getByRole("button", { name: "Pin verified contact" }).click();
  await expect(page.getByText(/Contact fingerprint pinned/)).toBeVisible();
  await page.getByRole("button", { name: "Lock vault", exact: true }).click();
  await page.getByLabel("Master password", { exact: true }).fill(next);
  await page.getByRole("button", { name: "Unlock vault", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "All credentials", exact: true }),
  ).toBeVisible();
});
test("autofill changes one same-origin login form without submission; rejects ambiguity and cross-origin form actions", async ({
  page,
}) => {
  await page.goto("/");
  await page.setContent(
    '<form action="/login"><input name="username" autocomplete="username"><input name="password" type="password"><button>Sign in</button></form>',
  );
  const result = await page.evaluate(fillLogin, {
    expectedOrigin: "http://localhost:8080",
    username: "public-test-user",
    password: "public-test-password",
  });
  expect(result).toBe(true);
  await expect(page.locator("input[name=username]")).toHaveValue(
    "public-test-user",
  );
  await expect(page.locator("input[type=password]")).toHaveValue(
    "public-test-password",
  );
  expect(page.url()).toBe("http://localhost:8080/");
  await page.setContent(
    '<form action="https://attacker.invalid/"><input type="password"></form>',
  );
  expect(
    await page.evaluate(fillLogin, {
      expectedOrigin: "http://localhost:8080",
      username: "public-test-user",
      password: "public-test-password",
    }),
  ).toBe(false);
  await page.setContent('<input type="password"><input type="password">');
  expect(
    await page.evaluate(fillLogin, {
      expectedOrigin: "http://localhost:8080",
      username: "public-test-user",
      password: "public-test-password",
    }),
  ).toBe(false);
});
