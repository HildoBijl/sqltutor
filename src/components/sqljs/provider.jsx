import { useState, useEffect } from 'react'
import initSqlJs from 'sql.js'

import { SQLJSContext } from './context'

export function SQLJSProvider({ children }) {
	const [SQLJS, setSQLJS] = useState()
	const [error, setError] = useState()

	// On rendering, initialize SQL.JS.
	useEffect(() => {
		const initialize = async () => {
			try {
				const SQLJS = await initSqlJs({ locateFile: file => `./node_modules/sql.js/dist/${file}` })
				setSQLJS(SQLJS)
			} catch (error) {
				setError(error)
			}
		}
		initialize()
	}, [])

	// Set up the context with its contents.
	return <SQLJSContext.Provider value={{ SQLJS, error }}>
		{children}
	</SQLJSContext.Provider>
}
