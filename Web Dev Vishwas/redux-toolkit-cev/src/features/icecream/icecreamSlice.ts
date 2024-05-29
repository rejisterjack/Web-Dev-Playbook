import { PayloadAction, createSlice } from "@reduxjs/toolkit"
import { cakeOrdered } from "../cake/cakeSlice"

type InitialState = {
  numOfIcecreams: number
}

const initialState:InitialState = {
  numOfIcecreams: 20,
}

const icecreamSlice = createSlice({
  name: "icecream",
  initialState,
  reducers: {
    icecreamOrdered: (state, action:PayloadAction<number>) => {
      state.numOfIcecreams -= action.payload
    },
    icecreamRestocked: (state, action:PayloadAction<number>) => {
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
