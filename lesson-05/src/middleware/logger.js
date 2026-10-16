// Logs every request after the response has been sent
export function logger(req, res, next) {
  const started = Date.now();

  res.on("finish", () => {
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - started} ms)`);
  });

  next(); // hand over to the next middleware / route
}
