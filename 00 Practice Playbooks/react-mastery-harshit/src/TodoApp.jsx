import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { createTodo } from './features/todoSlice'

const TodoApp = () => {
  const todos = useSelector((state) => state.todos)
  const dispatch = useDispatch()
  const [todo, setTodo] = useState({ title: '', isCompleted: false })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (todo.title.trim()) {
      dispatch(createTodo(todo))
      setTodo({ title: '', isCompleted: false }) // Reset form
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type='checkbox'
          checked={todo.isCompleted}
          onChange={(e) =>
            setTodo((prevTodo) => ({
              ...prevTodo,
              isCompleted: e.target.checked,
            }))
          }
        />
        <input
          type='text'
          value={todo.title}
          onChange={(e) =>
            setTodo((prevTodo) => ({
              ...prevTodo,
              title: e.target.value,
            }))
          }
          placeholder='Enter todo...'
        />
        <button type='submit'>Submit</button>
      </form>
      <div>
        {todos.map((item) => {
          return (
            <div key={item.id}>
              {' '}
              <input type='checkbox' checked={item.isCompleted} readOnly />
              <input type='text' value={item.title} readOnly />
              <button>delete</button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TodoApp
