import React from 'react'
import { useAuth } from '../context/AuthContext'

const Home = () => {
  const { logout } = useAuth()
  return (
    <div>
      <p>Home</p>
      <p>Welcome to the home page!</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}

export default Home
