import { useEffect, useCallback, useMemo } from 'react'

import { keysToObject, deepEquals, ensureConsistency, setLocalStorageValue, useLatest, useConsistentValue } from 'util'

import { useLocalStorageContext } from './context'

// useLocalStorageValue returns the value of a localStorage object. If no keys are given, the full localStorage object is returned. If one key is given (a string) then the corresponding value is returned. If an array of keys are given, an object is assembled with those keys.
export function useLocalStorageValue(keys) {
	const { localStorage } = useLocalStorageContext()

	// On an array, assemble the corresponding object.
	const assembledObject = useMemo(() => {
		if (!Array.isArray(keys))
			return undefined
		return keysToObject(keys, key => (localStorage && localStorage[key]))
	}, [localStorage, keys])
	const consistentAssembledObject = useConsistentValue(assembledObject)

	// On an array, return the given object.
	if (Array.isArray(keys))
		return consistentAssembledObject

	// On no keys, return everything.
	if (!keys)
		return localStorage

	// On a single string key, return that value.
	if (typeof key === 'string')
		return localStorage && localStorage[keys]

	// Unknown case.
	throw new Error(`Invalid useLocalStorage call: expected either no keys, a single key (string) or a list of keys (array) but received an argument of type "${typeof keys}".`)
}

// useLocalStorageState is like useState, but it then tracks the property in localStorage too. Upon saving, it stores to localStorage. Upon initializing, it tries to get the value back from localStorage.
export function useLocalStorageState(key, initialValue) {
	const { initialized, localStorage, setLocalStorage } = useLocalStorageContext()
	const initialValueRef = useLatest(initialValue)

	// Set up a setter that sends the new value to the appropriate places.
	const setState = useCallback(newState => {
		setLocalStorage(oldLocalStorage => {
			// Find the new state value.
			let oldState = oldLocalStorage && oldLocalStorage[key] || initialValueRef.current
			if (typeof newState === 'function')
				newState = newState(oldState)

			// On no change, ignore.
			if (deepEquals(oldState, newState))
				return oldLocalStorage
			newState = ensureConsistency(newState, oldState)

			// On a change, set it in the localStorage and in our own state (by returning the appropriate assembled object).
			setLocalStorageValue(key, newState)
			return { ...(oldLocalStorage || {}), [key]: newState }
		})
	}, [key, setLocalStorage, initialValueRef])

	// Upon loading, when the initial value is not yet in the localStorage, put it in there.
	useEffect(() => {
		if (initialized && localStorage[key] === undefined && initialValue !== undefined)
			setState(initialValue)
	}, [initialized, localStorage, key, initialValue, setState])

	// Return the appropriate tuple.
	let state = (localStorage && localStorage[key])
	state = (state !== undefined ? state : initialValue)
	return [state, setState]
}

// useLocalStorageStateParameter is like useState, but it uses one parameter within a localStorage object.
export function useLocalStorageStateParameter(key, objectKey, initialValue, initialObjectValue = {}) {
	const [state, setState] = useLocalStorageState(key, { ...initialObjectValue, [objectKey]: initialValue })

	// Set up a setter for the respective parameter.
	const setParameter = useCallback(newParameter => {
		setState(state => {
			let oldParameter = state && state[objectKey]
			if (typeof newParameter === 'function')
				newParameter = newParameter(oldParameter)
			if (deepEquals(oldParameter, newParameter))
				return state
			return { ...state, [objectKey]: newParameter }
		})
	}, [objectKey, setState])

	// Return the value and the setter as a tuple, as usual.
	let parameter = state[objectKey]
	parameter = (parameter !== undefined ? parameter : initialValue)
	return [parameter, setParameter]
}

// useIsLocalStorageInitialized returns true or false: whether the localStorage has been initialized already.
export function useIsLocalStorageInitialized() {
	return useLocalStorageContext().initialized
}
