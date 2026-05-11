import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Repo root (…/Dashboard) */
export const repoRoot = path.resolve(__dirname, "..", "..");

/** JSON artifacts consumed by the static site */
export const publicDataDir = path.join(repoRoot, "public", "data");
