import { useState } from "react"

const App = () => {
  const [name, setName] = useState("")
  const [pass, setPass] = useState("")

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
