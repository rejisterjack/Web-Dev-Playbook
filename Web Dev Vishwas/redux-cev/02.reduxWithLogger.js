const { applyMiddleware } = require("redux")
const { createStore } = require("redux")
const { createLogger } = require("redux-logger")
const logger = createLogger()
// actions
const CAKE_ORDERED = "CAKE_ORDERED"
const CAKE_RESTOCKED = "CAKE_RESTOCKED"

// action creator
const orderCake = () => {
  return {
    type: CAKE_ORDERED,
    payload: 1,
  }
}

const restockCake = () => {
  return {
    type: CAKE_RESTOCKED,
    payload: 1,
  }
}

// initial state
const initialState = {
  numOfCakes: 10,
}

// reducer
const cakeReducer = (state = initialState, action) => {
  switch (action.type) {
    case CAKE_ORDERED: {
      return { ...state, numOfCakes: state.numOfCakes - action.payload }
    }
    case CAKE_RESTOCKED: {
      return { ...state, numOfCakes: state.numOfCakes + action.payload }
    }
    default:
      return state
  }
}

// create store
const store = createStore(
  cakeReducer,
  applyMiddleware(logger)
)

console.log("initial state", store.getState())
const unsubscribe = store.subscribe(() => {})

store.dispatch(orderCake())
store.dispatch(orderCake())
store.dispatch(orderCake())
store.dispatch(restockCake())

unsubscribe()
