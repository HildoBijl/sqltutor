import { useParams } from 'react-router-dom'

import { Subpage } from 'components'
import { components } from 'edu'

export function Component() {
	const { componentId } = useParams()
	if (!components[componentId])
		throw new Error(`Invalid componentId: the componentId "${componentId}" is not known.`)
	const component = components[componentId]
	return <Subpage>
		<p>This will be a page for concepts/skills. Specifically, this is the page for the {component.type} {component.name}.</p>
	</Subpage>
}

export function ComponentTitle() {
	const { componentId } = useParams()
	if (!components[componentId])
		throw new Error(`Invalid componentId: the componentId "${componentId}" is not known.`)
	const component = components[componentId]
	return <>{component.name}</>
}
