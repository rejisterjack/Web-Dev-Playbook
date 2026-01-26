import { useEffect, useState } from "react"

const UseEffectPointer = () => {
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)

  const logMousePosition = (e: MouseEvent) => {
    console.log("Mouse event")
    setX(e.clientX)
    setY(e.clientY)
  }
  useEffect(() => {
    console.log("useEffect hook called")
    window.addEventListener("mousemove", logMousePosition)
    return () => {
      console.log("Component unmounted")
      window.removeEventListener("mousemove", logMousePosition)
    }
  }, [])
  return (
    <div>
      <h3>Mouse X: {x} Mouse Y: {y}</h3>
    </div>
  )
}

export default UseEffectPointer

export const TogglePointer = () => {
  const [display, setDisplay] = useState(true)
  return (
    <div>
      <button className="btn btn-warning mt-2" onClick={() => setDisplay(!display)}>Toggle Pointer</button>
      {display && <UseEffectPointer />}
    </div>
  )
}
