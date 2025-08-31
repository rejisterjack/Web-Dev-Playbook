import { createContext, useReducer } from "react"
import ComponentA from "./context/01.ComponentA"
import ComponentC from "./context/03.ComponentC"
import ComponentF from "./context/06.ComponentF"

export const reducerContext = createContext<{
  currentState: { count: number }
  dispatch: React.Dispatch<{ type: string }>
}>({ currentState: { count: 0 }, dispatch: () => {} })

const initialState = { count: 0 }

const reducer = (state: { count: number }, action: { type: string }) => {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 }
    case "decrement":
      return { count: state.count - 1 }
    case "reset":
      return initialState
    default:
      return state
  }
}

const UseReducerContext = () => {
  const [currentState, dispatch] = useReducer(reducer, initialState)
  return (
    <reducerContext.Provider value={{ currentState, dispatch }}>
      <ComponentA />
      <ComponentC />
      <ComponentF />
    </reducerContext.Provider>
  )
}

export default UseReducerContext
