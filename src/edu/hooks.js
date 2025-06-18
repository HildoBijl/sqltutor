import { useParams } from 'react-router-dom'

import { useLocalStorageState } from 'components'

import { components } from './skillTree'

// useComponent gets the componentId from the URL and loads the component from it. It also compensates for issues in the case of the given parameter.
export function useComponent() {
	const { componentId } = useParams()
	const component = components[componentId] || Object.values(components).find(component => component.id.toLowerCase() === componentId.toLowerCase())
	if (!component)
		throw new Error(`Invalid componentId: the componentId "${componentId}" is not known.`)
	return component
}

// useComponentState gives the componentState (conceptState, skillState) for a given component.
export function useComponentState(componentId) {
	return useLocalStorageState(`component-${componentId}`, { id: componentId })
}
