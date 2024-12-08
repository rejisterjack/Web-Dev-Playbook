import express from "express"
import bodyParser from "body-parser"

const app = express()

app.use(bodyParser.json())

app.all("/", (req, res) => {
  console.log("Request received", req)
  res.send("Hello World")
})

const todos = [
  { id: 1, title: "Learn JavaScript", completed: false },
  { id: 2, title: "Learn React", completed: false },
  { id: 3, title: "Build a project", completed: false },
]

app.get("/todos", (req, res) => {
  res.json(todos)
})

app.get("/todos/:id", (req, res) => {
  const todo = todos.find((t) => t.id === parseInt(req.params.id))
  if (!todo) return res.status(404).send("Todo not found")
  res.json(todo)
})

app.post("/todos", (req, res) => {
  const newTodo = {
    id: todos.length + 1,
    title: req.body.title,
    completed: req.body.completed || false,
  }
  todos.push(newTodo)
  res.status(201).json(newTodo)
})

app.put("/todos/:id", (req, res) => {
  const todo = todos.find((t) => t.id === parseInt(req.params.id))
  if (!todo) return res.status(404).send("Todo not found")

  todo.title = req.body.title || todo.title
  todo.completed =
    req.body.completed !== undefined ? req.body.completed : todo.completed

  res.json(todo)
})

app.delete("/todos/:id", (req, res) => {
  const todoIndex = todos.findIndex((t) => t.id === parseInt(req.params.id))
  if (todoIndex === -1) return res.status(404).send("Todo not found")

  const deletedTodo = todos.splice(todoIndex, 1)
  res.json(deletedTodo)
})

const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
