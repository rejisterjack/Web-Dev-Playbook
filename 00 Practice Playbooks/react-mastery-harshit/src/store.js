import { configureStore } from '@reduxjs/toolkit'
import counterSlice from './features/counterSlice'
import todoSlice from './features/todoSlice'

export const store = configureStore({
  reducer: {
    [counterSlice.reducerPath]: counterSlice.reducer,
    [todoSlice.reducerPath]: todoSlice.reducer,
  },
})
