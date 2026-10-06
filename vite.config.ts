import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
export default defineConfig({
  root: fileURLToPath(new URL(".", import.meta.url)),
  publicDir: "../../apps/web/public",
  build: {
    outDir: "../../build/extension",
    emptyOutDir: true,
    target: "es2022",
  },
  worker: { format: "es" },
});
