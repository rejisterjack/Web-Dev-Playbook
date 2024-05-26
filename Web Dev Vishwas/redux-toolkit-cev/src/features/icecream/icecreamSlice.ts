import { createSlice } from "@reduxjs/toolkit"
import { cakeOrdered } from "../cake/cakeSlice"

const initialState = {
  numOfIcecreams: 20,
}

const icecreamSlice = createSlice({
  name: "icecream",
  initialState,
  reducers: {
    icecreamOrdered: (state, action) => {
      state.numOfIcecreams -= action.payload
    },
    icecreamRestocked: (state, action) => {
      state.numOfIcecreams += action.payload
    },
  },
  extraReducers: (builder) => {
    builder.addCase(cakeOrdered, (state) => {
      state.numOfIcecreams--
    })
  },
})

export const { icecreamOrdered, icecreamRestocked } = icecreamSlice.actions
export default icecreamSlice.reducer
