import React from "react"
const getTodo = async (id) => {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/todos/${id}`
  ).then((res) => res.json())
  return response
}
const TodoId = async ({ params }) => {
  const todo = await getTodo(params.id)
  return (
    <div>
      <h1>{todo.title}</h1>
    </div>
  )
}

export default TodoId
