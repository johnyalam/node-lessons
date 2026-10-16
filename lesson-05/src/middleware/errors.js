import { HttpError } from "../errors.js";

// Runs when no route matched
export function notFound(req, res, next) {
  next(new HttpError(404, `No route for ${req.method} ${req.path}`));
}

// Error handler: Express knows it's one because it has FOUR parameters
export function errorHandler(err, req, res, next) {
  // HttpError, or errors from express.json() (invalid JSON → 400, too large → 413)
  const status = err.status ?? 500;

  if (status >= 500) console.error(err); // log real bugs in full

  let message = err.message;
  if (err.type === "entity.parse.failed") message = "Invalid JSON";
  if (status >= 500) message = "Internal server error"; // never leak details

  res.status(status).json({ error: message });
}
