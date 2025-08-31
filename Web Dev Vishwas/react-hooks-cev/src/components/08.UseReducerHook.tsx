import { useReducer } from "react"

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

const UseReducerHook = () => {
  const [currentState, dispatch] = useReducer(reducer, initialState)
  return (
    <div>
      <h1>Count : {currentState.count}</h1>
      <button
        className="btn btn-primary"
        onClick={() => dispatch({ type: "increment" })}
      >
        Increment
      </button>
      <button
        className="btn btn-danger mx-2"
        onClick={() => dispatch({ type: "decrement" })}
      >
        Decrement
      </button>
      <button
        className="btn btn-warning"
        onClick={() => dispatch({ type: "reset" })}
      >
        Reset
      </button>
    </div>
  )
}

export default UseReducerHook
