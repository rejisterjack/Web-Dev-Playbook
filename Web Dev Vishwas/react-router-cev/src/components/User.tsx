import { MouseEventHandler, useState } from "react"
import { Outlet, useNavigate, useSearchParams } from "react-router-dom"

const User = () => {
  const navigate = useNavigate()
  const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    navigate(e.currentTarget.id)
  }
  const [searchParams, setSearchParams] = useSearchParams()
  const showActiveUsers = searchParams.get("filter") === "active"
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
      <h2 className="mt-2">Filters</h2>
      <div className="d-flex gap-2">
        <button
          className="btn btn-primary"
          id="1"
          onClick={() => setSearchParams({ filter: "active" })}
        >
          active
        </button>
        <button
          className="btn btn-primary"
          id="2"
          onClick={() => setSearchParams({})}
        >
          reset
        </button>
      </div>
      {showActiveUsers && <p>Active Users</p>}
      <Outlet />
    </div>
  )
}

export default User
