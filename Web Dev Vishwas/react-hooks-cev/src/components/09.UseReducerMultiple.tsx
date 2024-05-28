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

const UseReducerMultiple = () => {
  const [currentState1, dispatch1] = useReducer(reducer, initialState)
  const [currentState2, dispatch2] = useReducer(reducer, initialState)
  return (
    <>
      <div>
        <h1>Count 1 : {currentState1.count}</h1>
        <button
          className="btn btn-primary"
          onClick={() => dispatch1({ type: "increment" })}
        >
          Increment
        </button>
        <button
          className="btn btn-danger mx-2"
          onClick={() => dispatch1({ type: "decrement" })}
        >
          Decrement
        </button>
        <button
          className="btn btn-warning"
          onClick={() => dispatch1({ type: "reset" })}
        >
          Reset
        </button>
      </div>
      <br />
      <div>
        <h1>Count 2 : {currentState2.count}</h1>
        <button
          className="btn btn-primary"
          onClick={() => dispatch2({ type: "increment" })}
        >
          Increment
        </button>
        <button
          className="btn btn-danger mx-2"
          onClick={() => dispatch2({ type: "decrement" })}
        >
          Decrement
        </button>
        <button
          className="btn btn-warning"
          onClick={() => dispatch2({ type: "reset" })}
        >
          Reset
        </button>
      </div>
    </>
  )
}

export default UseReducerMultiple
