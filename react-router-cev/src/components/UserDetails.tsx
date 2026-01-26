import { useParams } from "react-router-dom"

const UserDetails = () => {
  const { userId } = useParams()
  return <div>UserDetails for {userId}</div>
}

export default UserDetails
