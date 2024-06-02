import { useRef } from "react"


const ExampleRef = () => {
  console.log("component rendered")
  const headingRef = useRef(null)
  const handleClick = () => {
    console.log(headingRef)
    headingRef.current.innerText = "Hello World Changed"
  }
  return (
    <div>
      <h2 ref={headingRef}>Hello World</h2>
      <button className="btn btn-primary btn-sm" onClick={handleClick}>change</button>
    </div>
  )
}

export default ExampleRef