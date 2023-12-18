const { configureStore } = require("@reduxjs/toolkit")
const cakeReducer = require("../features/cake/cakeSlice")
const icecreamReducer = require("../features/icecream/icecreamSlice")
const reduxLogger = require("redux-logger")

const logger = reduxLogger.createLogger()

const store = configureStore({
  reducer: {
    cake: cakeReducer,
    icecream: icecreamReducer,
  },
  middleware: (defaultMiddleware)=>[...defaultMiddleware(), logger]
})

module.exports = store
