import { configureStore } from "@reduxjs/toolkit"
import cakeReducer from "../features/cake/cakeSlice"
import userReducer from "../features/user/userSlice"
import logger from "redux-logger"

const store = configureStore({
  reducer: {
    cake: cakeReducer,
    user: userReducer,
  },
  middleware: (def) => [...def(), logger],
})

console.log("initial state", store.getState())

export default store
