import { createSlice } from '@reduxjs/toolkit'

const randomId = () => ~~(Math.random() * 100000)

const initialState = [
  {
    id: randomId(),
    title: 'demo todo',
    isCompleted: false,
  },
]

const todoSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    createTodo: (state, action) => {
      const newTodo = {
        id: randomId(),
        title: action.payload,
        isCompleted: false,
      }
      state.push(newTodo)
    },
    updateTodo: (state, action) => {
      const currentTodo = state.find((item) => item.id === action.payload.id)
      currentTodo.title = action.payload.title
      currentTodo.isCompleted = action.payload.isCompleted
    },
    deleteTodo: (state, action) => {
      return state.filter((item) => item.id !== action.payload)
    },
  },
})

export const { deleteTodo, updateTodo, createTodo } = todoSlice.actions
export default todoSlice
