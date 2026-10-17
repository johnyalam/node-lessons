// Shared types for the EMM API. The tablet client imports these too,
// like a shared Kotlin module with data classes.

// The list of admin commands AND the type come from one source
export const COMMAND_TYPES = ["LOCK", "REBOOT", "REAPPLY_POLICY"] as const;
export type AdminCommand = (typeof COMMAND_TYPES)[number];

// What a tablet can receive: admin commands plus server-generated ones
export type Command = AdminCommand | "SHOW_CHARGE_WARNING";

export interface Device {
  id: string;
  token: string;
  model: string;
  siteId: number;
  battery: number | null;   // null until the first keep-alive
  online: boolean;
  lastSeen: string | null;  // ISO date string
  pendingCommands: AdminCommand[];
  registeredAt: string;
}

// What the API returns: never the token or the command queue
export type PublicDevice = Omit<Device, "token" | "pendingCommands">;

// Request bodies (after validation)
export interface RegisterInput {
  model: string;
  siteId: number;
}

export interface KeepAliveInput {
  battery: number;
}

// Response bodies
export interface RegisterResult {
  id: string;
  token: string;
}

export interface KeepAliveResult {
  commands: Command[];
}

export interface QueueCommandResult {
  queued: AdminCommand;
  pending: AdminCommand[];
}

export interface DeviceStats {
  total: number;
  online: number;
  lowBattery: number;
}

export interface ErrorBody {
  error: string;
}
