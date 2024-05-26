import store from "./app/store"
import { cakeOrdered, cakeRestocked } from "./features/cake/cakeSlice"
import { fetchUsers } from "./features/user/userSlice"

console.log("initial state", store.getState())

const unsubscribe = store.subscribe(() =>
  console.log("state after dispatch", store.getState())
)

store.dispatch(fetchUsers())

unsubscribe()
