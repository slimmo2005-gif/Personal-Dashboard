import path from "node:path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// For GitHub Project Pages set VITE_BASE=/your-repo-name/ in CI or .env.production
const base = process.env.VITE_BASE ?? "/";

export default defineConfig({
  plugins: [react()],
  base,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
