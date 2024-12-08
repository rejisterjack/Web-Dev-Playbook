import express from "express"
import bodyParser from "body-parser"
import pg from "pg"

const app = express()
const port = 8000

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "8082",
  port: 5432,
})

db.connect()

app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))

app.get("/", async (req, res) => {
  //Write your code here.
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
