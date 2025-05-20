import React from 'react'
import { useAuth } from '../context/AuthContext'

const Home = () => {
  const { logout, userData } = useAuth()
  console.log(userData)

  // Format date for better display
  const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className='min-h-screen bg-gray-100 flex items-center justify-center p-4'>
      <div className='w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden'>
        {/* Header with photo */}
        <div className='bg-gradient-to-r from-blue-500 to-indigo-600 p-6 flex flex-col items-center'>
          <div className='w-24 h-24 rounded-full border-4 border-white overflow-hidden mb-4'>
            <img
              src={userData?.photoURL}
              alt={userData?.displayName}
              referrerPolicy='no-referrer'
              className='w-full h-full object-cover'
            />
          </div>
          <h2 className='text-xl font-bold text-white'>
            {userData?.displayName}
          </h2>
          <p className='text-blue-100'>{userData?.email}</p>
        </div>

        {/* Details section */}
        <div className='p-6'>
          <div className='space-y-4'>
            <div className='border-b pb-4'>
              <h3 className='text-sm uppercase text-gray-500 font-semibold'>
                Account Information
              </h3>
              <p className='mt-2 text-sm text-gray-600'>
                <span className='font-medium'>Joined:</span>{' '}
                {formatDate(userData?.metadata?.creationTime)}
              </p>
              <p className='mt-1 text-sm text-gray-600'>
                <span className='font-medium'>Last Login:</span>{' '}
                {formatDate(userData?.metadata?.lastSignInTime)}
              </p>
            </div>

            <div className='border-b pb-4'>
              <h3 className='text-sm uppercase text-gray-500 font-semibold'>
                Login Method
              </h3>
              <div className='mt-2 flex items-center'>
                <svg
                  className='w-5 h-5 text-red-500 mr-2'
                  fill='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path d='M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032 s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2 C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z' />
                </svg>
                <span className='text-sm text-gray-700'>Google</span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className='mt-6 w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition duration-300 flex items-center justify-center'
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
    </div>
  )
}

export default Home
