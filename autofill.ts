export function allowedOrigin(value: string): string {
  const url = new URL(value);
  if (
    url.username ||
    url.password ||
    !(
      url.protocol === "https:" ||
      (url.protocol === "http:" &&
        ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname))
    )
  )
    throw new Error("An HTTPS or localhost URL is required.");
  return url.origin;
}
// Runs only in the selected top frame after the user's explicit click. No automatic submission.
export function fillLogin({
  expectedOrigin,
  username,
  password,
}: {
  expectedOrigin: string;
  username: string;
  password: string;
}): boolean {
  if (location.origin !== expectedOrigin || window.top !== window.self)
    return false;
  const visible = (input: HTMLInputElement) =>
    !input.disabled &&
    !input.readOnly &&
    input.getClientRects().length > 0 &&
    getComputedStyle(input).visibility !== "hidden";
  const passwords = Array.from(
    document.querySelectorAll<HTMLInputElement>('input[type="password"]'),
  ).filter(visible);
  if (passwords.length !== 1) return false; // Ambiguous forms require the user to paste manually.
  const secret = passwords[0],
    root: ParentNode = secret.form || document;
  if (secret.form) {
    const action = new URL(secret.form.action || location.href);
    if (action.origin !== expectedOrigin) return false;
  }
  const candidates = Array.from(
    root.querySelectorAll<HTMLInputElement>("input"),
  ).filter((i) => visible(i) && ["text", "email", "tel"].includes(i.type));
  const login =
    candidates.find(
      (i) => i.autocomplete === "username" || i.autocomplete === "email",
    ) ||
    candidates.find((i) => /user|email|login/i.test(i.name)) ||
    (candidates.length === 1 ? candidates[0] : undefined);
  const setter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value",
  )?.set;
  if (!setter) return false;
  const set = (input: HTMLInputElement, value: string) => {
    setter.call(input, value);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  };
  if (login) set(login, username);
  set(secret, password);
  return true;
}
