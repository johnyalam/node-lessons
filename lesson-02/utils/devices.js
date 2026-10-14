import { isLowBattery } from "./battery.js";

export const devicesBySite = (list, siteId) =>
  list.filter((d) => d.siteId === siteId);

export const markOffline = (device) => ({ ...device, online: false });

export const lowBatteryIds = (list) =>
  list.filter(isLowBattery).map((d) => d.id).join(", ");

export function summary(list) {
  const online = list.filter((d) => d.online).length;
  const avg = list.reduce((sum, d) => sum + d.battery, 0) / list.length;
  return { total: list.length, online, avgBattery: Math.round(avg) };
}