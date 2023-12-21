const { store } = require("./app/store")
const { cakeActions } = require("./features/cakeSlice")
const { fetchUsers } = require("./features/userSlice")

store.subscribe(()=>{})
store.dispatch(cakeActions.ordered(3))
store.dispatch(cakeActions.restocked(5))
store.dispatch(fetchUsers())