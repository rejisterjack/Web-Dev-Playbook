import { useState } from "react"
import { useAuth } from "./auth"
import { useLocation, useNavigate } from "react-router-dom"

const Login = () => {
  const [user, setUser] = useState("")
  const auth = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const redirectPath = location.state?.path || "/"

  const handleLogin = () => {
    auth.login(user)
    navigate(redirectPath, { replace: true })
  }
  return (
    <div className="d-flex gap-2">
      <label>Username:</label>
      <input
        type="text"
        className="form-control"
        onChange={(e) => setUser(e.target.value)}
      />
      <button className="btn btn-primary" onClick={handleLogin}>
        Login
      </button>
    </div>
  )
}

export default Login
