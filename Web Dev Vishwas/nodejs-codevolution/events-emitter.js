const eventsEmitter = require("node:events")

const event = new eventsEmitter()

event.on("order", ()=>{
  console.log("order is called")
})

event.on("order", (number)=>{
  console.log(`user has order ${number} items`)
})

event.emit("order", 5)