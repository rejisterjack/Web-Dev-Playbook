import { useState } from "react"

const App = () => {
  const [name, setName] = useState("")
  const [pass, setPass] = useState("")
  const [gender, setGender] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    alert(`Name: ${name} Pass: ${pass}`)
  }

  return (
    <div>
      <form className="form" onSubmit={handleSubmit}>
        <div className="flex">
          <label className="label">Name:</label>
          <input
            type="text"
            name="name"
            className="form-control mb-2 w-50"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex">
          <label className="label">Pass:</label>
          <input
            type="password"
            name="pass"
            className="form-control mb-2 w-50"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
        </div>
        <div className="form-check">
          <label className="label" htmlFor="male">
            Male:
          </label>
          <input
            type="radio"
            className="form-check-input"
            id="male"
            // name="radio"
            checked={gender==="Male"}
            onChange={() => setGender("Male")}
          />
        </div>
        <div className="form-check">
          <label className="label" htmlFor="female">
            Female:
          </label>
          <input
            type="radio"
            className="form-check-input"
            id="female"
            // name="radio"
            checked={gender==="Female"}
            onChange={() => setGender("Female")}
          />
        </div>
        <div className="form-check">
          <label className="label" htmlFor="others">
            Others:
          </label>
          <input
            type="radio"
            className="form-check-input"
            id="others"
            // name="radio"
            checked={gender==="Others"}
            onChange={() => setGender("Others")}
          />
        </div>

        <input
          type="submit"
          value="Submit"
          className="btn btn-primary btn-sm"
        />
      </form>
    </div>
  )
}

export default App
