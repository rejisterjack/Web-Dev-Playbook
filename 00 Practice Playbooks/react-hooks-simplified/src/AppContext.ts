import { createContext } from 'react'
import type { Data } from './App'

export type AppContextType = {
  data: Data
  setData: React.Dispatch<React.SetStateAction<Data>>
}

export const AppContext = createContext<AppContextType | undefined>(undefined)
