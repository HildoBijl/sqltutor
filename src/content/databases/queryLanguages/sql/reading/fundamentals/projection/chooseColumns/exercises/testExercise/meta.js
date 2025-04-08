export const meta = {
	version: 1,
}

export function generateState() {
	return { number: Math.round(Math.random() * 20 + 20) }
}

export function checkInput(state, input) {
	return state.number.toString() === input
}
