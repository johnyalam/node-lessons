// The smallest Express app: compare with 02-hello-server.js from Lesson 4
import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.json({ message: "Hello from Express" });
});

app.get("/devices/:id", (req, res) => {
  // :id in the path → req.params.id
  // ?verbose=true   → req.query.verbose (always a string)
  res.json({ id: req.params.id, verbose: req.query.verbose === "true" });
});

app.listen(3000, () => {
  console.log("Listening on http://localhost:3000  (Ctrl+C to stop)");
});
