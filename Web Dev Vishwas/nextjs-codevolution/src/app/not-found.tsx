"use client"
import React from "react"
import { usePathname } from "next/navigation"

const NotFound = () => {
  const pathname = usePathname()
  return <div>notFound</div>
}

export default NotFound
