import { useParams } from 'react-router-dom'

import { components } from 'edu'

// tabs indicates which tabs can be shown and which corresponding Module component should be rendered for it.
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
		url: 'dataExplorer',
		component: 'DataExplorer',
		title: 'Data explorer',
	},
]

// useComponent gets the componentId from the URL and loads the component from it. It also compensates for issues in the case of the given parameter.
export function useComponent() {
	const { componentId } = useParams()
	const component = components[componentId] || Object.values(components).find(component => component.id.toLowerCase() === componentId.toLowerCase())
	if (!component)
		throw new Error(`Invalid componentId: the componentId "${componentId}" is not known.`)
	return component
}

// useUrlTab gets the tab from the URL if it is given. It enforces it to be lower case.
export function useUrlTab() {
	const { tab } = useParams()
	return tab?.toLowerCase()
}
