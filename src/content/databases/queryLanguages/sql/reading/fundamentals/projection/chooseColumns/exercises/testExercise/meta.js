import { selectRandomly } from 'util'

export const meta = {
	version: 1,
}

export function generateState({ database }) {
	const allCompanyNames = database.exec('SELECT company_name FROM companies')[0].values.map(x => x[0])
	const randomCompany = selectRandomly(allCompanyNames)
	console.log('Random company: ' + randomCompany)
	return { number: Math.round(Math.random() * 20 + 20) }
}

export function checkInput(state, input) {
	return state.number.toString() === input
}
