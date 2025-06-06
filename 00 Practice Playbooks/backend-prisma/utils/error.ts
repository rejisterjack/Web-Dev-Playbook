export function handleError(error: any) {
  console.log(error)
  throw new Error(error.message)
}
