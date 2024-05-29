import { PayloadAction, createSlice } from "@reduxjs/toolkit"

type InitialState = {
  numOfCakes: number
}

const initialState: InitialState = {
  numOfCakes: 10,
}

const cakeSlice = createSlice({
  name: "cake",
  initialState,
  reducers: {
    cakeOrdered: (state, action: PayloadAction<number>) => {
      state.numOfCakes -= action.payload
    },
    cakeRestocked: (state, action:PayloadAction<number>) => {
      state.numOfCakes += action.payload
    },
  },
})

export const { cakeOrdered, cakeRestocked } = cakeSlice.actions
export default cakeSlice.reducer
