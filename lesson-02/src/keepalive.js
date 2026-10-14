const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const KEEPALIVE_TIMEOUT_MS = 3000;     // offline if silent for 3 s
const lastSeen = new Map();            // deviceId → timestamp (like Kotlin's mutableMapOf)

// Server side: receive a keep-alive
async function handleKeepAlive({ id, battery }) {
  await sleep(50);                     // pretend: save to the database
  lastSeen.set(id, Date.now());
  console.log(`  ← keep-alive ${id} (${battery}%)`);
  return { commands: battery < 20 ? ["SHOW_CHARGE_WARNING"] : [] };
}

// Tablet side: send keep-alives every intervalMs, `count` times
async function simulateTablet(id, intervalMs, count) {
  let battery = 30;
  for (let i = 0; i < count; i++) {
    const response = await handleKeepAlive({ id, battery });
    if (response.commands.length > 0) {
      console.log(`  → ${id} got commands: ${response.commands.join(", ")}`);
    }
    battery -= 6;
    await sleep(intervalMs);
  }
  console.log(`  ✗ ${id} stopped sending`);
}

// Server side: check every second who is online
function startOnlineChecker() {
  return setInterval(() => {
    const now = Date.now();
    const status = [...lastSeen].map(([id, time]) =>
      `${id}: ${now - time < KEEPALIVE_TIMEOUT_MS ? "online" : "OFFLINE"}`
    );
    console.log(`[check] ${status.join(" | ")}`);
  }, 1000);
}

const checker = startOnlineChecker();

await Promise.all([
  simulateTablet("tab-001", 1000, 6),  // runs 6 s
  simulateTablet("tab-002", 1000, 2),  // stops after 2 s, then goes offline
]);

await sleep(2000);       // let the checker notice tab-002 is gone
clearInterval(checker);  // stop the interval, or Node never exits
console.log("Done");