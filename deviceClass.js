class Device {
    constructor(id, battery) {
        this.id = id;
        this.battery = battery;
    }

    isLowBattery() {
        return this.battery < 20;
    }
} 

const d = new Device("12345", 15);
console.log(d.isLowBattery()); // This will print "true" because the battery is less than 20