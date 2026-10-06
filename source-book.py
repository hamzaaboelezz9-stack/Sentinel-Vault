"""Build a reviewable file inventory and complete source book, excluding runtime secrets."""
from pathlib import Path
import hashlib

ROOT = Path(__file__).resolve().parents[1]
EXCLUDED = {"node_modules", ".git", "build", "releases", ".local-data", "backups", "test-results", "playwright-report", "coverage", "__pycache__"}
SKIP = {".env", "SOURCEBOOK.md", "FILES.md"}

def source_files():
    return sorted(p for p in ROOT.rglob("*") if p.is_file() and not any(part in EXCLUDED for part in p.relative_to(ROOT).parts) and p.name not in SKIP and not p.name.endswith(".log"))

def explain(relative):
    if relative.startswith("apps/api/"):
        return "Implements the bounded, authenticated API or its configuration/database boundary.", "Vault values remain encrypted; authentication metadata is handled separately."
    if relative.startswith("packages/crypto/"):
        return "Implements a local cryptographic operation using native or library primitives.", "Documents key purpose, input limits and mutable-buffer cleanup at the call boundary."
    if relative.startswith("packages/shared/"):
        return "Defines shared format validation or local CSV interoperability.", "Keeps format bounds consistent between clients and the encrypted API."
    if relative.startswith("apps/web/public/vendor/"):
        return "Pinned upstream Argon2 binding/reference WASM asset, shipped locally.", "Provenance, license and byte hashes are listed in THIRD-PARTY.md."
    if relative.startswith("apps/web/"):
        return "Provides the local React vault interface, crypto worker or static application shell.", "Secrets are decrypted only for deliberate local operations; no telemetry is included."
    if relative.startswith("extensions/"):
        return "Builds the independently packaged browser extension and explicit autofill interface.", "Restricts filling to a selected exact-origin top-frame login form without submission."
    if relative.startswith("tests/"):
        return "Verifies real behavior using public synthetic fixtures and isolated test data.", "Does not describe unexecuted checks as an audit or security certification."
    if relative.startswith("deploy/") or relative in {"Dockerfile", "docker-compose.yml", ".dockerignore", ".env.example"}:
        return "Provides deployment configuration with generated operational secrets and explicit trust boundaries.", "Review the deployment guide and run environment-specific release checks before use."
    if relative.startswith("scripts/"):
        return "Provides a reproducible local build, operator command, test fixture server or release packaging step.", "Keeps runtime secrets and unrelated files out of the GitHub source artifact."
    if relative.startswith("docs/") or relative.endswith(".md"):
        return "Documents the actual design, usage, interfaces or verification evidence.", "Distinguishes implemented behavior, operational assumptions and manual release gates."
    return "Defines project configuration, pinned dependencies, licensing or automated repository checks.", "Included in full so the repository can be built and reviewed independently."

def main():
    files = source_files()
    inventory = ["# Complete folder and file inventory", "", "All paths are relative to the repository root. Build outputs and runtime secrets are deliberately excluded.", "", "```text"]
    inventory.extend(str(p.relative_to(ROOT)) for p in files)
    inventory.extend(["docs/FILES.md", "docs/SOURCEBOOK.md", "```", "", "`npm run build` additionally generates `build/api`, `build/web`, `build/extension-chrome` and `build/extension-firefox`. These compiled extension clients are packaged separately under `clients/` in the downloadable release.", ""])
    (ROOT / "docs/FILES.md").write_text("\n".join(inventory), encoding="utf-8")
    files = sorted(files + [ROOT / "docs/FILES.md"])
    lines = ["# Sentinel Vault complete source book", "", "Every authored text file and vendored text asset is reproduced below with its full creation path and two-line explanation. The source book itself is excluded from recursive reproduction. Binary WASM/PNG bytes are included as real files in the repository and identified below by length and SHA-256 rather than corrupting them into a text code fence. All fixtures are synthetic. Runtime dependencies are restored from the complete npm lockfile.", ""]
    languages = {".ts": "typescript", ".tsx": "tsx", ".js": "javascript", ".mjs": "javascript", ".json": "json", ".yml": "yaml", ".sql": "sql", ".html": "html", ".css": "css", ".py": "python", ".sh": "sh", ".md": "markdown"}
    for p in files:
        relative = str(p.relative_to(ROOT))
        one, two = explain(relative)
        lines.extend(["## " + relative, "", "Full creation path: `" + str(p) + "`", "", one + "  ", two, ""])
        data = p.read_bytes()
        try:
            text = data.decode("utf-8")
        except UnicodeDecodeError:
            lines.extend([f"Binary artifact: {len(data)} bytes; SHA-256 `{hashlib.sha256(data).hexdigest()}`.", ""])
            continue
        # Use a longer fence than any fence in the file so nested Markdown remains intact.
        fence = "`" * max(4, max((len(chunk) for chunk in text.split() if set(chunk) == {"`"}), default=3) + 1)
        lines.extend([fence + languages.get(p.suffix, "text"), text.rstrip("\n"), fence, ""])
    (ROOT / "docs/SOURCEBOOK.md").write_text("\n".join(lines), encoding="utf-8")
    print(f"Documented {len(files)} files with complete text and binary hashes.")

if __name__ == "__main__":
    main()
