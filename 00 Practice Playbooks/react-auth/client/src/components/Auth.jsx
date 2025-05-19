import React, { useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Auth = () => {
  const { loginWithGoogle, currentUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (currentUser) {
      navigate('/', { replace: true })
    }
  }, [currentUser, navigate])

  const handleGoogleLogin = () => {
    loginWithGoogle()
      .then((res) => {
        console.log(res)
      })
      .catch((err) => {
        console.log(err)
      })
  }
  return (
    <div className='w-screen h-screen flex items-center justify-center p-4'>
      <div className=' w-full md:w-3/4 border border-gray-100 shadow-md rounded-md p-4 space-y-4 text-center'>
        <h2 className='text-3xl tracking-wide font-semibold text-gray-700'>
          Welcome Back
        </h2>
        <div className=' w-full flex flex-col items-center justify-start gap-6'>
          <input
            className=' w-full h-16 rounded-md outline-none border border-gray-500 p-2 px-8 text-lg font-semibold text-gray-600'
            type='email'
            name='email'
            id='email'
            placeholder='Email'
          />
          <input
            className=' w-full h-16 rounded-md outline-none border border-gray-500 p-2 px-8 text-lg font-semibold text-gray-600'
            type='password'
            name='password'
            id='password'
            placeholder='Password'
          />
        </div>
        <div className='flex flex-center justify-center w-full'>
          <button
            type='button'
            className='p-3 bg-purple-500 rounded-md w-full text-white hover:bg-purple-600 hover:shadow-md transition cursor-pointer'
          >
            Login
          </button>
        </div>
        <div className='flex items-center justify-center w-full gap-6 mt-12'>
          <div className='w-full md:w-64 h-[1px] rounded-md bg-gray-200'></div>
          <p>or</p>
          <div className='w-full md:w-64 h-[1px] rounded-md bg-gray-200'></div>
        </div>
        <div
          className='w-full p-3 bg-gray-50 flex items-center justify-center  rounded-md outline-none cursor-pointer hover:bg-gray-100 shadow-sm transition'
          onClick={handleGoogleLogin}
        >
          Signin With Google
        </div>
      </div>
    </div>
  )
}

export default Auth
