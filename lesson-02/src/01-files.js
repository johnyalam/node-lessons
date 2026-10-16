// Reading and writing files with node:fs/promises
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

// The folder this file is in (ES modules version of __dirname)
console.log("This file is in:", import.meta.dirname);

// Build paths with path.join, never with "/" by hand (works on Windows too)
const dataDir = path.join(import.meta.dirname, "..", "data");
const file = path.join(dataDir, "example.json");

const policy = { siteId: 14, kiosk: true, camera: false };

await mkdir(dataDir, { recursive: true });               // create folder if missing
await writeFile(file, JSON.stringify(policy, null, 2));  // object → text → file
console.log("Wrote:", file);

const text = await readFile(file, "utf8");               // file → text
const loaded = JSON.parse(text);                         // text → object
console.log("Kiosk enabled:", loaded.kiosk);

// A missing file throws an error with code "ENOENT"
try {
  await readFile(path.join(dataDir, "missing.json"), "utf8");
} catch (err) {
  console.log("Missing file error code:", err.code);
}
