import { createContext, useContext } from 'react'

export const SkillDatabaseContext = createContext({})

export function useSkillDatabaseContext() {
	return useContext(SkillDatabaseContext)
}
