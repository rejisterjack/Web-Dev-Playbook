import { createContext } from "react"
import ComponentA from "./context/01.ComponentA"
import ComponentC from "./context/03.ComponentC"
import ComponentF from "./context/06.ComponentF"

export const UserContext = createContext({ name: "Guest", age: 0 })

const UseContextHook = () => {
  return (
    <UserContext.Provider value={{ name: "John", age: 24 }}>
      <div>
        <ComponentA />
        <ComponentC />
        <ComponentF />
      </div>
    </UserContext.Provider>
  )
}

export default UseContextHook
