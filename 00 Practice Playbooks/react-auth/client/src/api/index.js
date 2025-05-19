import axios from 'axios'
import { auth } from '../config/firebase.config'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export const validateToken = async () => {
  const user = auth.currentUser
  if (user) {
    const token = await user.getIdToken()
    const response = await api.post(
      '/validateToken',
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return response.data
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}
