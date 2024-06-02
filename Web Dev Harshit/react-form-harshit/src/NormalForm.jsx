import { useState } from "react"

const NormalForm = () => {
  // const [name, setName] = useState("")
  // const [pass, setPass] = useState("")
  // const [gender, setGender] = useState("")

  const handleSubmit = (e) => {
    e.preventDefault()
    alert(
      `Name: ${formData.name} Pass: ${formData.pass} Gender: ${formData.gender}`
    )
  }

  const [formData, setFormData] = useState({ name: "", pass: "", gender: "" })
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value })

  return (
    <div>
      <form className="form" onSubmit={handleSubmit}>
        <div className="flex">
          <label className="label">Name:</label>
          <input
            type="text"
            name="name"
            className="form-control mb-2 w-50"
            value={formData.name}
            // onChange={(e) => setName(e.target.value)}
            onChange={handleChange}
          />
        </div>
        <div className="flex">
          <label className="label">Pass:</label>
          <input
            type="password"
            name="pass"
            className="form-control mb-2 w-50"
            value={formData.pass}
            // onChange={(e) => setPass(e.target.value)}
            onChange={handleChange}
          />
        </div>

        {/* radio section */}
        {/* <div className="form-check">
          <label className="label" htmlFor="male">
            Male:
          </label>
          <input
            type="radio"
            className="form-check-input"
            id="male"
            name="gender"
            // name="radio"
            checked={formData.gender === "Male"}
            // onChange={() => setGender("Male")}
            onChange={handleChange}
          />
        </div>
        <div className="form-check">
          <label className="label" htmlFor="female">
            Female:
          </label>
          <input
            type="radio"
            className="form-check-input"
            name="gender"
            id="female"
            // name="radio"
            checked={formData.gender === "Female"}
            // onChange={() => setGender("Female")}
            onChange={handleChange}
          />
        </div>
        <div className="form-check">
          <label className="label" htmlFor="others">
            Others:
          </label>
          <input
            type="radio"
            className="form-check-input"
            name="gender"
            id="others"
            // name="radio"
            checked={formData.gender === "Others"}
            // onChange={() => setGender("Others")}
            onChange={handleChange}
          />
        </div> */}

        <input
          type="submit"
          value="Submit"
          className="btn btn-primary btn-sm"
        />
      </form>
    </div>
  )
}

export default NormalForm
