import { useEffect, useRef, useState } from "react"

const UseRefInterval = () => {
  const [timer, setTimer] = useState<number>(0)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimer((timer) => timer + 1)
    }, 1000)
    return () => {
      clearInterval(intervalRef.current!)
    }
  }, [])

  const handleClick = () => {
    clearInterval(intervalRef.current!)
  }
  return (
    <div>
      <h4>Countdown</h4>
      <h5>{timer}</h5>
      <button className="btn btn-primary btn-sm" onClick={handleClick}>
        stop
      </button>
    </div>
  )
}

export default UseRefInterval
