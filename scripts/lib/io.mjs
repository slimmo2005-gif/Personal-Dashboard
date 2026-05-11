import fs from "node:fs/promises";
import path from "node:path";

export async function readJson(filePath) {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw);
}

export async function writeJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const body = `${JSON.stringify(data, null, 2)}\n`;
  await fs.writeFile(filePath, body, "utf8");
}
