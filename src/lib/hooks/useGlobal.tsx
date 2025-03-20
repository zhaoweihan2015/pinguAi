"use client"

import { createContext, useContext, useState } from 'react'

interface GlobalContextType {
    activeKey: string
    updateActiveKey: (key: string) => void
}

const GlobalContext = createContext<GlobalContextType>({
    activeKey: '',
    updateActiveKey: () => {}
})

export const GlobalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeKey, setActiveKey] = useState('')

  function updateActiveKey(key: string) {
    setActiveKey(key)
  }
  
  const globalState: GlobalContextType = {
    activeKey,
    updateActiveKey
  }
  
  return (
    <GlobalContext.Provider value={globalState}>
      {children}
    </GlobalContext.Provider>
  )
}

export const useGlobalState = () => {
  return useContext(GlobalContext)
}