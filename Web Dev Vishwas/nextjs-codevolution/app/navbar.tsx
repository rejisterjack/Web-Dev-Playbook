'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React from 'react'

const navlinks = [
  {
    label: 'docs',
    url: '/docs',
  },
  {
    label: 'products',
    url: '/products',
  },
]

const Navbar = () => {
  const pathname = usePathname()
  return (
    <div className='w-full flex flex-row justify-center items-center gap-4 bg-gray-100 p-2 text-gray-500'>
      {navlinks.map((item) => {
        const isActive = pathname.startsWith(item.url) && item.url !== '/'
        return (
          <Link href={item.url} className={isActive ? 'text-gray-700 font-semibold' : 'text-gray-500'}>
            {item.label}
          </Link>
        )
      })}
    </div>
  )
}

export default Navbar
