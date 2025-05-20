import React from 'react'
import { useAuth } from '../context/AuthContext'

const Home = () => {
  const { logout, userData } = useAuth()
  console.log(userData)
  return (
    <div>
      <p>Home</p>
      <p>Welcome to the home page!</p>
      <button onClick={logout}>Logout</button>
      <header className='w-full flex items-center justify-center'>
        <div className='w-full md:w-3/4 p-3 bg-gray-100 rounded-lg flex items-center justify-between'>
          <p>rejisterjack</p>
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
    </div>
  )
}

export default Home
