export function firstOf(array) {
	return array[0]
}

export function lastOf(array) {
	return array[array.length - 1]
}

export function selectRandomly(array) {
	return array[Math.floor(Math.random()*array.length)]
}
