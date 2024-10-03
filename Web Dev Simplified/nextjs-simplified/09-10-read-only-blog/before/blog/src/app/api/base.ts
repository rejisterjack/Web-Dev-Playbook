import axios from "axios"

export const baseApi = axios.create({ baseURL: process.env.API_URL })

if (process.env.API_URL === "true") {
  baseApi.interceptors.response.use((res) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(res)
      }, 1000)
    })
  })
}
