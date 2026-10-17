import type { ErrorRequestHandler, RequestHandler } from "express";
import { HttpError } from "../errors.js";
import type { ErrorBody } from "../types.js";

export const notFound: RequestHandler = (req, _res, next) => {
  next(new HttpError(404, `No route for ${req.method} ${req.path}`));
};

// Errors can be anything (unknown), so we check before reading fields
function statusOf(err: unknown): number {
  if (err instanceof HttpError) return err.status;
  // express.json() errors: { status: 400, type: "entity.parse.failed" } etc.
  if (typeof err === "object" && err !== null && "status" in err && typeof err.status === "number") {
    return err.status;
  }
  return 500;
}

function isJsonParseError(err: unknown): boolean {
  return typeof err === "object" && err !== null && "type" in err && err.type === "entity.parse.failed";
}

// Still needs FOUR parameters so Express treats it as the error handler
export const errorHandler: ErrorRequestHandler = (err: unknown, _req, res, _next) => {
  const status = statusOf(err);
  if (status >= 500) console.error(err);

  let message = err instanceof Error ? err.message : "Unknown error";
  if (isJsonParseError(err)) message = "Invalid JSON";
  if (status >= 500) message = "Internal server error";

  const body: ErrorBody = { error: message };
  res.status(status).json(body);
};
