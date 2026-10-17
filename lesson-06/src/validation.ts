// Turns untrusted request bodies (unknown) into typed values, or throws 400.
// After these functions, the rest of the code can trust the types.
import { HttpError } from "./errors.js";
import { COMMAND_TYPES } from "./types.js";
import type { AdminCommand, KeepAliveInput, RegisterInput } from "./types.js";

type JsonObject = Record<string, unknown>;

function asObject(body: unknown): JsonObject {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new HttpError(400, "Request body must be a JSON object");
  }
  return body as JsonObject;
}

export function parseRegister(body: unknown): RegisterInput {
  const { model, siteId } = asObject(body);

  if (typeof model !== "string" || model.trim() === "") {
    throw new HttpError(400, "model must be a non-empty string");
  }
  if (typeof siteId !== "number" || !Number.isInteger(siteId)) {
    throw new HttpError(400, "siteId must be an integer");
  }
  // Here TypeScript knows: model is string, siteId is number
  return { model: model.trim(), siteId };
}

export function parseKeepAlive(body: unknown): KeepAliveInput {
  const { battery } = asObject(body);

  if (typeof battery !== "number" || battery < 0 || battery > 100) {
    throw new HttpError(400, "battery must be a number from 0 to 100");
  }
  return { battery };
}

// Type guard: narrows a string to the AdminCommand union
export function isAdminCommand(value: unknown): value is AdminCommand {
  return typeof value === "string" && (COMMAND_TYPES as readonly string[]).includes(value);
}

export function parseCommand(body: unknown): AdminCommand {
  const { type } = asObject(body);

  if (!isAdminCommand(type)) {
    throw new HttpError(400, `type must be one of: ${COMMAND_TYPES.join(", ")}`);
  }
  return type;
}

// "Bearer abc123" → "abc123", anything else → undefined
export function bearerToken(header: string | undefined): string | undefined {
  const match = /^Bearer (.+)$/.exec(header ?? "");
  return match?.[1];
}
