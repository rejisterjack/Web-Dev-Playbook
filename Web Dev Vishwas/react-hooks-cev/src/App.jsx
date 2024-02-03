import ClassCounter from "./components/ClassCounter"
import StateCounter from "./components/StateCounter"
import StateCounterArray from "./components/StateCounterArray"
import StateCounterObject from "./components/StateCounterObject"

function App() {
  return (
    <div className="p-2">
      {/* <ClassCounter /> */}
      {/* <StateCounter /> */}
      {/* <StateCounterObject /> */}
      <StateCounterArray />
    </div>
  )
}

export default App
