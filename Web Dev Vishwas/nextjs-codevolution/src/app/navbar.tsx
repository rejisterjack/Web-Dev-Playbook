"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import React from "react"

const navLinks = [
  { name: "Home", path: "/" },
  { name: "Products", path: "/products" },
  { name: "Product 1", path: "/products/1" },
  { name: "Review 1", path: "/products/1/reviews/1" },
]

const Navbar = () => {
  const pathName = usePathname()
  return (
    <div className="flex flex-row p-4 gap-4 items-center justify-center h-20">
      {navLinks.map((link) => (
        <Link
          key={link.path}
          href={link.path}
          className={`p-2 rounded-md ${
            pathName === link.path
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-black"
          }`}
        >
          {link.name}
        </Link>
      ))}
    </div>
  )
}

export default Navbar
