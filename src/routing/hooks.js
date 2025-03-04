import { useMatches } from 'react-router-dom'

import { routes } from './routes'

export function useCurrentRoutes() {
	const matches = useMatches()
	const path = matches[matches.length - 1].id.split('-')
	const currentRoutes = []
	let currentRoute
	path.forEach((child, index) => {
		if (index === 0)
			currentRoute = routes[parseInt(child)]
		else
			currentRoute = currentRoute.children[parseInt(child)]
		currentRoutes.push(currentRoute)
	})
	return currentRoutes
}

export function useCurrentRoute() {
	const currentRoutes = useCurrentRoutes()
	return currentRoutes[currentRoutes.length - 1]
}
