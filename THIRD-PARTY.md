# Third-party components and vendored integrity

Runtime versions/integrities are locked in `package-lock.json`. No third-party executable CDN assets are loaded. Each component retains its upstream license; the MIT project license does not replace those licenses.

## Browser Argon2 audit exception

Pinned npm package: **argon2-browser 1.18.0** ([upstream](https://github.com/antelle/argon2-browser)). Its upstream Argon2 reference submodule is documented at revision `16d3df6` in that release. The JS binding and build configuration are not asserted independently audited. Development use was explicitly approved; independent implementation/provenance review remains a production release gate. These files are copied byte-for-byte from the pinned package and served locally; our separate disposable-worker wrapper is application code.

| Shipped file | Upstream package path | SHA-256 |
|---|---|---|
| `argon2-api.js` | `argon2-browser/lib/argon2.js` | `ecfe330a8f3c6d491b92197391088f117ab13ad13c784cb01235a1afb5757a3b` |
| `argon2.js` | `argon2-browser/dist/argon2.js` | `cdb6ef704dbc287ffa0056376d9af297c8691ddeb985f9137b96fc9b0ddea8b0` |
| `argon2.wasm` | `argon2-browser/dist/argon2.wasm` | `0c2149886c13e4eae4a6ca25ee71d47423c5c8740a874cf04ff816d1b2c901d7` |
| `ARGON2-LICENSE.txt` | `argon2-browser/LICENSE` | `524a1d77701975a063a590424637abbd7fa519042a113f2bbe2eaf4cde76296d` |

## Principal runtime components

| Component | Role | Upstream license |
|---|---|---|
| `@fastify/cookie 11.0.2` | Client/API runtime | MIT |
| `@fastify/helmet 13.0.2` | Client/API runtime | MIT |
| `@fastify/static 10.1.5` | Client/API runtime | MIT |
| `@fastify/swagger 9.5.1` | Client/API runtime | MIT |
| `@scure/bip39 2.4.0` | Static 2048-word English list only | MIT |
| `@simplewebauthn/browser 14.0.0` | Passkey browser ceremonies | MIT |
| `@simplewebauthn/server 14.0.3` | Server WebAuthn verification | MIT |
| `argon2-browser 1.18.0` | Reference Argon2 WASM binding | MIT |
| `fastify 5.12.5` | Client/API runtime | MIT |
| `libsodium-wrappers-sumo 0.8.4` | Authenticated X25519 boxes / native library comparisons | ISC |
| `otpauth 9.4.1` | Client/API runtime | MIT |
| `papaparse 5.5.3` | Client/API runtime | MIT |
| `pg 8.16.3` | Client/API runtime | MIT |
| `react 19.3.0` | Client/API runtime | MIT |
| `react-dom 19.3.0` | Client/API runtime | MIT |
| `zod 4.1.13` | Client/API runtime | MIT |
| `zxcvbn 4.4.2` | Local dictionary / pattern guess model | MIT |

The full transitive dependency tree is installable from the lockfile. `npm ci --ignore-scripts` avoids dependency lifecycle scripts. Native optional platform packages are supplied by npm; builds must be tested on the target platform. Dev dependencies provide TypeScript, Vitest, PGlite, Playwright and packaging/build tools, never production telemetry. Browser tests use a separate scratch-only Chromium distribution that is not included as a project dependency.
