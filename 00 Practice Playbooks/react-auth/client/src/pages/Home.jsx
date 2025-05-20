import React from 'react'
import { useAuth } from '../context/AuthContext'

const Home = () => {
  const { logout, userData } = useAuth()
  console.log(userData)
  return (
    <header className='w-full flex items-center justify-center'>
      <div className='w-full md:w-3/4 p-3 bg-gray-100 rounded-lg flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <p>{userData?.displayName}</p>
          <p>{userData?.email}</p>
          <button
            onClick={logout}
            className='bg-gray-100 shadow-md rounded-md py-2 px-4 cursor-pointer'
          >
            Logout
          </button>
        </div>
        <div className='flex items-center justify-center'>
          <div className='w-12 h-12 rounded-full relative cursor-pointer'>
            <img
              src={userData?.photoURL}
              alt=''
              referrerPolicy='no-referrer'
              className='w-full h-full object-cover rounded-full'
            />
          </div>
        </div>
      </div>
    </header>
  )
}

export default Home
