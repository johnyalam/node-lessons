// A fake tablet that plays the role of the Android app.
// Start the server first (npm run server), then run: npm run tablet
const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(BASE_URL + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(5000), // give up after 5 s
  });

  if (res.status === 204) return null; // no body to parse
  const data = await res.json();
  if (!res.ok) throw new Error(`${res.status}: ${data.error}`);
  return data;
}

// 1. Register (also checks the server is up)
let id, token;
try {
  ({ id, token } = await api("/devices/register", {
    method: "POST",
    body: { model: "Lenovo M10", siteId: 14 },
  }));
} catch (err) {
  if (err.cause?.code !== "ECONNREFUSED") throw err;
  console.error(`Server not reachable at ${BASE_URL}. Run \`npm run server\` first.`);
  process.exit(1);
}
console.log("Registered as", id);
console.log(`Send it a command while it runs:
  curl -X POST ${BASE_URL}/devices/${id}/commands -H "Content-Type: application/json" -d '{"type":"LOCK"}'\n`);

// 2. Keep-alives with dropping battery (8 × 2 s = time to send a command)
let battery = 40;
for (let i = 0; i < 8; i++) {
  const { commands } = await api(`/devices/${id}/keepalive`, {
    method: "POST",
    token,
    body: { battery },
  });
  console.log(`keep-alive ${battery}% → commands: [${commands.join(", ")}]`);
  battery -= 5;
  await sleep(2000);
}

// 3. Read it back (no token in the response)
console.log("\nDevice now:", await api(`/devices/${id}`));

// 4. Expected failures
for (const [label, call] of [
  ["wrong token", () => api(`/devices/${id}/keepalive`, { method: "POST", token: "wrong", body: { battery: 5 } })],
  ["bad battery", () => api(`/devices/${id}/keepalive`, { method: "POST", token, body: { battery: 250 } })],
  ["bad command", () => api(`/devices/${id}/commands`, { method: "POST", body: { type: "EXPLODE" } })],
]) {
  try {
    await call();
  } catch (err) {
    console.log(`Expected failure (${label}):`, err.message);
  }
}

// 5. Clean up: delete the device
await api(`/devices/${id}`, { method: "DELETE" });
console.log(`\nDeleted ${id}`);
