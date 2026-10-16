// A JSON file used as a tiny "database".
// Lesson 7 replaces this file with a real database; server.js won't change.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(import.meta.dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "devices.json");

export async function loadDevices() {
  try {
    const text = await readFile(DATA_FILE, "utf8");
    return JSON.parse(text);
  } catch (err) {
    if (err.code === "ENOENT") return []; // no file yet = no devices
    throw err;                            // anything else is a real problem
  }
}

export async function saveDevices(devices) {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(devices, null, 2));
}
