function batteryStatus(level){
    let status = "";
    if(level >= 80){
        status = "Battery is full";
    } else if(level >= 50){
        status = "Battery is medium";
    } else if(level >= 20){
        status = "Battery is low";
    } else {
        status = "Battery is critical";   
    } 
    return status;
}

console.log(batteryStatus(87)); // This will print "Battery is full"