import { useCallback, useEffect } from 'react'

import { useLatest } from 'util'
import * as content from 'content'

import { useSQLJS, getDatabase } from '../../components/sqljs'

import { useSkillDatabaseContext } from './context'

// useSkillDatabase gets the database for a specific skill (and for specific settings) and returns it. If it doesn't exist yet, it checks if it should exist and if so creates it.
export function useSkillDatabase(skillId, test = false, large = false) {
	const SQLJS = useSQLJS()
	const SQLJSRef = useLatest(SQLJS)

	// Set up a handler that resets the database in the memory
	const { skillDatabaseCollection, setSkillDatabaseCollection } = useSkillDatabaseContext()
	const resetDatabase = useCallback(() => {
		// If there is no SQLJS or no database set-up, we cannot set up the database yet.
		const SQLJS = SQLJSRef.current
		const skillModule = content[skillId]
		const databaseSetup = skillModule.database || skillModule[large ? 'largeDatabase' : 'smallDatabase']
		if (!SQLJS || !databaseSetup)
			return

		// Set up the database and save it. To do so, first clone the databaseCollection as object, and then apply the database at the right place.
		setSkillDatabaseCollection(skillDatabaseCollection => {
			skillDatabaseCollection = skillDatabaseCollection.map(skillDatabaseSubcollection => skillDatabaseSubcollection.map(skillDatabaseSet => skillDatabaseSet))
			const skillDatabaseSet = getSkillDatabaseSet(skillDatabaseCollection)
			skillDatabaseCollection[test ? 1 : 0][large ? 1 : 0] = {
				...skillDatabaseSet,
				[skillId]: getDatabase(SQLJS, databaseSetup),
			}
			return skillDatabaseCollection
		})
	}, [skillId, test, large, setSkillDatabaseCollection, SQLJSRef])

	// Load in the database.
	const skillDatabaseSet = getSkillDatabaseSet(skillDatabaseCollection, test, large)
	const database = skillDatabaseSet[skillId]

	// Add an effect that ensures that, as soon as SQLJS loads, that the database will be set up.
	useEffect(() => {
		if (SQLJS && !database)
			resetDatabase()
	}, [SQLJS, database, resetDatabase])

	// Return the database with its reset handler.
	return [database, resetDatabase]
}

// getSkillDatabaseSet takes a skillDatabaseCollection and, based on various settings, returns the skillDatabaseSet for all skills.
export function getSkillDatabaseSet(skillDatabaseCollection, test = false, large = false) {
	return skillDatabaseCollection[test ? 1 : 0][large ? 1 : 0]
}
