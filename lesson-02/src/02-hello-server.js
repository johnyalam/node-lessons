// The smallest possible HTTP server
import http from "node:http";

const server = http.createServer((req, res) => {
  console.log(req.method, req.url);

  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Hello from EMM server" }));
});

server.listen(3000, () => {
  console.log("Listening on http://localhost:3000  (Ctrl+C to stop)");
});
