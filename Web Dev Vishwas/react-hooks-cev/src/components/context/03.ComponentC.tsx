import { useContext } from "react"
import { UserContext } from "../07.UseContextHook"

const ComponentC = () => {
  const data = useContext(UserContext)
  return (
    <div>
      ComponentC : {data.name} {data.age}
    </div>
  )
}

export default ComponentC
