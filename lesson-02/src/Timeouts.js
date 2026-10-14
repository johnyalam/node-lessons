function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Timed out after ${ms} ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

try {
  await withTimeout(pingDevice("tab-001"), 200);   // ping takes 500 ms
} catch (err) {
  console.error(err.message);                      // Timed out after 200 ms
}