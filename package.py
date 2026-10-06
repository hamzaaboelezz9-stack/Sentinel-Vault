"""Produce a GitHub source ZIP with independently built clients, never runtime secrets."""
from pathlib import Path
import hashlib
import zipfile
import importlib.util

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("source_book", ROOT / "scripts/source-book.py")
book = importlib.util.module_from_spec(spec)
spec.loader.exec_module(book)
book.main()
destination = ROOT / "releases"
destination.mkdir(exist_ok=True)
artifact = destination / "sentinel-vault-github.zip"
files = book.source_files() + [ROOT / "docs/FILES.md", ROOT / "docs/SOURCEBOOK.md"]
with zipfile.ZipFile(artifact, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
    for file in sorted(set(files)):
        archive.write(file, "sentinel-vault/" + str(file.relative_to(ROOT)))
    for browser in ("chrome", "firefox"):
        client = ROOT / f"build/extension-{browser}"
        if not (client / "manifest.json").is_file():
            raise RuntimeError("Build the complete clients before packaging.")
        for file in sorted(client.rglob("*")):
            if file.is_file():
                archive.write(file, "sentinel-vault/clients/" + browser + "/" + str(file.relative_to(client)))
digest = hashlib.sha256(artifact.read_bytes()).hexdigest()
(destination / "sentinel-vault-github.sha256").write_text(digest + "  " + artifact.name + "\n")
print(f"Created {artifact} ({artifact.stat().st_size} bytes), SHA-256 {digest}")
