import { applyMapping } from '../javascript'

// getLocalStorage returns the full localStorage object.
export function getLocalStorage() {
	return applyMapping({ ...localStorage }, value => processLocalStorageValue(value))
}

// getLocalStorageValue reads an item from localStorage and attempts to parse it. A back-up value can be given to be used upon no entry.
export function getLocalStorageValue(key, backup) {
	return processLocalStorageValue(localStorage.getItem(key), backup)
}

// processLocalStorageValue takes a value from localStorage and puts it back into Javascript form.
export function processLocalStorageValue(value, backup) {
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
