"use client"

export default function Error({ error, reset }: any) {
  return (
    <>
      <h1>{error.message}</h1>
      <button onClick={reset} className="bg-blue-500 px-4 py-1 rounded-sm">
        Retry
      </button>
    </>
  )
}
