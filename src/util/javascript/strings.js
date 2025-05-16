// ensureString takes a parameter and makes sure it's a string. If not, it throws an error. If the second parameter (nonEmpty) is set to true, it must also be non-empty.
export function ensureString(str, nonEmpty = false) {
	if (typeof str !== 'string')
		throw new Error(`Invalid parameter: expected a string but received "${JSON.stringify(str)}".`)
	if (nonEmpty && str === '')
		throw new Error(`Invalid parameter: expected a non-empty string but received an empty one.`)
	return str
}
