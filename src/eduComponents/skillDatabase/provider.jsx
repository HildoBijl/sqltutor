import { useState } from 'react'

import { SkillDatabaseContext } from './context'

export function SkillDatabaseProvider({ children }) {
	// Set up a whole collection of databases: four sets of databases (one for play/test and one for small/large) which each have a database for each skill.
	const [skillDatabaseCollection, setSkillDatabaseCollection] = useState([[{}, {}], [{}, {}]])

	// Set up the context with its contents.
	return <SkillDatabaseContext.Provider value={{ skillDatabaseCollection, setSkillDatabaseCollection }}>
		{children}
	</SkillDatabaseContext.Provider>
}
