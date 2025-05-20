import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NavBar = () => {
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { logout } = useAuth()

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/draganddrop', label: 'Drag and Drop' },
    { path: '/accordion', label: 'Accordion' },
    { path: '/toast', label: 'Toast' },
    { path: '/carousel', label: 'Carousel' },
    { path: '/infinitescroll', label: 'Infinite Scroll' },
    { path: '/autosuggestion', label: 'Auto Suggestion' },
    { path: '/breadcrumb', label: 'Breadcrumb' },
    { path: '/formvalidations', label: 'Form Validations' },
    { path: '/searchbar', label: 'Search Bar' },
  ]

  return (
    <nav className='bg-slate-800 p-4 text-white'>
      <div className='container mx-auto flex justify-between items-center'>
        <Link to='/' className='text-xl font-bold'>
          React Components
        </Link>

        {/* Mobile menu button */}
        <div className='md:hidden'>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className='focus:outline-none'
          >
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M4 6h16M4 12h16M4 18h16'
              />
            </svg>
          </button>
        </div>

        {/* Desktop navigation */}
        <div className='hidden md:flex space-x-4 items-center'>
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`hover:text-blue-300 ${
                location.pathname === item.path
                  ? 'text-blue-300 font-semibold'
                  : ''
              }`}
            >
              {item.label}
            </Link>
          ))}
          <button
            onClick={logout}
            className='ml-4 bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded transition duration-300 flex items-center'
          >
            <svg
              className='w-4 h-4 mr-1'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth='2'
                d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
              />
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <div className='md:hidden mt-2'>
          <div className='flex flex-col space-y-2'>
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`py-2 px-4 hover:bg-slate-700 ${
                  location.pathname === item.path ? 'bg-slate-700' : ''
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <button
              onClick={() => {
                setIsMenuOpen(false)
                logout()
              }}
              className='py-2 px-4 bg-red-500 hover:bg-red-600 text-white mt-2 rounded flex items-center'
            >
              <svg
                className='w-4 h-4 mr-2'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1'
                />
              </svg>
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}

export default NavBar
