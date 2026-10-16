// Small helpers so server.js stays readable

// An Error that carries an HTTP status code
export class HttpError extends Error {
  constructor(status, message) {
    super(message); // call Error's constructor (like Kotlin's super)
    this.status = status;
  }
}

export function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

// 204 No Content: success, but no body
export function sendEmpty(res, status = 204) {
  res.writeHead(status);
  res.end();
}

// Read the whole request body, then parse it as JSON
export async function readJson(req, maxBytes = 100_000) {
  const chunks = [];
  let size = 0;

  for await (const chunk of req) { // the request is an async stream
    size += chunk.length;
    if (size > maxBytes) throw new HttpError(413, "Body too large");
    chunks.push(chunk);
  }

  const text = Buffer.concat(chunks).toString("utf8");
  if (text === "") return {};

  try {
    return JSON.parse(text);
  } catch {
    throw new HttpError(400, "Invalid JSON");
  }
}
