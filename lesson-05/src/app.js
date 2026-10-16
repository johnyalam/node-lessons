// Builds the Express app. Kept separate from server.js (which only listens)
// so tests can use the app without opening a port (Lesson 6+).
import express from "express";
import devicesRouter from "./routes/devices.js";
import { logger } from "./middleware/logger.js";
import { notFound, errorHandler } from "./middleware/errors.js";

const app = express();

// 1. Middleware that runs for every request, in this order
app.use(logger);
app.use(express.json({ limit: "100kb" }));   // parses JSON bodies → req.body

// 2. Routes
app.get("/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/devices", devicesRouter);           // everything under /devices

// 3. Nothing matched → 404, then the error handler (always last)
app.use(notFound);
app.use(errorHandler);

export default app;
