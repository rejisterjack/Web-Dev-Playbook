const express = require("express")
const app = express()
const port = 8000

app.get("/", (req, res) => {
  res.send("<h1>server home page</h1>")
})

app.get("/users", (req, res) => {
  res.json({ message: "list of all users" })
})

app.get("/user/:id", (req, res) => {
  res.json({ message: "user id is: " + req.params.id })
})

app.post("/posts", (req, res) => {
  res.json({ message: "new post created" })
})

app.put("/post/:id", (req, res) => {
  res.json({ message: "updated post id is: " + req.params.id })
})

app.delete("/post/:id", (req, res) => {
  res.json({ message: "deleted post id is: " + req.params.id })
})

app.listen(port, () => {
  console.log("server is running...")
})
