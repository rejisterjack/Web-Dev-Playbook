import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth()
  return currentUser ? children : <Navigate to='/login' replace={true} />
}

export default ProtectedRoute
