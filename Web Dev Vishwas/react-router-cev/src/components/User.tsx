import { MouseEventHandler } from "react"
import { Outlet, useNavigate } from "react-router-dom"

const User = () => {
  const navigate = useNavigate()
  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    navigate(e.currentTarget.id)
  }
  return (
    <div>
      <h2>Users</h2>
      <div className="d-flex gap-2">
        <button className="btn btn-primary" id="1" onClick={handleClick}>
          user 1
        </button>
        <button className="btn btn-primary" id="2" onClick={handleClick}>
          user 2
        </button>
        <button className="btn btn-primary" id="3" onClick={handleClick}>
          user 3
        </button>
      </div>
      <Outlet />
    </div>
  )
}

export default User
