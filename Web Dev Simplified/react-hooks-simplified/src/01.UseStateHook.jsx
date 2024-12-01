import { useState } from "react"
const initialCountValue = 0

const UseStateHook = () => {
  const [count, setCount] = useState(() => {
    console.log("Initial count value")
    return initialCountValue
  })
  const handleAdd = () => setCount((prevCount) => prevCount + 1)
  const handleSubtract = () => setCount((prevCount) => prevCount - 1)
  return (
    <div>
      <h1>useState Hook</h1>
      <div className="d-flex flex-row gap-2">
        <button className="btn btn-danger btn-sm" onClick={handleSubtract}>
          Subtract
        </button>
        <button className="btn btn-primary btn-sm">{count}</button>
        <button className="btn btn-success btn-sm" onClick={handleAdd}>
          Add
        </button>
      </div>
    </div>
  )
}

export default UseStateHook
