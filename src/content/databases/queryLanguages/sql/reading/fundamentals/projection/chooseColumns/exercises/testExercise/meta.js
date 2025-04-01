export const meta = {
	version: 1,
}

export function generateState() {
	return { test: Math.round(Math.random() * 20 + 20) }
}
