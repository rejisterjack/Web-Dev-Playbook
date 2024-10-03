import { useState } from "react"
import Arrays from "./Arrays"
import { AlertMessage } from "./Portal"
import RefUse from "./RefUse"

const App = () => {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <>
      {/* <Arrays /> */}
      {/* <RefUse /> */}
      <button onClick={()=>setIsOpen(true)}>open</button>
      <AlertMessage isOpen={isOpen} onClose={() => setIsOpen(false)}>
        これはポータルです
      </AlertMessage>
    </>
  )
}

export default App
