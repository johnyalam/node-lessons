// HTTP layer only: read the request, call the service, send the response.
import { Router } from "express";
import type { Request } from "express";
import * as service from "../services/devices.js";
import { bearerToken, parseCommand, parseKeepAlive, parseRegister } from "../validation.js";
import { HttpError } from "../errors.js";

const router = Router();

// req.params values may be undefined under noUncheckedIndexedAccess
function idParam(req: Request): string {
  const id = req.params.id;
  if (typeof id !== "string" || !id) throw new HttpError(400, "Missing device id");
  return id;
}

// GET /devices?siteId=14
router.get("/", async (req, res) => {
  const { siteId } = req.query; // string | string[] | ... | undefined
  let filter: number | undefined;

  if (typeof siteId === "string") {
    filter = Number(siteId);
    if (Number.isNaN(filter)) throw new HttpError(400, "siteId must be a number");
  }

  res.json(await service.listDevices(filter));
});

// GET /devices/stats  (fixed paths before /:id)
router.get("/stats", async (_req, res) => {
  res.json(await service.getStats());
});

// POST /devices/register
router.post("/register", async (req, res) => {
  const input = parseRegister(req.body);
  res.status(201).json(await service.registerDevice(input));
});

// GET /devices/:id
router.get("/:id", async (req, res) => {
  res.json(await service.getDevice(idParam(req)));
});

// DELETE /devices/:id
router.delete("/:id", async (req, res) => {
  await service.deleteDevice(idParam(req));
  res.sendStatus(204);
});

// POST /devices/:id/keepalive   (tablet → server)
router.post("/:id/keepalive", async (req, res) => {
  const token = bearerToken(req.get("authorization"));
  const input = parseKeepAlive(req.body);
  res.json(await service.keepAlive(idParam(req), token, input));
});

// POST /devices/:id/commands  { "type": "LOCK" }   (admin → server)
router.post("/:id/commands", async (req, res) => {
  const type = parseCommand(req.body);
  res.status(201).json(await service.queueCommand(idParam(req), type));
});

export default router;
