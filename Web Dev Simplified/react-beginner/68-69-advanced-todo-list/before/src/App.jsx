import { useReducer, useState } from "react"
import "./styles.css"
import { TodoItem } from "./TodoItem"

const localStorageKey = "todos"

const reducer = (state, action) => {
  switch (action.type) {
    case "add":
      return [
        ...state,
        { name: action.name, completed: false, id: crypto.randomUUID() },
      ]
    case "toggle":
      return state.map((todo) => {
        if (todo.id === action.id)
          return { ...todo, completed: action.completed }

        return todo
      })
    case "delete":
      return state.filter((todo) => todo.id !== action.id)
    default:
      return state
  }
}

function App() {
  const [newTodoName, setNewTodoName] = useState("")
  const [todos, setTodos] = useReducer(reducer, [], (initialValue) => {
    const savedTodos = localStorage.getItem(localStorageKey)
    if (savedTodos) return JSON.parse(savedTodos)
    return initialValue
  })

  // Save todos to local storage
  useState(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(todos))
  }, [todos])

  function addNewTodo() {
    if (newTodoName === "") return

    setTodos((currentTodos) => {
      return [
        ...currentTodos,
        { name: newTodoName, completed: false, id: crypto.randomUUID() },
      ]
    })
    setNewTodoName("")
  }

  function toggleTodo(todoId, completed) {
    setTodos((currentTodos) => {
      return currentTodos.map((todo) => {
        if (todo.id === todoId) return { ...todo, completed }

        return todo
      })
    })
  }

  function deleteTodo(todoId) {
    setTodos((currentTodos) => {
      return currentTodos.filter((todo) => todo.id !== todoId)
    })
  }

  return (
    <>
      <ul id="list">
        {todos.map((todo) => {
          return (
            <TodoItem
              key={todo.id}
              {...todo}
              toggleTodo={toggleTodo}
              deleteTodo={deleteTodo}
            />
          )
        })}
      </ul>

      <div id="new-todo-form">
        <label htmlFor="todo-input">New Todo</label>
        <input
          type="text"
          id="todo-input"
          value={newTodoName}
          onChange={(e) => setNewTodoName(e.target.value)}
        />
        <button onClick={addNewTodo}>Add Todo</button>
      </div>
    </>
  )
}

export default App
