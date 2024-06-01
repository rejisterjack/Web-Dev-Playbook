// import Events from "./components/Events"
// import Greetings from "./components/Greetings"
// import User from "./components/User"

import Counter from "./components/Counter"
import StateExample from "./examples/StateExample"

// const users = [
//   { id: 1, name: "Rupam", age: 25 },
//   { id: 2, name: "John", age: 35 },
//   { id: 3, name: "Jane", age: 15 },
// ]

const App = () => {
  return (
    <div>
      {/* <Greetings firstName="Rupam" lastName="Das">
        <h2>Hello Children</h2>
      </Greetings>
      {users.map((user) => (
        <User key={user.id} user={user} />
      ))}
      <Events /> */}

      {/* starting with state */}

      {/* <Counter /> */}

      <StateExample />
    </div>
  )
}

export default App
