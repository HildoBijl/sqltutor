import { useParams } from 'react-router-dom'

import { components } from 'edu'

// tabs indicates which tabs can be shown.
export const tabs = [
	{
		component: 'Story',
		title: 'Story',
	},
	{
		component: 'Theory',
		title: 'Theory',
	},
	{
		component: 'Exercises',
		title: 'Exercises',
	},
	{
		component: 'DataExplorer',
		title: 'Data explorer',
	},
]

// useComponent gets the componentId from the URL and loads the component from it.
export function useComponent() {
	const { componentId } = useParams()
	if (!components[componentId])
		throw new Error(`Invalid componentId: the componentId "${componentId}" is not known.`)
	return components[componentId]
}

// usePage gets the page from the URL if it is given.
export function usePage() {
	const { page } = useParams()
	return page
}
