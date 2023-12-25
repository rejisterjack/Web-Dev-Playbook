const ProgressBar = require("progress")

const bar = new ProgressBar("downloading [:bar] :rate/bps :percent :etas", {
  total: 40,
})

const timer = setInterval(() => {
  bar.tick()
  if (bar.complete) {
    clearInterval(timer)
  }
}, 100)
