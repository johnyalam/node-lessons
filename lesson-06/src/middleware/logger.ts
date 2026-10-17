import type { RequestHandler } from "express";

// RequestHandler gives req, res and next their types automatically
export const logger: RequestHandler = (req, res, next) => {
  const started = Date.now();

  res.on("finish", () => {
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - started} ms)`);
  });

  next();
};
