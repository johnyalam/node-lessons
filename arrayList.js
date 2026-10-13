const devices =[
    {
        id: "12345",
        name: "My Device",
        battery: 87,
        charging: true,
        owner: null,
        model: "Model X",
        siteId: "site123"
    },
    {
        id: "67890",
        name: "Another Device",
        battery: 45,
        charging: false,
        owner: "John Doe",
        model: "Model Y",
        siteId: "site456"
    }
]

const object = {
    id: "12345",
    name: "My Device",
    battery: 87,
    charging: true,
    owner: null,
    model: "Model X",
    siteId: "site123"   
}
devices.push(object); // add object to array

const charging = devices.filter(device => device.charging); // filter array
const id = devices.map(device => device.id); // map array
const lowBattery = devices.find(device => device.battery < 50); // find first element in array
const totalBattery = devices.reduce((total, device) => total + device.battery, 0); // reduce array

for (let device of devices) {
    console.log(`Device ${device.name} has ${device.battery}% battery`);
}