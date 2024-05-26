import { useContext } from "react"
import { UserContext } from "../07.UseContextHook"

const ComponentF = () => {
  const data = useContext(UserContext)
  return (
    <div>
      ComponentF : {data.name} {data.age}
    </div>
  )
}

export default ComponentF
