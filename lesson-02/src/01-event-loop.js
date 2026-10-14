console.log("1. Event Loop Started");

setTimeout(() => {
  console.log("3. Timeout Callback Executed");
},3000);

console.log("2. Event Loop Finished");