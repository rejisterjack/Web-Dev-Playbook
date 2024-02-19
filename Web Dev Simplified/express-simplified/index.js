const express = require("express")
const app = express()

app.set("view engine", "ejs")
const userRouter = require("./routes/users")

app.use("/users", userRouter)
app.use(express.static("public"))

app.get("/", (req, res) => {
  res.render("index", { text: "World New" })
})

app.listen(8000, () => {
  console.log("server is running...")
})

