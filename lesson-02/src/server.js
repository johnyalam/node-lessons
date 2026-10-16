// EMM API built with only Node's built-in http module.
// Includes the solutions to exercises 1–3 (marked below).
import http from "node:http";
import { randomUUID } from "node:crypto";
import { loadDevices, saveDevices } from "./store.js";
import { sendJson, sendEmpty, readJson, HttpError } from "./http-utils.js";

const PORT = Number(process.env.PORT) || 3000;
const ALLOWED_COMMANDS = ["LOCK", "REBOOT", "REAPPLY_POLICY"];

// Never send secrets back: remove token (and the internal command queue)
const publicView = ({ token, pendingCommands, ...rest }) => rest;

// Find a device or throw 404. Returns the list too, so we can save it.
async function findDevice(id) {
  const devices = await loadDevices();
  const index = devices.findIndex((d) => d.id === id);
  if (index === -1) throw new HttpError(404, "Device not found");
  return { devices, index, device: devices[index] };
}

function requireToken(req, device) {
  if (req.headers.authorization !== `Bearer ${device.token}`) {
    throw new HttpError(401, "Invalid token");
  }
}

async function handle(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const parts = url.pathname.split("/").filter(Boolean);
  // "/devices/tab-1/keepalive" → ["devices", "tab-1", "keepalive"]
  const { method } = req;

  // GET /health
  if (method === "GET" && url.pathname === "/health") {
    return sendJson(res, 200, { status: "ok", time: new Date().toISOString() });
  }

  // GET /devices?siteId=14
  if (method === "GET" && url.pathname === "/devices") {
    let devices = await loadDevices();
    const siteId = url.searchParams.get("siteId"); // string or null
    if (siteId !== null) {
      devices = devices.filter((d) => d.siteId === Number(siteId));
    }
    return sendJson(res, 200, devices.map(publicView));
  }

  // POST /devices/register
  if (method === "POST" && url.pathname === "/devices/register") {
    const body = await readJson(req);
    if (typeof body.model !== "string" || typeof body.siteId !== "number") {
      throw new HttpError(400, "model (string) and siteId (number) are required");
    }

    const device = {
      id: `tab-${randomUUID().slice(0, 8)}`,
      token: randomUUID(),
      model: body.model,
      siteId: body.siteId,
      battery: null,
      online: false,
      lastSeen: null,
      pendingCommands: [],
      registeredAt: new Date().toISOString(),
    };

    const devices = await loadDevices();
    await saveDevices([...devices, device]);
    return sendJson(res, 201, { id: device.id, token: device.token });
  }

  // GET /devices/:id
  if (method === "GET" && parts[0] === "devices" && parts.length === 2) {
    const { device } = await findDevice(parts[1]);
    return sendJson(res, 200, publicView(device));
  }

  // Exercise 2: DELETE /devices/:id → 204
  if (method === "DELETE" && parts[0] === "devices" && parts.length === 2) {
    const { devices, index } = await findDevice(parts[1]);
    await saveDevices(devices.filter((_, i) => i !== index));
    return sendEmpty(res, 204);
  }

  // POST /devices/:id/keepalive
  if (method === "POST" && parts[0] === "devices" && parts[2] === "keepalive" && parts.length === 3) {
    const { devices, index, device } = await findDevice(parts[1]);
    requireToken(req, device);

    const body = await readJson(req);

    // Exercise 1: battery must be a number from 0 to 100
    if (typeof body.battery !== "number" || body.battery < 0 || body.battery > 100) {
      throw new HttpError(400, "battery must be a number from 0 to 100");
    }

    // Exercise 3: deliver pending commands once, then clear them
    const commands = [...(device.pendingCommands ?? [])];
    if (body.battery < 20) commands.push("SHOW_CHARGE_WARNING");

    devices[index] = {
      ...device,
      battery: body.battery,
      online: true,
      lastSeen: new Date().toISOString(),
      pendingCommands: [],
    };
    await saveDevices(devices);

    return sendJson(res, 200, { commands });
  }

  // Exercise 3: POST /devices/:id/commands  { "type": "LOCK" }
  if (method === "POST" && parts[0] === "devices" && parts[2] === "commands" && parts.length === 3) {
    const body = await readJson(req);
    if (!ALLOWED_COMMANDS.includes(body.type)) {
      throw new HttpError(400, `type must be one of: ${ALLOWED_COMMANDS.join(", ")}`);
    }

    const { devices, index, device } = await findDevice(parts[1]);
    const pendingCommands = [...(device.pendingCommands ?? []), body.type];
    devices[index] = { ...device, pendingCommands };
    await saveDevices(devices);

    return sendJson(res, 201, { queued: body.type, pending: pendingCommands });
  }

  throw new HttpError(404, `No route for ${method} ${url.pathname}`);
}

const server = http.createServer(async (req, res) => {
  const started = Date.now();
  try {
    await handle(req, res);
  } catch (err) {
    const status = err instanceof HttpError ? err.status : 500;
    if (status === 500) console.error(err); // log real bugs in full
    sendJson(res, status, {
      error: status === 500 ? "Internal server error" : err.message,
    });
  } finally {
    console.log(`${req.method} ${req.url} → ${res.statusCode} (${Date.now() - started} ms)`);
  }
});

server.listen(PORT, () => {
  console.log(`EMM server running on http://localhost:${PORT}`);
});
