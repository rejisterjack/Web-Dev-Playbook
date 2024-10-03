import { baseApi } from "./base"

export async function getTodos(options: any) {
  const res = await baseApi.get("todos", options)
  return res.data
}
