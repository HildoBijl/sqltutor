import { createContext, useContext } from 'react'

export const LocalStorageContext = createContext({})

export function useLocalStorageContext() {
	return useContext(LocalStorageContext)
}
