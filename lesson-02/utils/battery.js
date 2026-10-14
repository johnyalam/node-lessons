export const LOW_BATTERY = 20;

export const isLowBattery = (device) => device.battery < LOW_BATTERY;

export const batteryStatus = (level) => (level < LOW_BATTERY ? "LOW" : "ok");