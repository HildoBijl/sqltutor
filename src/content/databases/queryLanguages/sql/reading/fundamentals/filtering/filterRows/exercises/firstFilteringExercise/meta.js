import { selectRandomly } from 'util'

export const meta = {
	version: 1,
}

export function generateState({ database }) {
	const allCountries = database.exec('SELECT DISTINCT country FROM companies')[0].values.map(x => x[0])
	return selectRandomly(allCountries)
}

export function checkInput(state, input, { database }) {
	return state.number.toString() === input
}
