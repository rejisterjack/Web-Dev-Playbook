import { useReducer } from "react"

const ReducerCounter = () => {
  const initialState = {
    count: 0,
  }
  const reducer = (state, action) => {
    switch (action.type) {
      case "increment":
        return { count: state.count + 1 }
      case "decrement":
        return { count: state.count - 1 }
      default:
        return initialState
    }
  }

  const [state, dispatch] = useReducer(reducer, initialState)
  return <div>
    <h2>{state.count}</h2>
    <div className="flex flex-col ">
      <button className="btn btn-primary" onClick={()=>dispatch({type:"increment"})}>increment</button>
      <button className="btn btn-primary mx-2" onClick={()=>dispatch({type:"decrement"})}>decrement</button>
      <button className="btn btn-primary" onClick={()=>dispatch({type:""})}>reset</button>
    </div>
  </div>
}

export default ReducerCounter
