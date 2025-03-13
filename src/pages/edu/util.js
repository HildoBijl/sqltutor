import { useParams } from 'react-router-dom'

import { components } from 'edu'

// useComponent gets the componentId from the URL and loads the component from it.
export function useComponent() {
	const { componentId } = useParams()
	if (!components[componentId])
		throw new Error(`Invalid componentId: the componentId "${componentId}" is not known.`)
	return components[componentId]
}
