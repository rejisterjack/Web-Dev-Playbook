import { useEffect, useState } from "react"

const UseEffectMouse = () => {
  const [point, setPoint] = useState({
    x: 0,
    y: 0,
  })

  const logMousePosition = (e) => {
    setPoint({ x: e.clientX, y: e.clientY })
  }

  useEffect(() => {
    window.addEventListener("mousemove", logMousePosition)
    return () => {
      window.removeEventListener("mousemove", logMousePosition)
    }
  }, [])

  return (
    <div>
      <button className="btn btn-primary">ClinetX: {point.x}</button>
      <button className="btn btn-warning mx-2">ClinetY: {point.y}</button>
    </div>
  )
}

export default UseEffectMouse
