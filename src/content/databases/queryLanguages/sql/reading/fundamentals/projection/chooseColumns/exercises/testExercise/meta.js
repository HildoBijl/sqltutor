export const meta = {
	version: 1,
}

export function generateState() {
	return { number: Math.round(Math.random() * 20 + 20) }
}
