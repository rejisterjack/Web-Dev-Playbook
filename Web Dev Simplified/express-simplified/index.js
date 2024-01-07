const express = require("express")
const app = express()
const PORT = 8000

app.get("/", (req, res) => {
  res.sendStatus(404)
})

app.listen(PORT, () => {
  console.log("server is running...")
})
