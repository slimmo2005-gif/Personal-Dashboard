/**
 * Run all fetch scripts sequentially. Add new modules here as you grow the pipeline.
 */
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function runNode(scriptName) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(__dirname, scriptName)], {
      stdio: "inherit",
      env: process.env,
    });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${scriptName} exited with ${code}`));
    });
  });
}

await runNode("fetch-finance.mjs");
await runNode("fetch-macro.mjs");
await runNode("fetch-news.mjs");

console.log("[fetch-all] complete");
