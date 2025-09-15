'use client'

import { useRouter } from 'next/navigation'
import React, { startTransition } from 'react'

const Error = ({ error, reset }: { error: Error; reset: () => void }) => {
  const router = useRouter()
  const reload = () => {
    startTransition(() => {
      router.refresh()
      reset()
    })
  }
  return (
    <div>
      <h2>{error.message}</h2>
      <button onClick={reload}>reload</button>
    </div>
  )
}

export default Error
