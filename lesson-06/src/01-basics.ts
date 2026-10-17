// TypeScript syntax, step by step. Run: npm run basics
// Lines marked ❌ are errors; uncomment one and run `npm run typecheck` to see it.

// ---------------------------------------------------------------
// 1. Type annotations and inference
// ---------------------------------------------------------------
const deviceId: string = "tab-001"; // annotated
let battery = 87;                   // inferred as number (like Kotlin)
// battery = "full";                // ❌ Type 'string' is not assignable to type 'number'

// ---------------------------------------------------------------
// 2. Interfaces: the shape of an object (like a Kotlin data class)
// ---------------------------------------------------------------
interface Device {
  id: string;
  model: string;
  battery: number;
  online: boolean;
  siteId?: number;          // optional: number | undefined  (like Int?)
  readonly registeredAt: string; // can't be changed after creation (like val)
}

const tablet: Device = {
  id: deviceId,
  model: "Lenovo M10",
  battery,
  online: true,
  registeredAt: new Date().toISOString(),
};
// tablet.registeredAt = "x";       // ❌ Cannot assign to 'registeredAt' because it is read-only
// const bad: Device = { id: "x" }; // ❌ missing model, battery, online, registeredAt

// ---------------------------------------------------------------
// 3. Functions: parameter and return types
// ---------------------------------------------------------------
function batteryStatus(level: number): "LOW" | "ok" {
  return level < 20 ? "LOW" : "ok";
}

const describe = (d: Device): string =>
  `${d.id} ${d.battery}% [${batteryStatus(d.battery)}]`;

console.log(describe(tablet));
// batteryStatus("87");             // ❌ Argument of type 'string' is not assignable to 'number'

// ---------------------------------------------------------------
// 4. Union and literal types (like a Kotlin sealed class / enum)
// ---------------------------------------------------------------
type Command = "LOCK" | "REBOOT" | "REAPPLY_POLICY";

function send(command: Command): void {
  console.log("Sending", command);
}
send("LOCK");
// send("EXPLODE");                 // ❌ '"EXPLODE"' is not assignable to type 'Command'

// A list of values AND a type from the same source, kept in sync:
const STATUSES = ["online", "offline", "unknown"] as const;
type Status = (typeof STATUSES)[number]; // "online" | "offline" | "unknown"
const s: Status = "online";
console.log("Status:", s, "of", STATUSES.join(", "));

// ---------------------------------------------------------------
// 5. null and optional chaining (null safety, like Kotlin)
// ---------------------------------------------------------------
function lastSeenText(lastSeen: string | null): string {
  // lastSeen.length;               // ❌ 'lastSeen' is possibly 'null'
  return lastSeen ?? "never";       // like Kotlin's ?:
}
console.log("Last seen:", lastSeenText(null), "| site:", tablet.siteId ?? "none");

// ---------------------------------------------------------------
// 6. Arrays and generics
// ---------------------------------------------------------------
const devices: Device[] = [tablet];
const ids: string[] = devices.map((d) => d.id); // types flow through map/filter

// A generic function works with any type T (like Kotlin's <T>)
function first<T>(list: T[]): T | undefined {
  return list[0];
}
const firstDevice = first(devices); // Device | undefined
console.log("First:", firstDevice?.id, "| ids:", ids);

// ---------------------------------------------------------------
// 7. unknown vs any
// ---------------------------------------------------------------
// any     = "turn type checking off"  → avoid
// unknown = "could be anything, check before use" → use for outside data
const body: unknown = JSON.parse('{"battery": 42}');
// body.battery;                    // ❌ 'body' is of type 'unknown'

// Narrowing: after a check, TypeScript knows more (like Kotlin smart casts)
if (typeof body === "object" && body !== null && "battery" in body && typeof body.battery === "number") {
  console.log("Battery from JSON:", body.battery); // now OK
}

// Type guard: a function that tells TypeScript what something is
function isDevice(value: unknown): value is Device {
  return typeof value === "object" && value !== null && "id" in value && "battery" in value;
}
const maybe: unknown = tablet;
if (isDevice(maybe)) console.log("Guarded:", maybe.model);

// ---------------------------------------------------------------
// 8. Utility types: build new types from existing ones
// ---------------------------------------------------------------
type PublicDevice = Omit<Device, "registeredAt">;   // all fields except these
type DeviceUpdate = Partial<Pick<Device, "battery" | "online">>; // some, all optional

const update: DeviceUpdate = { battery: 50 };
const view: PublicDevice = { id: "tab-002", model: "Samsung A8", battery: 50, online: false };
console.log("Update:", update, "| view:", view.id);
