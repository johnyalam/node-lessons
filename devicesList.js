// 1. Write devicesBySite(list, siteId) that returns only devices for that site.
// 2. Write markOffline(device) that returns a new object with online: false, without changing the original (hint: spread).
// 3. Print the IDs of all devices with low battery, comma-separated (hint: filter, map, join(", ")).


const devices = [
  { id: "tab-001", model: "Lenovo M10", battery: 87, online: true,  siteId: 14 },
  { id: "tab-002", model: "Lenovo M10", battery: 12, online: true,  siteId: 14 },
  { id: "tab-003", model: "Samsung A8", battery: 55, online: false, siteId: 7  },
  { id: "tab-004", model: "Samsung A8", battery: 5,  online: true,  siteId: 7  },
];

const batteryStatus = (level) => {
  level < 20 ? "Low battery" : "Battery is ok";
}

const devicesBySite = (list, siteId)=> {
  return list.filter(device => device.siteId === siteId)
}

const markOffline = (device) => ({...device, online: false});


const lowBatteryIds = (list) => {
  return list
         .filter((device) => device.battery < 20)
         .map((device) => device.id)
         .join(", ")
}

function summary(list) {
  const online = list.filter(device => device.online).length;
  const avg = list.reduce((total, device) => total + device.battery, 0) / list.length;
  return `Online devices: ${online}, Average battery: ${avg.toFixed(2)}%`;
}


console.log("--- All devices ---");
for (const { id, battery, online } of devices) {
  console.log(`${id}  ${battery}% [${batteryStatus(battery)}]  ${online ? "online" : "offline"}`);
}

console.log("\n--- Summary ---");
console.log(summary(devices));

console.log("\n--- Exercise 1: site 14 ---");
console.log(devicesBySite(devices, 14));

console.log("\n--- Exercise 2: mark offline ---");
const original = devices[0];
const copy = markOffline(original);
console.log("original online:", original.online); // true
console.log("copy online:    ", copy.online);     // false

// Mark every low-battery device offline, as NEW objects
const offlineCopies = devices.filter((d) => d.battery < 20).map(markOffline);
console.log(offlineCopies);

console.log("\n--- Exercise 3: low battery ---");
console.log(`Low battery: ${lowBatteryIds(devices)}`);

console.log("\n--- Check: models of offline devices ---");
console.log(devices.filter((d) => !d.online).map((d) => d.model).join(" | "));