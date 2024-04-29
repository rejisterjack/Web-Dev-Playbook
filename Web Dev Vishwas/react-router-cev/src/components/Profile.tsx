import { useNavigate } from "react-router-dom"
import { useAuth } from "./auth"

const Profile = () => {
  const auth = useAuth()
  const navigate = useNavigate()
  const handleLogout = () => {
    auth.logout()
    navigate("/")
  }
  return (
    <div>
      <p>Welcome {auth.user}</p>
      <button className="btn btn-danger" onClick={handleLogout}>
        Logout
      </button>
    </div>
  )
}

export default Profile
