const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchDevice(id){
    await sleep(500);
    if (id === "bad") throw new Error("Device not found");
    return {id, battery: 87, siteId: 14};
}

async function fetchPolicy(siteId){
    await sleep(300);
    return {siteId, kiosk: true, camera: false};
}

async function loadDeviceWithPolicy(id){
    try {
        const device = await fetchDevice(id);
        console.log("Device:", device);
        const policy = await fetchPolicy(device.siteId);
        console.log("Policy:", policy);
        return {device, policy};
    } catch (err) {
        console.error("Failed:", err.message);
    }
}

try {
    const result = await loadDeviceWithPolicy("tab-001");
    console.log("Result:", result);
    await loadDeviceWithPolicy("bad");
} catch (err) {
    console.error("Error:", err.message);
}