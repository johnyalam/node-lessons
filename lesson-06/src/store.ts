// JSON file "database", now typed. Lesson 7 replaces this with a real database.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { Device } from "./types.js";

const DATA_DIR = process.env.DATA_DIR ?? path.join(import.meta.dirname, "..", "data");
const DATA_FILE = path.join(DATA_DIR, "devices.json");

// Type guard: is this a Node.js system error with a `code` like "ENOENT"?
function isNodeError(err: unknown): err is NodeJS.ErrnoException {
  return err instanceof Error && "code" in err;
}

export async function loadDevices(): Promise<Device[]> {
  try {
    const text = await readFile(DATA_FILE, "utf8");
    // JSON.parse returns `any`. We wrote this file ourselves, so we trust its shape.
    return JSON.parse(text) as Device[];
  } catch (err) {
    // In TypeScript, a caught error is `unknown`: check before using it
    if (isNodeError(err) && err.code === "ENOENT") return [];
    throw err;
  }
}

export async function saveDevices(devices: Device[]): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(DATA_FILE, JSON.stringify(devices, null, 2));
}
