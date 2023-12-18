const { createSlice } = require("@reduxjs/toolkit")

const initialState = {
  numOfIceCreams: 20,
}

const icecreamSlice = createSlice({
  name: "icecream",
  initialState,
  reducers: {
    ordered: (state) => {
      state.numOfIceCreams--
    },
    restocked: (state, action) => {
      state.numOfIceCreams += action.payload
    },
  },
})

module.exports = icecreamSlice.reducer
module.exports.icecreamActions = icecreamSlice.actions