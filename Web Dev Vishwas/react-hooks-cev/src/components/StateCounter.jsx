import { useState } from "react"

const StateCounter = () => {
  const [count, setCount] = useState(0)

  const increment = () => {
    console.log("inside increment function")
    // setCount(count + 1)

    // with previous value
    setCount((prevCount) => prevCount + 1)
  }

  const increment5 = () => {
    for (let i = 0; i < 5; i++) {
      increment()
    }
  }

  return (
    <div>
      <button className="btn btn-success" onClick={increment}>
        Count {count}
      </button>
      <button className="btn btn-warning mx-2" onClick={increment5}>
        Increment 5
      </button>
    </div>
  )
}

export default StateCounter
