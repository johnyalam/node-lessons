const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function pingDevice(id) {
  await sleep(1000);              // each ping takes 1 second
  return { id, online: true };
}

const ids = ["tab-001", "tab-002", "tab-003"];

// ❌ Sequential: 3 seconds
console.time("sequential");
for (const id of ids) {
  await pingDevice(id);
}
console.timeEnd("sequential");

// ✅ Parallel: about 1 second
console.time("parallel");
const results = await Promise.all(ids.map((id) => pingDevice(id)));
console.timeEnd("parallel");
console.log(results);