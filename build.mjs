import { build as viteBuild } from "vite";
import { build as esbuild } from "esbuild";
import {
  readFile,
  writeFile,
  mkdir,
  cp,
  readdir,
  stat,
} from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
await viteBuild({ configFile: "apps/web/vite.config.ts" });
await viteBuild({ configFile: "extensions/browser/vite.config.ts" });
await esbuild({
  entryPoints: ["apps/api/src/main.ts"],
  bundle: true,
  platform: "node",
  target: "node24",
  format: "esm",
  packages: "external",
  outfile: "build/api/main.js",
});
const manifest = {
  manifest_version: 3,
  name: "Sentinel Vault",
  version: "0.1.0",
  description:
    "An independently bundled client for your self-hosted encrypted vault.",
  action: { default_popup: "index.html", default_title: "Sentinel Vault" },
  permissions: ["activeTab", "scripting", "storage"],
  optional_host_permissions: [
    "https://*/*",
    "http://localhost/*",
    "http://127.0.0.1/*",
  ],
  content_security_policy: {
    extension_pages:
      "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; object-src 'none'; style-src 'self'; worker-src 'self'; connect-src https: http://localhost:* http://127.0.0.1:*; base-uri 'none'; form-action 'none'",
  },
};
for (const browser of ["chrome", "firefox"]) {
  const dest = "build/extension-" + browser;
  await cp("build/extension", dest, { recursive: true });
  const value = structuredClone(manifest);
  if (browser === "firefox")
    value.browser_specific_settings = {
      gecko: {
        id: "sentinel-vault@local.invalid",
        strict_min_version: "128.0",
        data_collection_permissions: { required: ["none"] },
      },
    };
  await writeFile(
    dest + "/manifest.json",
    JSON.stringify(value, null, 2) + "\n",
  );
}
async function files(directory, prefix = "") {
  const result = [];
  for (const entry of await readdir(directory)) {
    const relative = path.join(prefix, entry);
    const info = await stat(path.join(directory, entry));
    if (info.isDirectory())
      result.push(...(await files(path.join(directory, entry), relative)));
    else result.push(relative);
  }
  return result;
}
const assets = (await files("build/web"))
  .filter((f) => !f.endsWith("sw.js"))
  .map((f) => "/" + f.replaceAll("\\", "/"));
const digest = createHash("sha256");
for (const asset of assets.sort())
  digest.update(await readFile("build/web" + asset));
const version = digest.digest("hex").slice(0, 16);
// Precache a fixed build allowlist. Neither /api nor arbitrary navigations nor credentials enter CacheStorage.
const sw = `const NAME='sentinel-shell-${version}';const ASSETS=${JSON.stringify(assets)};self.addEventListener('install',e=>e.waitUntil(caches.open(NAME).then(c=>c.addAll(ASSETS))));self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('sentinel-shell-')&&k!==NAME).map(k=>caches.delete(k))))));self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(e.request.method!=='GET'||u.origin!==self.location.origin||u.pathname.startsWith('/api/'))return;const key=u.pathname==='/'?'/index.html':u.pathname;if(!ASSETS.includes(key))return;e.respondWith(caches.open(NAME).then(async c=>(await c.match(key))||fetch(e.request)));});\n`;
await writeFile("build/web/sw.js", sw);
await mkdir("build", { recursive: true });
console.log("Built API, web shell, and independent Chrome/Firefox clients.");
