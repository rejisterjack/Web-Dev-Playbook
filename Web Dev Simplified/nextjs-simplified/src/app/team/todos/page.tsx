import React from "react"

const getTodos = async () => {
  await new Promise((resolve) => setTimeout(resolve, 2000))
  const todos = await fetch("https://jsonplaceholder.typicode.com/todos").then(
    (res) => res.json()
  )
  return todos
}

const Page = async () => {
    const todos = await getTodos()
  return <div>{
    todos.map((todo: { id: number; title: string }) => (
      <div key={todo.id}>{todo.title}</div>
    ))
  }</div>
}

export default Page
