import { useRef } from "react"

const RefForm = () => {
  
  const nameRef = useRef(null)
  const passRef = useRef(null)

  const handleName = () => {
    console.log(nameRef.current.value)
  }
  const handlePass = () => {
    console.log(passRef.current.value)
  }
  return (
    <form>
      <div className="flex">
        <label className="label">Name:</label>
        <input
          type="text"
          name="name"
          ref={nameRef}
          className="form-control mb-2 w-50"
          onChange={handleName}
        />
      </div>
      <div className="flex">
        <label className="label">Pass:</label>
        <input
          type="password"
          name="pass"
          ref={passRef}
          className="form-control mb-2 w-50"
          onChange={handlePass}
        />
      </div>
      <input type="submit" value="Submit" className="btn btn-primary btn-sm" />
    </form>
  )
}

export default RefForm
