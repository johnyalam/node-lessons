const device = {
    id: "12345",
    name: "MyDevice",
    battery: 87,
    charging: true,
    owner: null,
    model: "Model X",
    siteId: undefined,
    site: {
        id: "site123",
        name: "Main Site"
    }
}

console.log(device.model);        // read
device.battery = 80;              // change (allowed even with const!)
console.log(device.site.name);    // nested
console.log(device.owner?.name);  // optional chaining, like Kotlin ?.  → undefined
console.log(device.owner ?? "no owner"); // like Kotlin's ?: