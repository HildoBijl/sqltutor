export function keysToObject(keys, func) {
	const result = {}
	keys.forEach((key, index) => {
		result[key] = func(key, index)
	})
	return result
}
