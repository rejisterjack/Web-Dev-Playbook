import { fetchUsers } from "../../features/user/userSlice"
import { useAppDispatch, useAppSelector } from "../../app/hooks"

const UserView = () => {
  const user = useAppSelector((state) => state.user)
  const dispatch = useAppDispatch()

  return (
    <div>
      <h2>List of Users</h2>
      <button
        className="btn btn-primary btn-sm"
        onClick={() => dispatch(fetchUsers())}
      >
        fetch users
      </button>
      <p>
        {user.loading
          ? "loading..."
          : user.users.length > 1 && JSON.stringify(user.users)}
      </p>
    </div>
  )
}

export default UserView
