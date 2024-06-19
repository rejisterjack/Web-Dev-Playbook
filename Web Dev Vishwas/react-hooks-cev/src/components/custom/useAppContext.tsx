import { createContext, useContext, useState } from "react"

const AppContext = createContext(null)

export const AppProvider = ({ children }:{children:React.ReactNode}) => {
  const [data, setData] = useState()

  return (
    <AppContext.Provider value={{ data, setData }}>
      {children}
    </AppContext.Provider>
  )
}

export const useAppContext = () => {
  return useContext(AppContext)
}
