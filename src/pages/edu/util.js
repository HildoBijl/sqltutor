import { useParams } from 'react-router-dom'

import { components } from 'edu'

// tabs indicates which tabs can be shown.
export const tabs = [
	{
		url: 'story',
		component: 'Story',
		title: 'Story',
	},
	{
		url: 'theory',
		component: 'Theory',
		title: 'Theory',
	},
	{
		url: 'exercises',
		component: 'Exercises',
		title: 'Exercises',
	},
	{
		url: 'dataexplorer',
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

// useUrlTab gets the tab from the URL if it is given. It enforces it to be lower case.
export function useUrlTab() {
	const { tab } = useParams()
	return tab?.toLowerCase()
}
