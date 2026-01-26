import { configureStore } from "@reduxjs/toolkit"
import { contactsApi } from "../services/contactServices"

export const store = configureStore({
  reducer: {
    [contactsApi.reducerPath]: contactsApi.reducer,
  },
  middleware: (def) => def().concat(contactsApi.middleware),
})
