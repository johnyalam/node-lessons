// Uses the service layer directly, with no HTTP and no Express.
// Shows that business logic works on its own. Run: npm run demo
import * as service from "./services/devices.js";
import { HttpError } from "./errors.js";

const { id, token } = await service.registerDevice({ model: "Lenovo M10", siteId: 14 });
console.log("Registered:", id);

await service.queueCommand(id, "LOCK");
// await service.queueCommand(id, "EXPLODE"); // ❌ not an AdminCommand: compile error

const first = await service.keepAlive(id, token, { battery: 15 });
console.log("First keep-alive commands:", first.commands);

const second = await service.keepAlive(id, token, { battery: 14 });
console.log("Second keep-alive commands:", second.commands);

console.log("Device:", await service.getDevice(id));
console.log("Stats:", await service.getStats());

try {
  await service.keepAlive(id, "wrong-token", { battery: 50 });
} catch (err) {
  if (err instanceof HttpError) console.log(`Expected failure: ${err.status} ${err.message}`);
  else throw err;
}

await service.deleteDevice(id);
console.log("Deleted:", id);
