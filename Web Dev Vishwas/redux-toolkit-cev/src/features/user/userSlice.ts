import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit"

type User = {
  id: string
  name: string
}

type InitialState = {
  loading: boolean
  users: User[]
  error: string
}

const initialState: InitialState = {
  loading: false,
  users: [],
  error: "",
}

const fetchUsers = createAsyncThunk("user/fetchUsers", async () => {
  return await fetch("https://jsonplaceholder.typicode.com/users")
    .then((response) => response.json())
    .then((data) => data.map((user: { id: string }) => user.id))
})

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchUsers.pending, (state) => {
      state.loading = true
    })
    builder.addCase(fetchUsers.fulfilled, (state, action:PayloadAction<User[]>) => {
      state.loading = false
      state.users = action.payload
      state.error = ""
    })
    builder.addCase(fetchUsers.rejected, (state, action) => {
      state.loading = false
      state.users = []
      state.error = action.error.message || "Something went wrong"
    })
  },
})

export default userSlice.reducer
export { fetchUsers }
