import { useState, useCallback } from 'react'

// getLocalStorageValue reads an item from localStorage and attempts to parse it. A back-up value can be given to be used upon no entry.
export function getLocalStorageValue(key, backup) {
	const value = localStorage.getItem(key)
	if (value === undefined || value === null)
		return backup !== undefined ? backup : undefined
	return JSON.parse(value)
}

// setLocalStorageValue saves an item to localStorage as JSON.
export function setLocalStorageValue(key, value) {
	if (value === undefined || value === null)
		return clearLocalStorageValue(key)
	return localStorage.setItem(key, JSON.stringify(value))
}

// clearLocalStorageValue removes a value from localStorage.
export function clearLocalStorageValue(key) {
	return localStorage.removeItem(key)
}

// getLocalStorageSubValue reads a parameter of a JSON object stored in localStorage.
export function getLocalStorageSubValue(key, param, backup) {
	const obj = getLocalStorageValue(key, {})
	const value = obj[param]
	return value === undefined ? backup : value
}

// clearLocalStorageSubValue takes an object in localStorage and removes one parameter.
export function clearLocalStorageSubValue(key, param) {
	const oldValue = getLocalStorageValue(key)
	const newValue = { ...oldValue }
	delete newValue[param]
	if (Object.keys(newValue).length === 0)
		return localStorage.removeItem(key)
	setLocalStorageValue(key, newValue)
}

// useLocalStorageState is like useState, but it then tracks the property in localStorage too. Upon saving, it stores to localStorage. Upon initializing, it tries to get the value back from localStorage.
export function useLocalStorageState(key, initialValue) {
	// Set up a state that tracks the local storage.
	const storedState = getLocalStorageValue(key, initialValue)
	const [state, setState] = useState(storedState)

	// Expand the setState to also store state updates.
	const expandedSetState = useCallback((newState) => {
		setState(() => {
			const oldState = getLocalStorageValue(key, initialValue) // Always get the last entry from localStorage.
			if (typeof newState === 'function')
				newState = newState(oldState)
			setLocalStorageValue(key, newState)
			return newState
		})
	}, [key, initialValue, setState])

	// Add a clear function to get rid of the local storage and go back to the initial value.
	const clearState = useCallback(() => {
		clearLocalStorageValue(key)
		setState(initialValue)
	}, [key, initialValue])

	// Return the tuple.
	return [state, expandedSetState, clearState]
}

// useLocalStorageSubState is like useLocalStorageState. Key difference is that this subState function uses one LocalStorage parameter (indicated by the key) with multiple state parameters (indicated by the param).
export function useLocalStorageSubState(key, param, initialValue) {
	// Set up a state that tracks the local storage.
	const storedValue = getLocalStorageSubValue(key, param)
	const [subState, setSubState] = useState(storedValue === undefined ? initialValue : storedValue)

	// Expand the setSubState to also store state updates.
	const expandedSetSubState = useCallback((newSubState) => {
		setSubState(() => {
			const oldState = getLocalStorageValue(key, {})
			let oldSubState = oldState[param]
			if (oldSubState === undefined)
				oldSubState = initialValue
			if (typeof newSubState === 'function')
				newSubState = newSubState(oldSubState)
			const newState = { ...oldState, [param]: newSubState }
			setLocalStorageValue(key, newState)
			return newSubState
		})
	}, [key, param, initialValue, setSubState])

	// Add a clear function to get rid of the local storage substate and go back to the initial value.
	const clearState = useCallback(() => {
		clearLocalStorageSubValue(key, param)
		setSubState(initialValue)
	}, [key, param, initialValue])

	// Return the tuple.
	return [subState, expandedSetSubState, clearState]
}