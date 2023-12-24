import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const contactsApi = createApi({
  reducerPath: "contactApi",
  baseQuery: fetchBaseQuery({ baseUrl: "http://localhost:3000" }),
  tagTypes: ["contacts"],
  endpoints: (builder) => ({
    contacts: builder.query({
      query: () => ({
        url: "/contacts",
        method: "GET",
      }),
      providesTags: ["contacts"],
    }),
    contact: builder.query({
      query: (id) => ({
        url: `/contacts/${id}`,
        method: "GET",
      }),
      providesTags: ["contacts"],
    }),
  }),
})

