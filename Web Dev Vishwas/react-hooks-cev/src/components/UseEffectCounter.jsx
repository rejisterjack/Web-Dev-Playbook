import { useEffect, useState } from "react"

function UseEffectCounter() {
  const [obj, setObj] = useState({
    count: 0,
    name: "",
  })

  const incrementCount = () => {
    setObj((prevState) => ({
      ...prevState,
      count: prevState.count + 1,
    }))
  }

  useEffect(() => {
    console.log(obj)
  }, [obj.name])
  return (
    <div>
      <input
        type="text"
        className="form-control mb-2"
        value={obj.name}
        onChange={(e) => {
          setObj((prevState) => ({
            ...prevState,
            name: e.target.value,
          }))
        }}
      />
      <h4>name is {obj.name}</h4>
      <button className="btn btn-primary" onClick={incrementCount}>
        Count {obj.count}
      </button>
    </div>
  )
}

export default UseEffectCounter
