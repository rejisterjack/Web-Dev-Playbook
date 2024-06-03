import { useState } from "react"

const Counter = () => {
  const [count, setCount] = useState(0)
  const handleClick = () => {
    console.log("function called")
    setCount(count + 1)
    console.log("count is: ", count)
  }
  return (
    <div>
      <h1>Counter {count}</h1>
      <button onClick={handleClick} className="btn btn-primary btn-sm">click</button>
    </div>
  )
}

export default Counter 
