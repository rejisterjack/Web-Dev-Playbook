import { Suspense } from "react"

async function fetchData() {
  await wait(2000)
  // throw new Error("hew error")
  return fetch("https://jsonplaceholder.typicode.com/todos").then((res) =>
    res.json()
  )
}

export default function Home() {
  return (
    <h1>
      <p>Home</p>
      <Suspense fallback={"loading..."}>
        <TodoList />
      </Suspense>
    </h1>
  )
}

export async function TodoList() {
  const todos = await fetchData()
  return <p>{todos?.length}</p>
}

async function wait(duration: number) {
  return new Promise((resolve) => setTimeout(resolve, duration))
}
