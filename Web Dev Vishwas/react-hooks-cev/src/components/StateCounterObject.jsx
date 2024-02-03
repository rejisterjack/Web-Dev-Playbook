import { useState } from "react"

const initialObj = {
  first: "",
  last: "",
}

const StateCounterObject = () => {
  const [name, setName] = useState(initialObj)
  return (
    <div>
      <input
        type="text"
        className="form-control"
        placeholder="first name"
        onChange={(e) =>
          setName((prevName) => ({ ...prevName, first: e.target.value }))
        }
      />
      <input
        type="text"
        className="form-control my-2"
        placeholder="last name"
        onChange={(e) =>
          setName((prevName) => ({ ...prevName, last: e.target.value }))
        }
      />
      <hr />
      <h2>
        {name.first} {name.last}
      </h2>
    </div>
  )
}

export default StateCounterObject
