const { default: axios } = require("axios")
const { applyMiddleware } = require("redux")
const { createStore } = require("redux")
const { default: logger } = require("redux-logger")
const { thunk } = require("redux-thunk")

const FETCH_USERS_REQUESTED = "FETCH_USERS_REQUESTED"
const FETCH_USERS_SUCCESSFUL = "FETCH_USERS_SUCCESSFUL"
const FETCH_USERS_FAILURE = "FETCH_USERS_FAILURE"

const initialState = {
  loading: false,
  users: [],
  error: "",
}

const fetchUsersRequested = () => ({
  type: FETCH_USERS_REQUESTED,
})

const fetchUsersSuccessful = (users) => ({
  type: FETCH_USERS_SUCCESSFUL,
  payload: users,
})

const fetchUsersFailure = (error) => ({
  type: FETCH_USERS_FAILURE,
  payload: error,
})

const fetchUsers = () => (dispatch) => {
  dispatch(fetchUsersRequested())
  axios
    .get("https://jsonplaceholder.typicode.com/users")
    .then((res) => {
      dispatch(fetchUsersSuccessful(res.data.map((user) => user.name)))
    })
    .catch((err) => dispatch(fetchUsersFailure(err.message)))
}

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_USERS_REQUESTED:
      return {
        ...state,
        loading: true,
      }
    case FETCH_USERS_SUCCESSFUL:
      return {
        ...state,
        loading: false,
        users: action.payload,
        error: "",
      }
    case FETCH_USERS_FAILURE:
      return {
        ...state,
        loading: false,
        users: [],
        error: action.payload,
      }
  }
}

const store = createStore(userReducer, applyMiddleware(thunk, logger))
console.log("initial state", store.getState())
store.subscribe(() => {})
store.dispatch(fetchUsers())
