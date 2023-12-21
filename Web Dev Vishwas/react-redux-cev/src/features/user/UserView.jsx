import { useDispatch, useSelector } from "react-redux"
import { fetchUsers } from "./userSlice"

const UserView = () => {
  const dispatch = useDispatch()
  const data = useSelector((state) => state.user)
  return (
    <div>
      <div>
        {data.loading && (
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only"></span>
          </div>
        )}
        {!data.loading && data.users && (
          <ul>
            {data.users.map((user, index) => (
              <li key={index}>
                <h5 className="card-title">{user.name}</h5>
              </li>
            ))}
          </ul>
        )}
      </div>
      <button
        className="btn btn-primary"
        onClick={() => dispatch(fetchUsers())}
      >
        fetch users
      </button>
    </div>
  )
}

export default UserView
