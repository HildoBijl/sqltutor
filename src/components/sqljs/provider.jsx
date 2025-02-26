import { useState, useEffect } from 'react'
import initSqlJs from 'sql.js'

import { SQLJSContext } from './context'

export function SQLJSProvider({ children }) {
	const [error, setError] = useState()
	const [SQLJS, setSQL] = useState()

	// On rendering, initialize SQL.JS.
	useEffect(() => {
		const initialize = async () => {
			try {
				const SQL = await initSqlJs({ locateFile: file => `https://sql.js.org/dist/${file}` }) // ToDo: check if the locatefile can be removed in Node, as promised.
				setSQL(SQL)
			} catch (error) {
				setError(error)
			}
		}
		initialize()
	})

	// Set up the context with its contents.
	return <SQLJSContext.Provider value={{ SQLJS, error }}>
		{children}
	</SQLJSContext.Provider>
}
