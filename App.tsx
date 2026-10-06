import React, { useEffect, useRef, useState } from "react";
import {
  startRegistration,
  startAuthentication,
} from "@simplewebauthn/browser";
import zxcvbn from "zxcvbn";
import type { Analysis } from "../../../packages/crypto/analyze";
import { api, ApiError, setCsrf } from "./api";
import { CryptoClient } from "./worker-client";
import { clearCache, readCache, writeCache, type CachedVault } from "./storage";
import { copySecret } from "./clipboard";
import { passwordBytes } from "../../../packages/crypto/bytes";
import { importCsv } from "../../../packages/shared/import-csv";
import {
  EnvelopeSchema,
  ExportSchema,
  type Account,
  type Envelope,
  type Profile,
  type Share,
  type SharedRow,
  type VaultItem,
} from "../../../packages/shared/schema";

interface Card {
  id: string;
  revision: number;
  site: string;
  username: string;
  url: string;
  folder: string;
  tags: string[];
  favorite: boolean;
  score: number;
  old: boolean;
  reused: boolean;
}
type Row = {
  id: string;
  revision: number;
  envelope: Envelope | null;
  deleted: boolean;
};
type Pending = CachedVault["pending"][number];
const engine = new CryptoClient();
const empty = (): VaultItem => ({
  site: "",
  username: "",
  password: "",
  notes: "",
  url: "",
  folder: "",
  tags: [],
  favorite: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  passwordChangedAt: new Date().toISOString(),
  history: [],
});
function download(name: string, value: unknown) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export default function App() {
  const [account, setAccount] = useState<Account>(),
    [unlocked, setUnlocked] = useState(false),
    [cards, setCards] = useState<Card[]>([]),
    [page, setPage] = useState("vault"),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [offline, setOffline] = useState(false),
    [cacheEnabled, setCacheEnabled] = useState(
      localStorage.getItem("sv-cache") === "true",
    ),
    [pending, setPending] = useState<Pending[]>([]);
  const [query, setQuery] = useState(""),
    [folder, setFolder] = useState(""),
    [favorites, setFavorites] = useState(false),
    [editing, setEditing] = useState<{ id?: string; item: VaultItem }>(),
    [detail, setDetail] = useState<{ card: Card; item: VaultItem }>(),
    [shares, setShares] = useState<SharedRow[]>([]),
    [breaches, setBreaches] = useState<Record<string, string>>({}),
    [importing, setImporting] = useState<{
      items: VaultItem[];
      skipped: number;
    }>();
  const [lockMinutes, setLockMinutes] = useState(
      [1, 2, 5, 10, 15, 30].includes(Number(localStorage.getItem("sv-lock")))
        ? Number(localStorage.getItem("sv-lock"))
        : 5,
    ),
    [theme, setTheme] = useState(localStorage.getItem("sv-theme") || "dark");
  const rows = useRef<Row[]>([]),
    lastActivity = useRef(Date.now()),
    lockChannel = useRef<BroadcastChannel | undefined>(undefined),
    current = useRef({ account, pending, cacheEnabled });
  current.current = { account, pending, cacheEnabled };
  const notify = (message: string) => setNotice(message);
  const lock = (broadcast = true) => {
    engine.lock();
    setUnlocked(false);
    setCards([]);
    setDetail(undefined);
    setEditing(undefined);
    setImporting(undefined);
    setBreaches({});
    setPage("vault");
    setQuery("");
    if (broadcast) lockChannel.current?.postMessage("lock");
  };
  async function action(fn: () => Promise<void>) {
    setBusy(true);
    setNotice("");
    try {
      await fn();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Operation failed.");
    } finally {
      setBusy(false);
    }
  }
  const exportValue = (user: Account, list = rows.current) =>
    ExportSchema.parse({
      format: "sentinel-vault",
      version: 1,
      userId: user.id,
      profile: user.profile,
      profileRevision: user.profileRevision,
      items: list.filter((r) => !r.deleted).map((r) => r.envelope),
      exportedAt: new Date().toISOString(),
    });
  async function persist(
    user = account,
    list = rows.current,
    queue = current.current.pending,
  ) {
    if (current.current.cacheEnabled && user)
      await writeCache({
        export: exportValue(user, list),
        email: user.email,
        twoFactor: user.twoFactor,
        pending: queue,
      });
  }
  async function renderCards(list = rows.current) {
    setCards(
      await engine.call("list", {
        items: list.filter((r) => !r.deleted).map((r) => r.envelope),
      }),
    );
  }
  async function load(user = account) {
    if (!user) return;
    if (current.current.pending.length)
      throw new Error(
        "Synchronize or discard pending changes before refreshing.",
      );
    const result = await api("/items");
    rows.current = result.items;
    await renderCards();
    setShares((await api("/shares")).shares);
    setOffline(false);
    await persist(user);
  }
  useEffect(() => {
    void (async () => {
      try {
        const result = await api("/account");
        await signedIn(result);
      } catch {
        /* A locked cache is opened only by the user's explicit action. */
      }
    })();
    return () => engine.lock();
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("sv-theme", theme);
  }, [theme]);
  useEffect(() => {
    const channel = new BroadcastChannel("sentinel-lock");
    lockChannel.current = channel;
    channel.onmessage = () => lock(false);
    return () => {
      channel.close();
      lockChannel.current = undefined;
    };
  }, []);
  useEffect(() => {
    if (!unlocked) return;
    lastActivity.current = Date.now();
    const activity = () => {
      lastActivity.current = Date.now();
    };
    const hidden = () => {
      if (document.hidden) lock();
    };
    const leaving = () => lock();
    for (const event of ["pointerdown", "keydown", "touchstart"])
      window.addEventListener(event, activity, { passive: true });
    document.addEventListener("visibilitychange", hidden);
    window.addEventListener("pagehide", leaving);
    const timer = setInterval(() => {
      if (Date.now() - lastActivity.current >= lockMinutes * 60000) lock();
    }, 1000);
    return () => {
      clearInterval(timer);
      for (const event of ["pointerdown", "keydown", "touchstart"])
        window.removeEventListener(event, activity);
      document.removeEventListener("visibilitychange", hidden);
      window.removeEventListener("pagehide", leaving);
    };
  }, [unlocked, lockMinutes]);
  async function signedIn(result: any) {
    if (result.twoFactorRequired) {
      setPage("second-factor");
      return;
    }
    setAccount(result.account);
    setCsrf(result.csrfToken || "");
    const cached = await readCache(result.account.id);
    if (
      cached &&
      cached.export.userId === result.account.id &&
      cached.pending.length
    ) {
      rows.current = cached.export.items.map((envelope) => ({
        id: envelope.id,
        revision: envelope.revision,
        envelope,
        deleted: false,
      }));
      setPending(cached.pending);
      current.current.pending = cached.pending;
      setOffline(true);
    } else {
      setPending([]);
      current.current.pending = [];
      setOffline(false);
    }
    setPage("vault");
  }
  async function signIn() {
    lock();
    setAccount(undefined);
    setCsrf("");
    await signedIn(
      await api("/auth/login/finish", "POST", {
        response: await startAuthentication({
          optionsJSON: (await api("/auth/login/options", "POST", {})).options,
        }),
      }),
    );
  }
  async function register(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget,
      data = new FormData(form),
      master = String(data.get("master") || ""),
      confirm = String(data.get("confirm") || "");
    if (
      !(await engine.call("compare", {
        a: passwordBytes(master),
        b: passwordBytes(confirm),
      }))
    ) {
      notify("The master passwords do not match.");
      return;
    }
    if (zxcvbn(master.slice(0, 256)).score < 3) {
      notify(
        "Choose a stronger master password, preferably a long random passphrase.",
      );
      return;
    }
    const password = passwordBytes(master);
    form.reset();
    await action(async () => {
      const begin = await api("/auth/register/options", "POST", {
        email: data.get("email"),
        registrationToken: data.get("registrationToken"),
      });
      const response = await startRegistration({ optionsJSON: begin.options });
      const profile = await engine.call<Profile>("create", {
        vaultId: begin.vaultId,
        password,
      });
      const result = await api("/auth/register/finish", "POST", {
        response,
        profile,
      });
      await signedIn(result);
      rows.current = [];
      setCards([]);
      setUnlocked(true);
      await persist(result.account, [], []);
    });
    if (!current.current.account) {
      engine.lock();
      setUnlocked(false);
    }
    if (password.byteLength) password.fill(0);
  }
  async function unlock(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget,
      password = passwordBytes(String(new FormData(form).get("master") || ""));
    form.reset();
    await action(async () => {
      if (!account) return;
      await engine.call("unlock", { profile: account.profile, password });
      setUnlocked(true);
      if (offline) {
        await renderCards();
        notify(
          "Offline vault unlocked. Changes remain encrypted until you synchronize.",
        );
      } else {
        await load();
      }
    });
    if (password.byteLength) password.fill(0);
  }
  async function openOffline() {
    const cached = await readCache();
    if (!cached)
      throw new Error("No encrypted offline vault is saved on this device.");
    setAccount({
      id: cached.export.userId,
      email: cached.email,
      vaultId: cached.export.profile.vaultId,
      profile: cached.export.profile,
      profileRevision: cached.export.profileRevision,
      twoFactor: cached.twoFactor,
    });
    rows.current = cached.export.items.map((envelope) => ({
      id: envelope.id,
      revision: envelope.revision,
      envelope,
      deleted: false,
    }));
    setPending(cached.pending);
    current.current.pending = cached.pending;
    setOffline(true);
  }
  async function save(id: string, item: VaultItem) {
    if (!account) throw new Error("Account unavailable.");
    const existing = rows.current.find((r) => r.id === id),
      queued = current.current.pending.find((p) => p.id === id),
      expected = queued?.expectedRevision ?? existing?.revision ?? 0;
    const envelope = await engine.call<Envelope>("save", {
      id,
      revision: expected + 1,
      item,
      previous: existing?.envelope,
    });
    let queue = current.current.pending;
    if (offline) {
      if (!cacheEnabled)
        throw new Error(
          "Enable encrypted offline storage before editing offline.",
        );
      queue = [
        ...current.current.pending.filter((p) => p.id !== id),
        { id, expectedRevision: expected, envelope, deleted: false },
      ];
      setPending(queue);
      current.current.pending = queue;
    } else {
      await api("/items/" + id, "PUT", {
        expectedRevision: expected,
        envelope,
      });
    }
    rows.current = [
      ...rows.current.filter((r) => r.id !== id),
      { id, revision: envelope.revision, envelope, deleted: false },
    ];
    await persist(account, rows.current, queue);
    await renderCards();
    setEditing(undefined);
    setDetail(undefined);
    notify(offline ? "Saved encrypted offline change." : "Credential saved.");
  }
  async function remove(id: string) {
    if (
      !window.confirm(
        "Delete this credential and revoke its server-side shares? Existing copies and backups may remain.",
      )
    )
      return;
    const existing = rows.current.find((r) => r.id === id);
    if (!existing || !account) return;
    const queued = current.current.pending.find((p) => p.id === id),
      expected = queued?.expectedRevision ?? existing.revision;
    let queue = current.current.pending.filter((p) => p.id !== id);
    if (offline) {
      if (expected > 0)
        queue.push({
          id,
          expectedRevision: expected,
          envelope: null,
          deleted: true,
        });
      setPending(queue);
      current.current.pending = queue;
    } else await api("/items/" + id, "DELETE", { expectedRevision: expected });
    rows.current = rows.current.filter((r) => r.id !== id);
    await persist(account, rows.current, queue);
    await renderCards();
    setDetail(undefined);
    notify(
      offline ? "Deletion queued for synchronization." : "Credential deleted.",
    );
  }
  async function sync() {
    const fresh = await api("/account");
    if (fresh.account.id !== account?.id)
      throw new Error(
        "Sign in with the cached vault’s account before synchronization.",
      );
    setCsrf(fresh.csrfToken || "");
    await engine.call("refreshProfile", { profile: fresh.account.profile });
    setAccount(fresh.account);
    let remaining = [...pending];
    for (const change of [...pending]) {
      await api(
        "/items/" + change.id,
        change.deleted ? "DELETE" : "PUT",
        change.deleted
          ? { expectedRevision: change.expectedRevision }
          : {
              expectedRevision: change.expectedRevision,
              envelope: change.envelope,
            },
      );
      remaining = remaining.filter((p) => p.id !== change.id);
      setPending(remaining);
      current.current.pending = remaining;
      await persist(fresh.account, rows.current, remaining);
    }
    await load(fresh.account);
    setOffline(false);
    notify("Encrypted changes synchronized.");
  }
  async function discardPending() {
    if (
      !window.confirm(
        "Discard pending offline changes and fetch the server copy? Export an encrypted backup first.",
      )
    )
      return;
    const fresh = await api("/account");
    if (fresh.account.id !== account?.id)
      throw new Error("Sign in with this account first.");
    setCsrf(fresh.csrfToken || "");
    setAccount(fresh.account);
    await engine.call("refreshProfile", { profile: fresh.account.profile });
    setPending([]);
    current.current.pending = [];
    await load(fresh.account);
    await persist(fresh.account, rows.current, []);
  }
  async function updateProfile(profile: Profile) {
    if (!account) throw new Error("Account unavailable.");
    try {
      const result = await api("/account/profile", "PUT", {
        profile,
        expectedRevision: account.profileRevision,
      });
      const next = {
        ...account,
        profile,
        profileRevision: result.profileRevision,
      };
      await engine.call("refreshProfile", { profile });
      setAccount(next);
      await persist(next);
    } catch (error) {
      await engine.call("refreshProfile", { profile: account.profile });
      throw error;
    }
  }
  const visible = cards.filter(
    (c) =>
      (!query ||
        [c.site, c.username, c.url, ...c.tags]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase())) &&
      (!folder || c.folder === folder) &&
      (!favorites || c.favorite),
  );
  const health = {
    weak: cards.filter((c) => c.score < 3).length,
    reused: cards.filter((c) => c.reused).length,
    old: cards.filter((c) => c.old).length,
    breached: Object.values(breaches).filter((v) => v === "breached").length,
  };
  const header = (
    <header className="topbar">
      <div className="brand">
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <path d="M16 3 27 8v8c0 7-11 13-11 13S5 23 5 16V8Z" />
          <path d="m11 15 4 4 7-8" />
        </svg>
        <span>
          Sentinel<small>PRIVATE VAULT</small>
        </span>
      </div>
      <div className="top-actions">
        <span className="status-dot">
          {unlocked
            ? offline
              ? "Offline · encrypted"
              : "Vault unlocked"
            : "Vault locked"}
        </span>
        <button
          className="icon"
          aria-label="Toggle dark mode"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? "☀" : "☾"}
        </button>
        {unlocked && <button onClick={() => lock()}>Lock vault</button>}
      </div>
    </header>
  );
  if (!account || !unlocked)
    return (
      <>
        {header}
        <main className="welcome">
          <div className="welcome-copy">
            <span className="eyebrow">
              YOUR DIGITAL LIFE. UNDER YOUR CONTROL.
            </span>
            <h1>
              A private place
              <br />
              for every password<span>.</span>
            </h1>
            <p>
              Your credentials are encrypted on your device. Your master
              password stays with you.
            </p>
            <div className="welcome-features">
              <span>◇ Client encryption</span>
              <span>◇ Passkey sign-in</span>
              <span>◇ Private sharing</span>
            </div>
            <div className="vault-art" aria-hidden="true">
              <div className="art-orbit" />
              <div className="art-safe">
                <span>◈</span>
                <i />
                <i />
                <i />
              </div>
              <div className="art-label">Protected by your master password</div>
            </div>
          </div>
          <section className="auth-card">
            <span className="eyebrow">SENTINEL VAULT</span>
            <h2>
              {account
                ? "Unlock your vault"
                : page === "register"
                  ? "Create your private vault"
                  : page === "second-factor"
                    ? "Verify your sign-in"
                    : "Welcome back"}
            </h2>
            {notice && (
              <p className="notice" role="status">
                {notice}
              </p>
            )}
            {account ? (
              <>
                <p>
                  {account.email}
                  {offline ? " · Offline copy" : ""}
                </p>
                <form onSubmit={unlock}>
                  <label>
                    Master password
                    <input
                      name="master"
                      type="password"
                      autoComplete="off"
                      required
                      maxLength={1024}
                    />
                  </label>
                  <button className="primary full" disabled={busy}>
                    {busy ? "Unlocking…" : "Unlock vault"}
                  </button>
                </form>
                <button
                  className="secondary full"
                  disabled={busy}
                  onClick={() => action(signIn)}
                >
                  Sign in again with passkey
                </button>
                <button
                  className="text"
                  disabled={busy}
                  onClick={() =>
                    action(async () => {
                      lock();
                      setAccount(undefined);
                      setPending([]);
                      rows.current = [];
                      await api("/auth/logout", "POST", {});
                      setCsrf("");
                    })
                  }
                >
                  Sign out
                </button>
              </>
            ) : page === "register" ? (
              <Registration
                busy={busy}
                submit={register}
                back={() => setPage("vault")}
              />
            ) : page === "second-factor" ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = e.currentTarget,
                    d = new FormData(f);
                  f.reset();
                  void action(async () =>
                    signedIn(
                      await api("/auth/second-factor", "POST", {
                        code: d.get("code"),
                        recovery: d.get("recovery") === "on",
                      }),
                    ),
                  );
                }}
              >
                <label>
                  Authenticator or recovery code
                  <input
                    name="code"
                    autoComplete="one-time-code"
                    required
                    maxLength={80}
                  />
                </label>
                <label className="check">
                  <input type="checkbox" name="recovery" />
                  Use a recovery code
                </label>
                <button className="primary full" disabled={busy}>
                  Verify
                </button>
                <button
                  type="button"
                  className="text"
                  onClick={() => setPage("vault")}
                >
                  Start sign-in again
                </button>
              </form>
            ) : (
              <>
                <p>
                  Sign in with your passkey, then unlock with your master
                  password.
                </p>
                <button
                  className="primary full"
                  disabled={busy}
                  onClick={() => action(signIn)}
                >
                  {busy ? "Signing in…" : "Sign in with passkey"}
                </button>
                <button
                  className="secondary full"
                  disabled={busy}
                  onClick={() => action(openOffline)}
                >
                  Open encrypted offline vault
                </button>
                <button className="text" onClick={() => setPage("register")}>
                  Create an account
                </button>
                <p className="small">
                  Registration requires your self-hosted server’s invitation
                  token.
                </p>
              </>
            )}
          </section>
        </main>
        <footer className="public-footer">
          No analytics. No third-party scripts. Your vault, your server.
        </footer>
      </>
    );
  return (
    <>
      {header}
      <div className="workspace">
        <aside className="sidebar">
          <p className="nav-label">WORKSPACE</p>
          {[
            ["vault", "◈", "All credentials"],
            ["health", "◉", "Password health"],
            ["generator", "✧", "Generator"],
            ["sharing", "⇄", "Secure sharing"],
            ["security", "◇", "Security settings"],
            ["activity", "≋", "Activity log"],
          ].map(([key, icon, label]) => (
            <button
              key={key}
              className={page === key ? "active" : ""}
              onClick={() => {
                setPage(key);
                setDetail(undefined);
                setEditing(undefined);
              }}
            >
              <span>{icon}</span>
              {label}
              {key === "vault" && <b>{cards.length}</b>}
            </button>
          ))}
          <div className="sidebar-bottom">
            <div className="avatar">{account.email[0].toUpperCase()}</div>
            <strong>{account.email}</strong>
            <small>Auto-lock after {lockMinutes} min</small>
            <button
              className="text"
              onClick={() =>
                action(async () => {
                  await api("/auth/logout", "POST", {});
                  lock();
                  setAccount(undefined);
                  rows.current = [];
                  setPending([]);
                  await clearCache();
                  setCsrf("");
                })
              }
            >
              Sign out & clear offline copy
            </button>
          </div>
        </aside>
        <main className="content">
          <div className="page-heading">
            <div>
              <span className="eyebrow">YOUR SECURITY WORKSPACE</span>
              <h1>
                {
                  (
                    {
                      vault: "All credentials",
                      health: "Password health",
                      generator: "Password generator",
                      sharing: "Secure sharing",
                      security: "Security settings",
                      activity: "Activity log",
                    } as any
                  )[page]
                }
              </h1>
              <p>
                {
                  (
                    {
                      vault:
                        "Organized, encrypted, and ready when you need them.",
                      health:
                        "Find passwords that deserve a stronger replacement.",
                      generator:
                        "Create something unpredictable. Keep it somewhere private.",
                      sharing:
                        "Send an encrypted snapshot to a verified recipient.",
                      security:
                        "Control access, recovery, and this device’s privacy.",
                      activity: "Review account and vault API events.",
                    } as any
                  )[page]
                }
              </p>
            </div>
            {page === "vault" && (
              <button
                className="primary"
                disabled={busy}
                onClick={() => {
                  setDetail(undefined);
                  setEditing({ item: empty() });
                }}
              >
                ＋ Add credential
              </button>
            )}
          </div>
          {notice && (
            <div className="notice" role="status">
              {notice}
              <button
                aria-label="Dismiss notification"
                onClick={() => setNotice("")}
              >
                ×
              </button>
            </div>
          )}
          {pending.length > 0 && (
            <div className="sync-banner">
              <span>
                {pending.length} encrypted offline change(s) awaiting sync.
              </span>
              <button disabled={busy} onClick={() => action(sync)}>
                Synchronize
              </button>
              <button disabled={busy} onClick={() => action(discardPending)}>
                Discard pending changes
              </button>
            </div>
          )}
          {page === "vault" && (
            <>
              <div className="vault-toolbar">
                <input
                  className="search"
                  aria-label="Search vault"
                  placeholder="Search names, usernames, URLs or tags…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <select
                  aria-label="Filter folder"
                  value={folder}
                  onChange={(e) => setFolder(e.target.value)}
                >
                  <option value="">All folders</option>
                  {[...new Set(cards.map((c) => c.folder).filter(Boolean))].map(
                    (f) => (
                      <option key={f}>{f}</option>
                    ),
                  )}
                </select>
                <button
                  className={favorites ? "selected" : ""}
                  onClick={() => setFavorites(!favorites)}
                >
                  ☆ Favorites
                </button>
                <button
                  disabled={busy || pending.length > 0}
                  onClick={() => action(() => load())}
                >
                  Refresh
                </button>
              </div>
              <div className="vault-layout">
                <section className="credential-list">
                  {!visible.length ? (
                    <div className="empty-state">
                      <span>◈</span>
                      <h3>
                        {cards.length
                          ? "No matching credentials"
                          : "Your vault starts here"}
                      </h3>
                      <p>
                        {cards.length
                          ? "Try a different search or folder."
                          : "Add a credential or import your existing passwords."}
                      </p>
                      <button onClick={() => setPage("security")}>
                        Import credentials
                      </button>
                    </div>
                  ) : (
                    visible.map((card) => (
                      <button
                        className={
                          "credential-row " +
                          (detail?.card.id === card.id ? "chosen" : "")
                        }
                        key={card.id}
                        onClick={() =>
                          action(async () => {
                            const item = await engine.call<VaultItem>("item", {
                              envelope: rows.current.find(
                                (r) => r.id === card.id,
                              )!.envelope,
                            });
                            setEditing(undefined);
                            setDetail({ card, item });
                          })
                        }
                      >
                        <span className="site-icon">
                          {card.site[0].toUpperCase()}
                        </span>
                        <span className="credential-name">
                          <strong>{card.site}</strong>
                          <small>
                            {card.username || "No username"}
                            {card.folder ? " · " + card.folder : ""}
                          </small>
                        </span>
                        <span
                          className={"strength-pill strength-" + card.score}
                        >
                          {
                            [
                              "Very weak",
                              "Weak",
                              "Fair",
                              "Strong",
                              "Very strong",
                            ][card.score]
                          }
                        </span>
                        <span>{card.favorite ? "★" : "›"}</span>
                      </button>
                    ))
                  )}
                </section>
                {editing ? (
                  <Editor
                    key={editing.id || "new"}
                    item={editing.item}
                    busy={busy}
                    close={() => setEditing(undefined)}
                    submit={(item) =>
                      action(() =>
                        save(editing.id || crypto.randomUUID(), item),
                      )
                    }
                  />
                ) : detail ? (
                  <Detail
                    detail={detail}
                    copy={(value) => action(() => copySecret(value, notify))}
                    edit={() => {
                      setEditing({ id: detail.card.id, item: detail.item });
                      setDetail(undefined);
                    }}
                    remove={() => action(() => remove(detail.card.id))}
                  />
                ) : (
                  <section className="detail-placeholder">
                    <span>◇</span>
                    <h3>Everything in its place.</h3>
                    <p>Select a credential to view its details.</p>
                    <p className="small">Search happens on your device.</p>
                  </section>
                )}
              </div>
            </>
          )}
          {page === "health" && (
            <>
              <div className="health-grid">
                {[
                  ["Weak", health.weak, "score below Strong"],
                  ["Reused", health.reused, "same password, multiple items"],
                  ["Old", health.old, "unchanged for 180+ days"],
                  ["Breached", health.breached, "confirmed by opted-in checks"],
                ].map(([label, note, desc]) => (
                  <div className="health-card" key={label}>
                    <span>{label}</span>
                    <strong>{note}</strong>
                    <small>{desc}</small>
                  </div>
                ))}
              </div>
              <div className="help-box">
                <h3>Breach checks are optional.</h3>
                <p>
                  HIBP receives your IP address and a five-character SHA-1
                  prefix, never the password or full hash. A miss is not proof
                  that a password has never leaked.
                </p>
                <button
                  disabled={busy}
                  onClick={() =>
                    action(async () => {
                      if (
                        !window.confirm(
                          "Query HIBP using a five-character hash prefix for each current password? HIBP will see your IP address.",
                        )
                      )
                        return;
                      for (const card of cards) {
                        const result = await engine.call("breach", {
                          envelope: rows.current.find((r) => r.id === card.id)!
                            .envelope,
                        });
                        setBreaches((previous) => ({
                          ...previous,
                          [card.id]: result.status,
                        }));
                      }
                    })
                  }
                >
                  Run breach checks
                </button>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Credential</th>
                      <th>Strength</th>
                      <th>Reuse</th>
                      <th>Age</th>
                      <th>Breach lookup</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cards.map((c) => (
                      <tr key={c.id}>
                        <td>{c.site}</td>
                        <td>
                          {
                            [
                              "Very weak",
                              "Weak",
                              "Fair",
                              "Strong",
                              "Very strong",
                            ][c.score]
                          }
                        </td>
                        <td>{c.reused ? "Reused" : "Unique in this vault"}</td>
                        <td>{c.old ? "180+ days" : "Recent"}</td>
                        <td>{breaches[c.id] || "Not checked"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="small">
                Age alone is not a reason to rotate a strong, unique password.
                Replace compromised, reused or weak passwords first.
              </p>
            </>
          )}
          {page === "generator" && (
            <Generator busy={busy} action={action} notify={notify} />
          )}
          {page === "sharing" && (
            <Sharing
              account={account}
              cards={cards}
              shares={shares}
              busy={busy}
              action={action}
              updateProfile={updateProfile}
              rows={rows.current}
              refresh={async () => setShares((await api("/shares")).shares)}
              notify={notify}
            />
          )}
          {page === "security" && (
            <Security
              account={account}
              busy={busy}
              action={action}
              notify={notify}
              cacheEnabled={cacheEnabled}
              toggleCache={async (enabled: boolean) => {
                if (!enabled && pending.length)
                  throw new Error(
                    "Synchronize pending changes before disabling offline storage.",
                  );
                localStorage.setItem("sv-cache", String(enabled));
                setCacheEnabled(enabled);
                if (enabled)
                  await writeCache({
                    export: exportValue(account),
                    email: account.email,
                    twoFactor: account.twoFactor,
                    pending,
                  });
                else await clearCache();
              }}
              lockMinutes={lockMinutes}
              setLockMinutes={(n: number) => {
                setLockMinutes(n);
                localStorage.setItem("sv-lock", String(n));
              }}
              exportVault={() =>
                download("sentinel-encrypted-vault.json", exportValue(account))
              }
              updateProfile={updateProfile}
              updateAccount={setAccount}
              imported={setImporting}
            />
          )}
          {page === "activity" && <Activity action={action} />}
          {importing && (
            <section className="panel import-review">
              <h2>Review CSV import</h2>
              <p>
                {importing.items.length} login entries; {importing.skipped}{" "}
                unsupported item(s) skipped. Password history and
                provider-specific non-login records are not converted.
                Additional login fields are retained in encrypted notes.
              </p>
              <ul>
                {importing.items.slice(0, 20).map((item, i) => (
                  <li key={i}>
                    {item.site} · {item.username}
                  </li>
                ))}
              </ul>
              <button
                className="primary"
                disabled={busy}
                onClick={() =>
                  action(async () => {
                    const items = importing.items;
                    setImporting(undefined);
                    let completed = 0;
                    try {
                      for (const item of items) {
                        await save(crypto.randomUUID(), item);
                        completed++;
                      }
                    } catch {
                      throw new Error(
                        "Imported " +
                          completed +
                          " of " +
                          items.length +
                          " credentials before an error. Check the vault before retrying.",
                      );
                    }
                    notify("Imported " + completed + " encrypted credentials.");
                  })
                }
              >
                Encrypt and import
              </button>
              <button onClick={() => setImporting(undefined)}>Cancel</button>
            </section>
          )}
        </main>
      </div>
    </>
  );
}

function Registration({
  busy,
  submit,
  back,
}: {
  busy: boolean;
  submit: (e: React.FormEvent<HTMLFormElement>) => void;
  back: () => void;
}) {
  const [score, setScore] = useState(0);
  return (
    <form onSubmit={submit}>
      <label>
        Email
        <input
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
        />
      </label>
      <label>
        Invitation token
        <input
          name="registrationToken"
          type="password"
          required
          autoComplete="off"
        />
      </label>
      <label>
        Master password
        <input
          name="master"
          type="password"
          required
          maxLength={1024}
          autoComplete="new-password"
          onChange={(e) => setScore(zxcvbn(e.target.value.slice(0, 256)).score)}
        />
      </label>
      <div className={"strength-meter strength-" + score}>
        <i />
        <span>
          {["Very weak", "Weak", "Fair", "Strong", "Very strong"][score]}
        </span>
      </div>
      <label>
        Confirm master password
        <input
          name="confirm"
          type="password"
          required
          maxLength={1024}
          autoComplete="new-password"
        />
      </label>
      <p className="small">
        Store your master password safely. Neither the server nor recovery codes
        can restore it. Your passkey authenticates the account separately.
      </p>
      <button className="primary full" disabled={busy}>
        {busy ? "Creating vault…" : "Create vault & passkey"}
      </button>
      <button type="button" className="text" onClick={back}>
        Back to sign-in
      </button>
    </form>
  );
}
function Editor({
  item,
  busy,
  close,
  submit,
}: {
  item: VaultItem;
  busy: boolean;
  close: () => void;
  submit: (item: VaultItem) => void;
}) {
  return (
    <form
      className="panel editor"
      onSubmit={(e) => {
        e.preventDefault();
        const d = new FormData(e.currentTarget);
        submit({
          ...item,
          site: String(d.get("site")),
          username: String(d.get("username")),
          password: String(d.get("password")),
          url: String(d.get("url")),
          notes: String(d.get("notes")),
          folder: String(d.get("folder")),
          tags: String(d.get("tags"))
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
          favorite: d.get("favorite") === "on",
        });
      }}
    >
      <div className="panel-heading">
        <h2>Credential details</h2>
        <button type="button" onClick={close} aria-label="Close editor">
          ×
        </button>
      </div>
      {[
        ["site", "Name", "text", 300],
        ["username", "Username", "text", 512],
        ["password", "Password", "password", 4096],
        ["url", "Website URL", "url", 2048],
        ["folder", "Folder", "text", 128],
        ["tags", "Tags, separated by commas", "text", 528],
      ].map(([key, label, type, max]) => (
        <label key={key}>
          {label}
          <input
            name={String(key)}
            type={String(type)}
            maxLength={Number(max)}
            required={key === "site"}
            autoComplete="off"
            defaultValue={
              key === "tags" ? item.tags.join(", ") : (item as any)[key]
            }
          />
        </label>
      ))}
      <label>
        Notes
        <textarea
          name="notes"
          rows={4}
          maxLength={16000}
          defaultValue={item.notes}
        />
      </label>
      <label className="check">
        <input name="favorite" type="checkbox" defaultChecked={item.favorite} />
        Favorite
      </label>
      <button className="primary full" disabled={busy}>
        Save encrypted credential
      </button>
    </form>
  );
}
function Detail({
  detail,
  copy,
  edit,
  remove,
}: {
  detail: { card: Card; item: VaultItem };
  copy: (v: string) => void;
  edit: () => void;
  remove: () => void;
}) {
  const [reveal, setReveal] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis>();
  useEffect(() => {
    let active = true;
    setAnalysis(undefined);
    void engine
      .call<Analysis>("analyze", { password: detail.item.password })
      .then((value) => {
        if (active) setAnalysis(value);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [detail.card.id, detail.card.revision]);

  useEffect(() => {
    setReveal(false);
  }, [detail.card.id]);
  useEffect(() => {
    if (!reveal) return;
    const t = setTimeout(() => setReveal(false), 10000);
    return () => clearTimeout(t);
  }, [reveal]);
  return (
    <section className="panel details">
      <span className="site-icon large">{detail.item.site[0]}</span>
      <h2>{detail.item.site}</h2>
      <p className="small">{detail.item.folder || "No folder"}</p>
      <label>
        Username
        <div className="copy-field">
          <span>{detail.item.username || "—"}</span>
          <button
            aria-label="Copy username"
            onClick={() => copy(detail.item.username)}
          >
            Copy
          </button>
        </div>
      </label>
      <label>
        Password
        <div className="copy-field">
          <span className="secret">
            {reveal ? detail.item.password : "••••••••••••••••"}
          </span>
          <button
            aria-label="Copy password"
            onClick={() => copy(detail.item.password)}
          >
            Copy
          </button>
        </div>
      </label>
      <button className="text" onClick={() => setReveal(!reveal)}>
        {reveal ? "Hide password" : "Reveal for 10 seconds"}
      </button>
      {detail.item.url && (
        <label>
          Website<p className="wrap">{detail.item.url}</p>
        </label>
      )}
      {detail.item.notes && (
        <label>
          Notes<p className="notes">{detail.item.notes}</p>
        </label>
      )}
      <div className="tags">
        {detail.item.tags.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
      <details>
        <summary>Password history ({detail.item.history.length})</summary>
        {detail.item.history.map((h, i) => (
          <div className="history" key={i}>
            <span>{new Date(h.changedAt).toLocaleDateString()}</span>
            <span>••••••••</span>
            <button onClick={() => copy(h.password)}>
              Copy previous password
            </button>
          </div>
        ))}
      </details>
      {analysis && (
        <details>
          <summary>Strength analysis & suggestions</summary>
          <p className="small">
            {analysis.patterns.join(" · ") || "No obvious pattern detected"}
          </p>
          <ul>
            {analysis.suggestions.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <p className="small">
            Empirical Shannon statistic:{" "}
            {analysis.shannonBitsPerCharacter.toFixed(2)} bits/character;{" "}
            {analysis.empiricalBits.toFixed(1)} bits across this string.
            Character frequencies cannot measure how unpredictably you chose it.
          </p>
          <p className="small">
            Illustrative guess-time models: GPU at 10¹⁰ guesses/s ≈{" "}
            {analysis.offlineGpuSeconds.toExponential(1)} s; ordered dictionary
            at 10⁸ guesses/s ≈{" "}
            {analysis.offlineDictionarySeconds.toExponential(1)} s. These assume
            a fast target hash, not this vault’s Argon2 cost. Actual attacks
            vary by hash, hardware and password distribution.
          </p>
        </details>
      )}
      <div className="detail-actions">
        <button className="primary" onClick={edit}>
          Edit
        </button>
        <button className="danger" onClick={remove}>
          Delete
        </button>
      </div>
    </section>
  );
}
function Generator({ busy, action, notify }: any) {
  const [mode, setMode] = useState<"password" | "passphrase">("password"),
    [value, setValue] = useState(""),
    [entropy, setEntropy] = useState(0);
  return (
    <section className="panel generator">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const d = new FormData(e.currentTarget);
          void action(async () => {
            const result = await engine.call("generate", {
              mode,
              length: Number(d.get("length")),
              lower: d.get("lower") === "on",
              upper: d.get("upper") === "on",
              digits: d.get("digits") === "on",
              symbols: d.get("symbols") === "on",
            });
            setValue(result.text);
            setEntropy(result.entropyBits);
          });
        }}
      >
        <label>
          Mode
          <select
            value={mode}
            onChange={(e) => {
              setMode(e.target.value as any);
              setValue("");
            }}
          >
            <option value="password">Random password</option>
            <option value="passphrase">Random passphrase</option>
          </select>
        </label>
        <label>
          {mode === "password" ? "Characters" : "Words"}
          <input
            key={mode}
            name="length"
            type="number"
            min={mode === "password" ? 8 : 4}
            max={mode === "password" ? 128 : 16}
            defaultValue={mode === "password" ? 24 : 8}
            required
          />
        </label>
        {mode === "password" && (
          <div className="charset">
            {[
              ["lower", "Lowercase"],
              ["upper", "Uppercase"],
              ["digits", "Digits"],
              ["symbols", "Symbols"],
            ].map(([name, label]) => (
              <label className="check" key={name}>
                <input type="checkbox" name={name} defaultChecked />
                {label}
              </label>
            ))}
          </div>
        )}
        <button className="primary" disabled={busy}>
          Generate
        </button>
      </form>
      {value && (
        <div className="generated">
          <output>{value}</output>
          <p>
            {entropy} bits{" "}
            {mode === "passphrase"
              ? "of generator entropy"
              : "conservative generator entropy estimate"}
          </p>
          <button onClick={() => action(() => copySecret(value, notify))}>
            Copy generated password
          </button>
        </div>
      )}
      <p className="small">
        Generated here using your device’s cryptographic random source.
        Passphrases use a locally bundled 2048-word English list. Generated
        values clear when you leave this view or lock.
      </p>
    </section>
  );
}
function Sharing({
  account,
  cards,
  shares,
  busy,
  action,
  updateProfile,
  rows,
  refresh,
  notify,
}: any) {
  const [ownFingerprint, setOwnFingerprint] = useState("");
  useEffect(() => {
    void engine
      .call<string>("fingerprint", { publicKey: account.profile.publicKey })
      .then(setOwnFingerprint)
      .catch(() => {});
  }, [account.profile.publicKey]);
  const [recipient, setRecipient] = useState<any>(),
    [fingerprint, setFingerprint] = useState(""),
    [opened, setOpened] = useState<VaultItem>();
  async function lookup(email: string) {
    const result = await api("/directory/lookup", "POST", { email });
    setRecipient(result.user);
    setFingerprint(
      await engine.call("fingerprint", { publicKey: result.user.publicKey }),
    );
  }
  return (
    <>
      <section className="panel">
        <h2>Verify a contact</h2>
        <p>Your public identity fingerprint:</p>
        <code className="fingerprint">{ownFingerprint}</code>
        <p>
          Compare the full fingerprint through an independent channel, such as
          an in-person conversation. A fingerprint displayed by this server
          alone does not verify identity.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const d = new FormData(e.currentTarget);
            void action(() => lookup(String(d.get("email"))));
          }}
        >
          <div className="inline-form">
            <label>
              Recipient email
              <input type="email" name="email" required />
            </label>
            <button disabled={busy}>Find contact</button>
          </div>
        </form>
        {recipient && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const d = new FormData(e.currentTarget);
              if (
                String(d.get("verified")).replace(/\s/g, "").toLowerCase() !==
                fingerprint.replace(/\s/g, "")
              ) {
                notify("The fingerprint does not match.");
                return;
              }
              void action(async () => {
                await updateProfile(
                  await engine.call("trust", {
                    userId: recipient.id,
                    publicKey: recipient.publicKey,
                    label: recipient.email,
                  }),
                );
                notify("Contact fingerprint pinned in your encrypted vault.");
              });
            }}
          >
            <p>
              <strong>{recipient.email}</strong>
            </p>
            <code className="fingerprint">{fingerprint}</code>
            <label>
              Enter the fingerprint verified independently
              <input name="verified" required autoComplete="off" />
            </label>
            <button disabled={busy}>Pin verified contact</button>
          </form>
        )}
      </section>
      <section className="panel">
        <h2>Share a credential snapshot</h2>
        <p>
          The recipient receives the current credential fields and notes.
          Password history is excluded. Revocation blocks future server
          retrieval, but cannot erase copies already obtained.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const d = new FormData(e.currentTarget);
            void action(async () => {
              if (!recipient)
                throw new Error("Find and verify a recipient first.");
              const record = rows.find((r: any) => r.id === d.get("item"));
              if (!record) throw new Error("Select a credential.");
              const envelope = await engine.call<Share>("share", {
                envelope: record.envelope,
                recipientId: recipient.id,
                publicKey: recipient.publicKey,
              });
              await api("/shares", "POST", {
                recipientId: recipient.id,
                itemId: record.id,
                envelope,
              });
              await refresh();
              notify("Encrypted snapshot shared.");
            });
          }}
        >
          <label>
            Credential
            <select name="item" required>
              <option value="">Choose a credential</option>
              {cards.map((c: Card) => (
                <option key={c.id} value={c.id}>
                  {c.site}
                </option>
              ))}
            </select>
          </label>
          <button className="primary" disabled={busy || !recipient}>
            Share with verified contact
          </button>
        </form>
      </section>
      <section className="panel">
        <h2>Shared items</h2>
        {!shares.length ? (
          <p>No shared items.</p>
        ) : (
          shares.map((s: SharedRow) => (
            <div className="share-row" key={s.id}>
              <span>
                {s.sender_id === account.id
                  ? "To " + s.recipient_email
                  : "From " + s.sender_email}
              </span>
              {s.sender_id === account.id ? (
                <button
                  className="danger"
                  disabled={busy}
                  onClick={() =>
                    action(async () => {
                      if (
                        !window.confirm(
                          "Revoke this server-side share? Existing copies remain accessible.",
                        )
                      )
                        return;
                      await api("/shares/" + s.id, "DELETE", {});
                      await refresh();
                    })
                  }
                >
                  Revoke
                </button>
              ) : (
                <button
                  disabled={busy}
                  onClick={() =>
                    action(async () =>
                      setOpened(
                        await engine.call("openShare", {
                          envelope: s.envelope,
                          senderId: s.sender_id,
                        }),
                      ),
                    )
                  }
                >
                  Decrypt verified snapshot
                </button>
              )}
            </div>
          ))
        )}
        {opened && (
          <div className="shared-detail">
            <h3>{opened.site}</h3>
            <p>{opened.username}</p>
            <button
              onClick={() => action(() => copySecret(opened.password, notify))}
            >
              Copy shared password
            </button>
            <p className="notes">{opened.notes}</p>
            <button onClick={() => setOpened(undefined)}>Close</button>
          </div>
        )}
      </section>
    </>
  );
}
function Security({
  account,
  busy,
  action,
  notify,
  cacheEnabled,
  toggleCache,
  lockMinutes,
  setLockMinutes,
  exportVault,
  updateProfile,
  updateAccount,
  imported,
}: any) {
  const [setup, setSetup] = useState<{ secret: string; uri: string }>(),
    [codes, setCodes] = useState<string[]>([]),
    [pairing, setPairing] = useState(""),
    [sessions, setSessions] = useState<any[]>([]);
  useEffect(() => {
    void api("/sessions")
      .then((r) => setSessions(r.sessions))
      .catch(() => {});
  }, []);
  return (
    <div className="settings-grid">
      <section className="panel">
        <h2>Device privacy</h2>
        <label>
          Auto-lock after inactivity
          <select
            value={lockMinutes}
            onChange={(e) => setLockMinutes(Number(e.target.value))}
          >
            {[1, 2, 5, 10, 15, 30].map((n) => (
              <option value={n} key={n}>
                {n} minutes
              </option>
            ))}
          </select>
        </label>
        <p className="small">
          The vault also locks when this tab is hidden. Other tabs receive a
          lock signal.
        </p>
        <label className="check">
          <input
            type="checkbox"
            checked={cacheEnabled}
            onChange={(e) => action(() => toggleCache(e.target.checked))}
          />
          Keep an encrypted offline copy on this device
        </label>
        <p className="small">
          Only encrypted vault content and necessary public account metadata are
          stored. Never enable this on a shared or untrusted device.
        </p>
        <button onClick={exportVault}>Export encrypted JSON backup</button>
        <label className="file-label">
          Import CSV
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file)
                void action(async () => {
                  if (file.size > 2097152)
                    throw new Error("CSV exceeds 2 MiB.");
                  imported(importCsv(await file.text()));
                });
            }}
          />
        </label>
        <p className="small">
          Bitwarden, LastPass and 1Password login CSVs are parsed locally.
          Review before importing. Protect and remove the original plaintext CSV
          yourself.
        </p>
      </section>
      <section className="panel">
        <h2>Master password</h2>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const f = e.currentTarget,
              d = new FormData(f),
              old = String(d.get("old") || ""),
              next = String(d.get("next") || "");
            if (
              !(await engine.call("compare", {
                a: passwordBytes(next),
                b: passwordBytes(String(d.get("confirm") || "")),
              })) ||
              zxcvbn(next.slice(0, 256)).score < 3
            ) {
              notify("Use a strong matching new master password.");
              return;
            }
            const oldPassword = passwordBytes(old),
              newPassword = passwordBytes(next);
            f.reset();
            void action(async () => {
              await updateProfile(
                await engine.call("changePassword", {
                  oldPassword,
                  newPassword,
                }),
              );
              notify(
                "Master password changed. Other sessions were revoked. Old backups still require the old password.",
              );
            });
          }}
        >
          <label>
            Current master password
            <input name="old" type="password" required autoComplete="off" />
          </label>
          <label>
            New master password
            <input
              name="next"
              type="password"
              required
              autoComplete="new-password"
            />
          </label>
          <label>
            Confirm new master password
            <input
              name="confirm"
              type="password"
              required
              autoComplete="new-password"
            />
          </label>
          <button disabled={busy}>Change master password</button>
        </form>
        <p className="small">
          Sign in again first if your authenticated session is older than five
          minutes.
        </p>
      </section>
      <section className="panel">
        <h2>Authenticator protection</h2>
        <p>
          {account.twoFactor
            ? "TOTP authentication is enabled."
            : "TOTP authentication is not enabled."}
        </p>
        {!account.twoFactor && !setup && (
          <button
            disabled={busy}
            onClick={() =>
              action(async () =>
                setSetup(await api("/account/totp/setup", "POST", {})),
              )
            }
          >
            Set up authenticator
          </button>
        )}
        {setup && (
          <>
            <p>
              In Google Authenticator or another TOTP app, choose manual setup:
              time-based, six digits, 30 seconds.
            </p>
            <code className="fingerprint">{setup.secret}</code>
            <details>
              <summary>Authenticator URI</summary>
              <code className="wrap">{setup.uri}</code>
            </details>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const f = e.currentTarget,
                  d = new FormData(f);
                f.reset();
                void action(async () => {
                  const result = await api("/account/totp/confirm", "POST", {
                    code: d.get("code"),
                    recovery: false,
                  });
                  setCodes(result.recoveryCodes);
                  setSetup(undefined);
                  updateAccount({ ...account, twoFactor: true });
                });
              }}
            >
              <label>
                Current authenticator code
                <input
                  name="code"
                  inputMode="numeric"
                  pattern="[0-9]{6}"
                  autoComplete="one-time-code"
                  required
                />
              </label>
              <button disabled={busy}>Enable TOTP</button>
            </form>
          </>
        )}
        {codes.length > 0 && (
          <div className="recovery">
            <h3>Save these recovery codes now</h3>
            <p>
              Each code bypasses TOTP once after passkey sign-in. They cannot
              unlock a vault or recover a lost master password.
            </p>
            {codes.map((c) => (
              <code key={c}>{c}</code>
            ))}
            <button onClick={() => setCodes([])}>I saved them safely</button>
          </div>
        )}
        {account.twoFactor && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = e.currentTarget,
                d = new FormData(f);
              f.reset();
              void action(async () => {
                await api("/account/totp/disable", "POST", {
                  code: d.get("code"),
                  recovery: d.get("recovery") === "on",
                });
                updateAccount({ ...account, twoFactor: false });
                setCodes([]);
                notify("TOTP disabled; recovery codes invalidated.");
              });
            }}
          >
            <label>
              Authenticator or recovery code
              <input name="code" required autoComplete="one-time-code" />
            </label>
            <label className="check">
              <input name="recovery" type="checkbox" />
              Use recovery code
            </label>
            <button className="danger" disabled={busy}>
              Disable TOTP
            </button>
          </form>
        )}
        <button
          disabled={busy}
          onClick={() =>
            action(async () => {
              const begin = await api("/account/passkeys/options", "POST", {});
              await api("/account/passkeys/finish", "POST", {
                response: await startRegistration({
                  optionsJSON: begin.options,
                }),
              });
              notify("Additional passkey registered.");
            })
          }
        >
          Add another passkey
        </button>
      </section>
      <section className="panel">
        <h2>Pair your browser extension</h2>
        <p>
          Create a five-minute, single-use pairing token. Paste it into the
          independently installed Sentinel extension and unlock locally with
          your master password.
        </p>
        <button
          disabled={busy}
          onClick={() =>
            action(async () => {
              const result = await api("/devices/pairing", "POST", {
                label: "Browser extension",
              });
              setPairing(result.pairingToken);
            })
          }
        >
          Create pairing token
        </button>
        {pairing && (
          <>
            <code className="fingerprint">{pairing}</code>
            <button onClick={() => action(() => copySecret(pairing, notify))}>
              Copy pairing token
            </button>
            <button onClick={() => setPairing("")}>Hide token</button>
          </>
        )}
        <h3>Account sessions</h3>
        {sessions.map((s) => (
          <div className="share-row" key={s.id}>
            <span>
              {s.label}
              <small>{new Date(s.last_seen).toLocaleString()}</small>
            </span>
            <button
              disabled={busy}
              onClick={() =>
                action(async () => {
                  await api("/sessions/" + s.id, "DELETE", {});
                  setSessions(sessions.filter((v) => v.id !== s.id));
                  notify("Session revoked.");
                })
              }
            >
              Revoke
            </button>
          </div>
        ))}
      </section>
    </div>
  );
}
function Activity({ action }: any) {
  const [events, setEvents] = useState<any[]>([]);
  useEffect(() => {
    void action(async () => setEvents((await api("/audit")).events));
  }, []);
  return (
    <section className="panel">
      <p>
        Only event metadata is recorded. Offline reads are not visible to the
        server, and a compromised server can falsify its own logs.
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Event</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id}>
                <td>{new Date(e.created_at).toLocaleString()}</td>
                <td>{e.action}</td>
                <td>{e.success ? "Success" : "Failed"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
