import { Router } from "express";
import { randomUUID } from "node:crypto";
import { loadDevices, saveDevices } from "../store.js";
import { HttpError } from "../errors.js";
import { loadDevice, requireDeviceToken } from "../middleware/device.js";

const router = Router();

const ALLOWED_COMMANDS = ["LOCK", "REBOOT", "REAPPLY_POLICY"];

// Never send the token or the command queue in responses
const publicView = ({ token, pendingCommands, ...rest }) => rest;

// GET /devices?siteId=14
router.get("/", async (req, res) => {
  let devices = await loadDevices();
  const { siteId } = req.query;                  // string or undefined
  if (siteId !== undefined) {
    devices = devices.filter((d) => d.siteId === Number(siteId));
  }
  res.json(devices.map(publicView));
});

// POST /devices/register
// Must come BEFORE "/:id" routes, or "register" would be taken as an id
router.post("/register", async (req, res) => {
  const { model, siteId } = req.body ?? {};
  if (typeof model !== "string" || typeof siteId !== "number") {
    throw new HttpError(400, "model (string) and siteId (number) are required");
  }

  const device = {
    id: `tab-${randomUUID().slice(0, 8)}`,
    token: randomUUID(),
    model,
    siteId,
    battery: null,
    online: false,
    lastSeen: null,
    pendingCommands: [],
    registeredAt: new Date().toISOString(),
  };

  const devices = await loadDevices();
  await saveDevices([...devices, device]);
  res.status(201).json({ id: device.id, token: device.token });
});

// GET /devices/:id
router.get("/:id", loadDevice, (req, res) => {
  res.json(publicView(req.device));
});

// DELETE /devices/:id
router.delete("/:id", loadDevice, async (req, res) => {
  await saveDevices(req.devices.filter((_, i) => i !== req.deviceIndex));
  res.sendStatus(204);
});

// POST /devices/:id/keepalive  (tablet → server, needs the token)
router.post("/:id/keepalive", loadDevice, requireDeviceToken, async (req, res) => {
  const { battery } = req.body ?? {};
  if (typeof battery !== "number" || battery < 0 || battery > 100) {
    throw new HttpError(400, "battery must be a number from 0 to 100");
  }

  const { device, devices, deviceIndex } = req;

  // Deliver queued commands once, then clear the queue
  const commands = [...(device.pendingCommands ?? [])];
  if (battery < 20) commands.push("SHOW_CHARGE_WARNING");

  devices[deviceIndex] = {
    ...device,
    battery,
    online: true,
    lastSeen: new Date().toISOString(),
    pendingCommands: [],
  };
  await saveDevices(devices);

  res.json({ commands });
});

// POST /devices/:id/commands  { "type": "LOCK" }  (admin → server)
router.post("/:id/commands", loadDevice, async (req, res) => {
  const { type } = req.body ?? {};
  if (!ALLOWED_COMMANDS.includes(type)) {
    throw new HttpError(400, `type must be one of: ${ALLOWED_COMMANDS.join(", ")}`);
  }

  const { device, devices, deviceIndex } = req;
  const pendingCommands = [...(device.pendingCommands ?? []), type];
  devices[deviceIndex] = { ...device, pendingCommands };
  await saveDevices(devices);

  res.status(201).json({ queued: type, pending: pendingCommands });
});

export default router;
