import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  numOfCakes: 10
}

const cakeSlice = createSlice({
  name: 'cake',
  initialState,
  reducers: {
    cakeOrdered: (state, action) => {
      state.numOfCakes -= action.payload
    },
    cakeRestocked: (state, action) => {
      state.numOfCakes += action.payload
    }
  }
})

export const { cakeOrdered, cakeRestocked } = cakeSlice.actions
export default cakeSlice.reducer