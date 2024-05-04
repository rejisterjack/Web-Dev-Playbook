import { useState } from "react"

const UseStateObject = () => {
  const [name, setName] = useState({ firstName: "", lastName: "" })
  return (
    <div>
      <form>
        <div className="form-group">
          <label htmlFor="first-name">First Name</label>
          <input
            type="text"
            className="form-control"
            onChange={(e) =>
              setName((prevName) => ({
                ...prevName,
                firstName: e.target.value,
              }))
            }
          />
        </div>
        <div className="form-group">
          <label htmlFor="last-name">Last Name</label>
          <input
            type="text"
            className="form-control"
            onChange={(e) =>
              setName((prevName) => ({
                ...prevName,
                lastName: e.target.value,
              }))
            }
          />
        </div>
        <h3>
          {name.firstName} {name.lastName}
        </h3>
      </form>
    </div>
  )
}

export default UseStateObject
