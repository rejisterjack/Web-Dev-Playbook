const { createSlice } = require("@reduxjs/toolkit")

const initialState = {
  numOfCakes: 10,
}

const cakeSlice = createSlice({
  name: "cake",
  initialState,
  reducers: {
    ordered: (state, action) => {
      return {
        numOfCakes: state.numOfCakes - action.payload,
      }
    },
    restocked: (state, action) => {
      return {
        numOfCakes: state.numOfCakes + action.payload,
      }
    },
  },
})

module.exports.cakeReducer = cakeSlice.reducer
module.exports.cakeActions = cakeSlice.actions
