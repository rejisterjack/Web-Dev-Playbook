import { useMemo, useState } from "react"

const UseMemoHook = () => {
  const [counterOne, setCounterOne] = useState(0)
  const [counterTwo, setCounterTwo] = useState(0)

  const incrementOne = () => {
    setCounterOne(counterOne + 1)
  }

  const incrementTwo = () => {
    setCounterTwo(counterTwo + 1)
  }

  const isEven = useMemo(() => {
    let i = 0
    while (i < 2000000000) i++
    return counterOne % 2 === 0
  }, [counterOne])
  return (
    <div>
      <div>
        <button onClick={incrementOne} className="btn btn-primary btn-sm m-2">
          Count One - {counterOne}
        </button>
        <span>{isEven ? "Even" : "Odd"}</span>
      </div>
      <div>
        <button onClick={incrementTwo} className="btn btn-primary btn-sm m-2">
          Count Two - {counterTwo}
        </button>
      </div>
    </div>
  )
}

export default UseMemoHook
