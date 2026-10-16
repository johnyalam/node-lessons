import { loadDevices } from "../store.js";
import { HttpError } from "../errors.js";

// Finds the device from :id and puts it on req, or throws 404.
// Any route with :id can use it, so the lookup is written once.
export async function loadDevice(req, res, next) {
  const devices = await loadDevices();
  const index = devices.findIndex((d) => d.id === req.params.id);
  if (index === -1) throw new HttpError(404, "Device not found");

  req.devices = devices;
  req.deviceIndex = index;
  req.device = devices[index];
  next();
}

// Checks "Authorization: Bearer <token>". Must run AFTER loadDevice.
export function requireDeviceToken(req, res, next) {
  if (req.get("authorization") !== `Bearer ${req.device.token}`) {
    throw new HttpError(401, "Invalid token");
  }
  next();
}
