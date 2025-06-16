import { useState, useEffect } from 'react'

import { getLocalStorage } from 'util'

import { LocalStorageContext } from './context'

// The LocalStorageManager is a layer between the localStorage API and React. It puts the localStorage in a state, so that whenever a component changes the localStorage, other components are also updated. It also allows for easier loading of multiple localStorage keys.
export function LocalStorageManager({ children }) {
	const [localStorage, setLocalStorage] = useState({})
	const [initialized, setInitialized] = useState(false)

	// Upon loading the page, load in the current localStorage.
	useEffect(() => {
		if (!initialized) {
			setInitialized(true)
			setLocalStorage(localStorage => ({ ...(localStorage || {}), ...getLocalStorage() }))
		}
	}, [initialized, setInitialized, setLocalStorage])

	// Set up the context with its contents.
	return <LocalStorageContext.Provider value={{ initialized, localStorage: localStorage || {}, setLocalStorage }}>
		{children}
	</LocalStorageContext.Provider>
}
