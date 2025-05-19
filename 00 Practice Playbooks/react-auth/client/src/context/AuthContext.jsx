import React, { useContext, createContext, useState, useEffect } from 'react'
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signOut,
} from 'firebase/auth'
import { auth } from '../config/firebase.config'
import { validateToken } from '../api'

const AuthContext = createContext()

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)

  const providerGoogle = new GoogleAuthProvider()

  const loginWithEmailPassword = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password)
  }
  const loginWithGoogle = async () => {
    return await signInWithRedirect(auth, providerGoogle)
  }
  const logout = async () => {
    return await signOut(auth)
  }
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const data = await validateToken()
        setCurrentUser(user)
        setUserData(data)
      } else {
        setUserData(null)
        setCurrentUser(null)
      }
      setLoading(false)
    })
    return () => unsubscribe()
  }, [])

  const value = {
    currentUser,
    userData,
    loginWithEmailPassword,
    loginWithGoogle,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}
