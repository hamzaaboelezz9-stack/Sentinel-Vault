import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { CryptoClient } from "../../../apps/web/src/worker-client";
import { passwordBytes } from "../../../packages/crypto/bytes";
import {
  EnvelopeSchema,
  ProfileSchema,
  type Envelope,
  type Profile,
  type VaultItem,
} from "../../../packages/shared/schema";
import { allowedOrigin, fillLogin } from "./autofill";
import "./popup.css";
const browser = (globalThis as any).browser || (globalThis as any).chrome;
const engine = new CryptoClient();
interface Connection {
  origin: string;
  token: string;
}
function Popup() {
  const [connection, setConnection] = useState<Connection>(),
    [profile, setProfile] = useState<Profile>(),
    [unlocked, setUnlocked] = useState(false),
    [cards, setCards] = useState<any[]>([]),
    [records, setRecords] = useState<Envelope[]>([]),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [query, setQuery] = useState("");
  const lock = () => {
    engine.lock();
    setCards([]);
    setRecords([]);
    setUnlocked(false);
  };
  async function request(
    path: string,
    method = "GET",
    body?: unknown,
    active = connection,
  ) {
    if (!active) throw new Error("Pair the extension first.");
    const res = await fetch(active.origin + "/api" + path, {
      method,
      credentials: "omit",
      cache: "no-store",
      redirect: "error",
      referrerPolicy: "no-referrer",
      signal: AbortSignal.timeout(15000),
      headers: {
        Authorization: "Bearer " + active.token,
        ...(body ? { "Content-Type": "application/json" } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok)
      throw new Error(
        res.status === 401
          ? "Pairing session expired. Pair again."
          : "Server request failed.",
      );
    return res.json();
  }
  async function act(fn: () => Promise<void>) {
    setBusy(true);
    setNotice("");
    try {
      await fn();
    } catch (e) {
      setNotice(e instanceof Error ? e.message : "Operation failed.");
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    void browser.storage.session.get("connection").then(async (result: any) => {
      try {
        if (result.connection) {
          const active = result.connection;
          allowedOrigin(active.origin);
          const account = await request("/account", "GET", undefined, active);
          setProfile(ProfileSchema.parse(account.account.profile));
          setConnection(active);
        }
      } catch {
        setNotice("Pairing session is unavailable. Pair again.");
      }
    });
    const hide = () => {
      if (document.hidden) lock();
    };
    document.addEventListener("visibilitychange", hide);
    return () => {
      document.removeEventListener("visibilitychange", hide);
      engine.lock();
    };
  }, []);
  useEffect(() => {
    if (!unlocked) return;
    let last = Date.now();
    const activity = () => {
      last = Date.now();
    };
    window.addEventListener("pointerdown", activity);
    window.addEventListener("keydown", activity);
    const timer = setInterval(() => {
      if (Date.now() - last > 300000) lock();
    }, 1000);
    return () => {
      clearInterval(timer);
      window.removeEventListener("pointerdown", activity);
      window.removeEventListener("keydown", activity);
    };
  }, [unlocked]);
  async function autofill(id: string) {
    const envelope = records.find((r) => r.id === id);
    if (!envelope) throw new Error("Credential unavailable.");
    const item = await engine.call<VaultItem>("item", { envelope });
    const origin = allowedOrigin(item.url);
    const tabs = await browser.tabs.query({
      active: true,
      currentWindow: true,
    });
    const tab = tabs[0];
    if (!tab?.id || !tab.url || allowedOrigin(tab.url) !== origin)
      throw new Error(
        "The active tab must exactly match the credential website origin.",
      );
    if (
      !window.confirm(
        "Fill the login form on " +
          origin +
          "? This page will receive the selected credentials.",
      )
    )
      return;
    const result = await browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: fillLogin,
      args: [
        {
          expectedOrigin: origin,
          username: item.username,
          password: item.password,
        },
      ],
    });
    if (!result[0]?.result)
      throw new Error("No unambiguous, same-origin login form found.");
    setNotice("Filled the selected form. It was not submitted.");
    lock();
  }
  return (
    <main>
      <header>
        <span>◇</span>
        <div>
          Sentinel<small>INDEPENDENT VAULT CLIENT</small>
        </div>
        {unlocked && <button onClick={lock}>Lock</button>}
      </header>
      {notice && (
        <p role="status" className="notice">
          {notice}
        </p>
      )}
      {!connection ? (
        <>
          <h1>Pair your vault</h1>
          <p>Create a pairing token in your vault’s Security settings.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget,
                d = new FormData(form);
              form.reset();
              void act(async () => {
                const origin = allowedOrigin(String(d.get("server")));
                const permitted = await browser.permissions.request({
                  origins: [
                    new URL(origin).protocol +
                      "//" +
                      new URL(origin).hostname +
                      "/*",
                  ],
                });
                if (!permitted)
                  throw new Error("Server access permission was declined.");
                const res = await fetch(origin + "/api/auth/pair", {
                  method: "POST",
                  credentials: "omit",
                  cache: "no-store",
                  redirect: "error",
                  signal: AbortSignal.timeout(15000),
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ pairingToken: d.get("token") }),
                });
                if (!res.ok)
                  throw new Error("Pairing failed. Generate a new token.");
                const result = await res.json(),
                  active = { origin, token: result.token };
                await browser.storage.session.set({ connection: active });
                const account = await request(
                  "/account",
                  "GET",
                  undefined,
                  active,
                );
                setProfile(ProfileSchema.parse(account.account.profile));
                setConnection(active);
              });
            }}
          >
            <label>
              Server URL
              <input
                name="server"
                type="url"
                placeholder="https://vault.example.com"
                required
              />
            </label>
            <label>
              Single-use pairing token
              <input
                name="token"
                type="password"
                required
                autoComplete="off"
                maxLength={100}
              />
            </label>
            <button className="primary" disabled={busy}>
              Pair extension
            </button>
          </form>
        </>
      ) : !unlocked ? (
        <>
          <h1>Unlock locally</h1>
          <p>{connection.origin}</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const f = e.currentTarget,
                password = passwordBytes(
                  String(new FormData(f).get("password") || ""),
                );
              f.reset();
              void act(async () => {
                await engine.call("unlock", { profile, password });
                const result = await request("/items");
                const items = result.items
                  .filter((r: any) => !r.deleted)
                  .map((r: any) => EnvelopeSchema.parse(r.envelope));
                setRecords(items);
                setCards(await engine.call("list", { items }));
                setUnlocked(true);
              });
            }}
          >
            <label>
              Master password
              <input
                name="password"
                type="password"
                required
                autoComplete="off"
                maxLength={1024}
              />
            </label>
            <button className="primary" disabled={busy}>
              Unlock vault
            </button>
          </form>
          <button
            onClick={() =>
              act(async () => {
                await request("/auth/logout", "POST", {});
                await browser.storage.session.remove("connection");
                lock();
                setConnection(undefined);
                setProfile(undefined);
              })
            }
          >
            Disconnect extension
          </button>
        </>
      ) : (
        <>
          <label>
            Search credentials
            <input
              placeholder="Name or username"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          {cards
            .filter((c) =>
              [c.site, c.username]
                .join(" ")
                .toLowerCase()
                .includes(query.toLowerCase()),
            )
            .map((c) => (
              <div className="entry" key={c.id}>
                <div>
                  <strong>{c.site}</strong>
                  <small>{c.username}</small>
                </div>
                <button
                  disabled={busy}
                  onClick={() => act(() => autofill(c.id))}
                >
                  Fill
                </button>
              </div>
            ))}
          <p className="note">
            Explicit fill only. Exact origin match. No automatic submission.
            Locks when closed or hidden.
          </p>
        </>
      )}
    </main>
  );
}
createRoot(document.getElementById("root")!).render(<Popup />);
