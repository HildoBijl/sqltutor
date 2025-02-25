import { createContext, useContext } from 'react'

export const DatabaseContext = createContext({})

export function useDatabaseContext() {
	return useContext(DatabaseContext)
}
