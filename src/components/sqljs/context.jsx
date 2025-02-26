import { createContext, useContext } from 'react'

export const SQLJSContext = createContext({})

export function useSQLJSContext() {
	return useContext(SQLJSContext)
}
