// Business logic, with no Express in it.
// Routes call these functions; so can scripts and tests.
// (Like a Repository/UseCase layer on Android, separate from the UI.)
import { randomUUID } from "node:crypto";
import { loadDevices, saveDevices } from "../store.js";
import { HttpError } from "../errors.js";
import type {
  AdminCommand,
  Command,
  Device,
  DeviceStats,
  KeepAliveInput,
  KeepAliveResult,
  PublicDevice,
  QueueCommandResult,
  RegisterInput,
  RegisterResult,
} from "../types.js";

export const LOW_BATTERY = 20;

// Remove secret fields. The return type guarantees they are gone.
export function toPublic({ token, pendingCommands, ...rest }: Device): PublicDevice {
  return rest;
}

interface FoundDevice {
  devices: Device[];
  index: number;
  device: Device;
}

async function findDevice(id: string): Promise<FoundDevice> {
  const devices = await loadDevices();
  const index = devices.findIndex((d) => d.id === id);
  const device = devices[index]; // Device | undefined (noUncheckedIndexedAccess)
  if (!device) throw new HttpError(404, "Device not found");
  return { devices, index, device }; // here device is Device
}

export async function listDevices(siteId?: number): Promise<PublicDevice[]> {
  const devices = await loadDevices();
  const filtered = siteId === undefined ? devices : devices.filter((d) => d.siteId === siteId);
  return filtered.map(toPublic);
}

export async function getDevice(id: string): Promise<PublicDevice> {
  const { device } = await findDevice(id);
  return toPublic(device);
}

export async function getStats(): Promise<DeviceStats> {
  const devices = await loadDevices();
  return {
    total: devices.length,
    online: devices.filter((d) => d.online).length,
    lowBattery: devices.filter((d) => d.battery !== null && d.battery < LOW_BATTERY).length,
  };
}

export async function registerDevice(input: RegisterInput): Promise<RegisterResult> {
  const device: Device = {
    id: `tab-${randomUUID().slice(0, 8)}`,
    token: randomUUID(),
    model: input.model,
    siteId: input.siteId,
    battery: null,
    online: false,
    lastSeen: null,
    pendingCommands: [],
    registeredAt: new Date().toISOString(),
  };

  const devices = await loadDevices();
  await saveDevices([...devices, device]);
  return { id: device.id, token: device.token };
}

export async function keepAlive(
  id: string,
  token: string | undefined,
  input: KeepAliveInput,
): Promise<KeepAliveResult> {
  const { devices, index, device } = await findDevice(id);
  if (token !== device.token) throw new HttpError(401, "Invalid token");

  // Deliver queued commands once, then clear the queue
  const commands: Command[] = [...device.pendingCommands];
  if (input.battery < LOW_BATTERY) commands.push("SHOW_CHARGE_WARNING");

  devices[index] = {
    ...device,
    battery: input.battery,
    online: true,
    lastSeen: new Date().toISOString(),
    pendingCommands: [],
  };
  await saveDevices(devices);

  return { commands };
}

export async function queueCommand(id: string, type: AdminCommand): Promise<QueueCommandResult> {
  const { devices, index, device } = await findDevice(id);
  const pending = [...device.pendingCommands, type];
  devices[index] = { ...device, pendingCommands: pending };
  await saveDevices(devices);
  return { queued: type, pending };
}

export async function deleteDevice(id: string): Promise<void> {
  const { devices, index } = await findDevice(id);
  await saveDevices(devices.filter((_, i) => i !== index));
}
