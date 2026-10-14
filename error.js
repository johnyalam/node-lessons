function parseBattery(value){
    const n = Number(value);
    if(Number.isNaN(n)) throw new Error("Invalid battery value");
    return n;
}

try {
    const battery = parseBattery("87");
    console.log(`Battery value is: ${battery}`);
} catch (error) {
    console.error(error.message);
}

try {
    const battery = parseBattery("invalid");
    console.log(`Battery value is: ${battery}`);
} catch (error) {
    console.error(error.message);
}