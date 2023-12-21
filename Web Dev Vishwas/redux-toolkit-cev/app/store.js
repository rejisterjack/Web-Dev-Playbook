const { configureStore } = require("@reduxjs/toolkit")
const { cakeReducer } = require("../features/cakeSlice")
const { default: logger } = require("redux-logger")
const { userReducer } = require("../features/userSlice")

const store = configureStore({
  reducer: {
    cake: cakeReducer,
    user: userReducer,
  },
  middleware: (def) => [...def(), logger],
})

module.exports.store = store
