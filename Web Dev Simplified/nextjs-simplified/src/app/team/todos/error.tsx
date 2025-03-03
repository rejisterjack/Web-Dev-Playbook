"use client"
import React from "react"

interface ErrorProps {
  error: { message: string };
  reset: () => void;
}

const Error = ({ error, reset }: ErrorProps) => {
  return (
    <>
      <div>{error.message}</div>
      <button onClick={reset}>retry</button>
    </>
  )
}

export default Error
