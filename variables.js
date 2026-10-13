const deviceId = "12345";
let deviceName = "MyDevice";
console.log(deviceId); // This will print "12345"
console.log(deviceName); // This will print "MyDevice"

deviceName = "NewDeviceName"; // This is allowed because deviceName is declared with let
console.log(deviceName); // This will print "NewDeviceName"

let x = 10;
console.log(x); // This will print "10"
x = "Hello 10"; // This is allowed because x is declared with let and can be reassigned to a different type
console.log(x); // This will print "Hello 10"

const name = "Tablet A";        // string
const battery = 87;             // number
const charging = true;          // boolean
const owner = null;             // "intentionally empty"
let siteId;                     // undefined = "never set"

console.log(`Device ${name} has ${battery}% battery`);
