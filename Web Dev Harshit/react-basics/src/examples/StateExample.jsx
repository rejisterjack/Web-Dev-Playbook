import { useState } from "react"

const StateExample = () => {
  const [users, setUsers] = useState([
    { id: 1, firstName: "Rupam", lastName: "Das", age: 25 },
    { id: 2, firstName: "John", lastName: "Doe", age: 35 },
    { id: 3, firstName: "Jane", lastName: "Doe", age: 15 },
  ])
  return <div>StateExample</div>
}

export default StateExample
