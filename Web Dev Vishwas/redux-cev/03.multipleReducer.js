const { bindActionCreators } = require("redux")
const { applyMiddleware } = require("redux")
const { createStore } = require("redux")
const { combineReducers } = require("redux")
const { createLogger } = require("redux-logger")
const logger = createLogger()

const CAKE_ORDERED = "CAKE_ORDERED"
const CAKE_RESTOCKED = "CAKE_RESTOCKED"
const ICE_CREAM_ORDERED = "ICE_CREAM_ORDERED"
const ICE_CREAM_RESTOCKED = "ICE_CREAM_RESTOCKED"

const initialState = {
  numOfCakes: 10,
  numOfIceCreams: 20,
}

const orderCake = (qty) => {
  return {
    type: CAKE_ORDERED,
    payload: qty,
  }
}
const restockCake = (qty) => {
  return {
    type: CAKE_RESTOCKED,
    payload: qty,
  }
}
const orcerIceCream = (qty) => {
  return {
    type: ICE_CREAM_ORDERED,
    payload: qty,
  }
}
const restockIceCream = (qty) => {
  return {
    type: ICE_CREAM_RESTOCKED,
    payload: qty,
  }
}

const cakeReducer = (state = initialState, action) => {
  switch (action.type) {
    case CAKE_ORDERED: {
      return { ...state, numOfCakes: state.numOfCakes - action.payload }
    }
    case CAKE_RESTOCKED: {
      return { ...state, numOfCakes: state.numOfCakes + action.payload }
    }
    default: {
      return { ...state, numOfCakes: state.numOfCakes }
    }
  }
}
const iceCreamReducer = (state = initialState, action) => {
  switch (action.type) {
    case ICE_CREAM_ORDERED: {
      return { ...state, numOfIceCreams: state.numOfIceCreams - action.payload }
    }
    case ICE_CREAM_RESTOCKED: {
      return { ...state, numOfIceCreams: state.numOfIceCreams + action.payload }
    }
    default: {
      return { ...state, numOfCakes: state.numOfCakes }
    }
  }
}

const rootReducer = combineReducers({
  cake: cakeReducer,
  iceCream: iceCreamReducer,
})

const store = createStore(rootReducer, applyMiddleware(logger))

console.log("initial state", store.getState())

const actions = bindActionCreators(
  {
    orderCake,
    restockCake,
    orcerIceCream,
    restockIceCream,
  },
  store.dispatch
)

const unsubscribe = store.subscribe(() => {})

actions.orderCake(1)
actions.restockIceCream(5)

unsubscribe()
