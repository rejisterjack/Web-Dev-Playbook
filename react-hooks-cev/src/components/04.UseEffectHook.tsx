import { useEffect, useState } from "react"


const UseEffectHook = () => {
  const [count, setCount] = useState(0)
  const [name, setName] = useState("Your Name")
  useEffect(() => {
    console.log("useEffect hook called")
    document.title = `You clicked ${count} times`
  }, [count])
  return (
    <div>
      <input type="text" className="form-control mb-2" onChange={e => setName(e.target.value)} />
      <button className="btn btn-primary" onClick={() => setCount(prevCount => prevCount + 1)}>Click me {count}</button>
      <button className="btn btn-success mx-2">{name}</button>
    </div>
  )
}

export default UseEffectHook