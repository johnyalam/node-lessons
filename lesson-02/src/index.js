import devices from "../data/devices.js";
import { batteryStatus } from "../utils/battery.js";
import { devicesBySite, lowBatteryIds, summary } from "../utils/devices.js";
import dayjs from "dayjs";

for (const { id, battery, online } of devices) {
  console.log(`${id}  ${battery}% [${batteryStatus(battery)}]  ${online ? "online" : "offline"}`);
}

console.log(summary(devices));
console.log("Site 14:", devicesBySite(devices, 14).map((d) => d.id));
console.log(`Low battery: ${lowBatteryIds(devices)}`);


const lastSeen = dayjs().subtract(5, "minute");
console.log(`Last keep-alive: ${lastSeen.format("YYYY-MM-DD HH:mm:ss")}`);