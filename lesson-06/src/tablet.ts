// A typed fake tablet. Start the server first (npm run dev), then: npm run tablet
// It imports the SAME types as the server, so client and server can't drift apart.
import type {
  AdminCommand,
  ErrorBody,
  KeepAliveResult,
  PublicDevice,
  QueueCommandResult,
  RegisterResult,
} from "./types.js";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const INTERVAL_MS = Number(process.env.INTERVAL_MS ?? 2000);
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

interface ApiOptions {
  method?: "GET" | "POST" | "DELETE";
  body?: unknown;
  token?: string;
}

function isErrorBody(data: unknown): data is ErrorBody {
  return typeof data === "object" && data !== null && "error" in data && typeof data.error === "string";
}

// Generic: the caller says what type the response is, e.g. api<RegisterResult>(...)
async function api<T>(path: string, { method = "GET", body, token }: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(BASE_URL + path, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(5000),
  });

  if (res.status === 204) return undefined as T;

  const data: unknown = await res.json();
  if (!res.ok) {
    throw new Error(`${res.status}: ${isErrorBody(data) ? data.error : res.statusText}`);
  }
  // We trust our own server here. (Lesson 8 adds runtime validation with zod.)
  return data as T;
}

const errorMessage = (err: unknown): string => (err instanceof Error ? err.message : String(err));

// 1. Register
const { id, token } = await api<RegisterResult>("/devices/register", {
  method: "POST",
  body: { model: "Lenovo M10", siteId: 14 },
});
console.log("Registered as", id);
console.log(`Send it a command while it runs:
  curl -X POST ${BASE_URL}/devices/${id}/commands -H "Content-Type: application/json" -d '{"type":"LOCK"}'\n`);

// 2. Keep-alives with dropping battery
let battery = 40;
for (let i = 0; i < 8; i++) {
  const { commands } = await api<KeepAliveResult>(`/devices/${id}/keepalive`, {
    method: "POST",
    token,
    body: { battery },
  });
  console.log(`keep-alive ${battery}% → commands: [${commands.join(", ")}]`);
  battery -= 5;
  await sleep(INTERVAL_MS);
}

// 3. Read it back: the type has no token field at all
const device = await api<PublicDevice>(`/devices/${id}`);
console.log("\nDevice now:", device);
// device.token;  // ❌ Property 'token' does not exist on type 'PublicDevice'

// 4. Expected failures
const badCommand = "EXPLODE" as unknown as AdminCommand; // forcing a wrong value on purpose
const failures: [string, () => Promise<unknown>][] = [
  ["wrong token", () => api(`/devices/${id}/keepalive`, { method: "POST", token: "wrong", body: { battery: 5 } })],
  ["bad battery", () => api(`/devices/${id}/keepalive`, { method: "POST", token, body: { battery: 250 } })],
  ["bad command", () => api<QueueCommandResult>(`/devices/${id}/commands`, { method: "POST", body: { type: badCommand } })],
];

for (const [label, call] of failures) {
  try {
    await call();
  } catch (err) {
    console.log(`Expected failure (${label}):`, errorMessage(err));
  }
}

// 5. Clean up
await api<void>(`/devices/${id}`, { method: "DELETE" });
console.log(`\nDeleted ${id}`);
