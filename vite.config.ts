import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// For GitHub Project Pages set VITE_BASE=/your-repo-name/ in CI or .env.production
const base = process.env.VITE_BASE ?? "/";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "gh-pages-spa-fallback",
      closeBundle() {
        const dist = path.resolve(__dirname, "dist");
        const index = path.join(dist, "index.html");
        if (fs.existsSync(index)) fs.copyFileSync(index, path.join(dist, "404.html"));
      },
    },
  ],
  base,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
