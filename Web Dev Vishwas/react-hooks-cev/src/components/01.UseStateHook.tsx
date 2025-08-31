import { useState } from "react"

const UseStateHook = () => {
  const [count, setCount] = useState(0)
  const incrementByFive = () => {
    for (let i = 0; i < 5; i++) {
      // setCount(count + 1)
      setCount((prevCount) => prevCount + 1)
    }
  }
  return (
    <div className="d-flex flex-row gap-2">
      <button className="btn btn-primary" onClick={() => setCount(count - 1)}>
        -
      </button>
      <button className="btn btn-primary" onClick={() => setCount(0)}>
        {count}
      </button>
      <button className="btn btn-primary" onClick={() => setCount(count + 1)}>
        +
      </button>
      <button className="btn btn-primary" onClick={incrementByFive}>
        +5
      </button>
    </div>
  )
}

export default UseStateHook
