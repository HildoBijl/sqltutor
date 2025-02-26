import { useState, useCallback, useEffect } from 'react'

import { useSQLJSContext } from './context'

// useSQLJS returns the SQLJS object if it's been loaded and otherwise gives undefined.
export function useSQLJS() {
	return useSQLJSContext().SQLJS
}

// useSQLJSError returns the error that occurred on loading SQL.JS and otherwise (on no error) returns undefined.
export function useSQLJSError() {
	return useSQLJSContext().error
}

// useDatabase gives [database, resetDatabase] where database is an SQL.JS database object. It initializes it with the given set-up query. It also provides a reset function, which (when called) will throw out the database and generate a new one.
export function useDatabase(setup) {
	const SQLJS = useSQLJS()
	const [database, setDatabase] = useState()

	// Set up a handler that sets up and stores a new database (possibly overwriting an existing one).
	const resetDatabase = useCallback(() => {
		if (SQLJS) {
			const database = new SQLJS.Database()
			if (setup)
				database.run(setup)
			setDatabase(database)
		}
	}, [SQLJS, setup])

	// When the SQLJS object first loads, set up the database.
	useEffect(() => {
		if (SQLJS && !database)
			resetDatabase()
	}, [SQLJS, database, resetDatabase])

	// Return the database with its reset handler.
	return [database, resetDatabase]
}

// useQuery takes a database and a select-query and runs the query. It returns an object { result, error, loading, update } where one of the parameters result and error is undefined (or both when the database isn't set up yet). When the query changes, the result is updated. However, when the data in the database changes which affects the query results, then this is not detected. In this case the update function may be called to manually update the query.
export function useQuery(database, query) {
	const [error, setError] = useState()
	const [result, setResult] = useState()

	// Set up a handler to run the query.
	const update = useCallback(() => {
		if (!database)
			return
		try {
			const result = database.exec(query)
			setResult(result)
			setError()
		} catch (error) {
			setError(error)
			setResult()
		}
	}, [database, query, setError, setResult])

	// When the query changes, rerun it on the database.
	useEffect(() => {
		update()
	}, [update, query])

	// Return the outcome.
	const loading = !result && !error
	return { result, error, loading, update }
}
