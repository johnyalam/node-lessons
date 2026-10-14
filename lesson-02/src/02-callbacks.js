function fetchDevice(id, callback) {
  setTimeout(() => {                       // pretend this is a database call
    if (id === "bad") return callback(new Error("Device not found"));
    callback(null, { id, battery: 87 });
  }, 500);
}

fetchDevice("tab-001", (err, device) => {
  if (err) return console.error(err.message);
  console.log("Got:", device);
});