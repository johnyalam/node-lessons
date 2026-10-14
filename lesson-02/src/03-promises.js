// src/03-promises.js
function fetchDevice(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (id === "bad") reject(new Error("Device not found"));
      else resolve({ id, battery: 87, siteId: 14 });
    }, 500);
  });
}

function fetchPolicy(siteId) {
  return new Promise((resolve) => {
    setTimeout(() => resolve({ siteId, kiosk: true, camera: false }), 300);
  });
}

fetchDevice("tab-001")
  .then((device) => {
    console.log("Device:", device);
    return fetchPolicy(device.siteId);
  })
  .then((policy) => {
    console.log("Policy:", policy);
  })
  .catch((err) => {
    console.error("Failed:", err.message);
  });