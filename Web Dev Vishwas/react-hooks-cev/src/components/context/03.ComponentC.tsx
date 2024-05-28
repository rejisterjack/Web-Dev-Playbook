import { useContext } from "react"
// import { UserContext } from "../07.UseContextHook"
import { reducerContext } from "../10.UseReducerContext"

const ComponentC = () => {
  // const data = useContext(UserContext)
  const { currentState, dispatch } = useContext(reducerContext)
  return (
    <div>
      {/* ComponentC : {data.name} {data.age} */}

      ComponentC : {currentState.count}
      <br />
      <button
        className="btn btn-primary"
        onClick={() => dispatch({ type: "increment" })}
      >
        increment
      </button>
      <button
        className="btn btn-danger mx-2 my-2"
        onClick={() => dispatch({ type: "decrement" })}
      >
        decrement
      </button>
      <button
        className="btn btn-warning"
        onClick={() => dispatch({ type: "reset" })}
      >
        reset
      </button>
    </div>
  )
}

export default ComponentC
