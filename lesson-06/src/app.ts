import express from "express";
import devicesRouter from "./routes/devices.js";
import { logger } from "./middleware/logger.js";
import { errorHandler, notFound } from "./middleware/errors.js";

const app = express();

app.use(logger);
app.use(express.json({ limit: "100kb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/devices", devicesRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
