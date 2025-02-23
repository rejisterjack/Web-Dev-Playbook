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

let quiz = []

db.query("SELECT * FROM capitals", (err, res) => {
  if (err) {
    console.error(err)
    return
  }
  quiz = res.rows
})

let totalCorrect = 0

// Middleware
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.static("public"))

let currentQuestion = {}

// GET home page
app.get("/", async (req, res) => {
  totalCorrect = 0
  await nextQuestion()
  console.log(currentQuestion)
  res.render("index.ejs", { question: currentQuestion })
})

// POST a new post
app.post("/submit", (req, res) => {
  let answer = req.body.answer.trim() || "No answer provided"
  let isCorrect = false
  if (currentQuestion.capital.toLowerCase() === answer.toLowerCase()) {
    totalCorrect++
    console.log(totalCorrect)
    isCorrect = true
  }

  nextQuestion()
  res.render("index.ejs", {
    question: currentQuestion,
    wasCorrect: isCorrect,
    totalScore: totalCorrect,
  })
})

async function nextQuestion() {
  const randomCountry = quiz[Math.floor(Math.random() * quiz.length)]

  currentQuestion = randomCountry
}

db.connect((err) => {
  if (err) {
    console.error("connection error", err.stack)
  } else {
    console.log("Database connected!")
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`)
    })
  }
})
