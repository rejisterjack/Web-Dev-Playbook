import { useContext } from "react"
import { UserContext } from "../07.UseContextHook"

const ComponentA = () => {
  const data = useContext(UserContext)
  return (
    <div>
      ComponentA : {data.name} {data.age}
    </div>
  )
}

export default ComponentA
