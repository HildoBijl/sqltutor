import { useState, useEffect } from 'react'

import { Subpage } from 'components'

import { useComponent } from './util'

export function Component() {
	const component = useComponent()

	// Create a state for the dynamically loaded contents to be rendered.
	const [importedComponentId, setImportedComponentId] = useState(null)
	const [importedComponent, setImportedComponent] = useState(null)

	// On a change in the component, reload its contents.
	useEffect(() => {
		const importComponent = async () => {
			const module = await import(/* @vite-ignore */ `./${component.path.join('/')}/`)
			setImportedComponent(module)
			setImportedComponentId(component.id)
		}
		importComponent()
	}, [component])

	// If the module hasn't loaded yet, or is outdated, show a loading message.
	if (!importedComponent || importedComponentId !== component.id)
		return <Subpage><p>Loading contents...</p></Subpage>

	// Render the component using the given module.
	return <ComponentFromModule {...{ component, module: importedComponent }} />
}

export function ComponentFromModule({ component, module }) {
	const { Story, Theory } = module

	return <Subpage>
		<p>This will be a page for concepts/skills. Specifically, this is the page for the {component.type} {component.name}.</p>
		{Story ? <Story /> : null}
		{Theory ? <Theory /> : null}
	</Subpage>
}

export function ComponentTitle() {
	const component = useComponent()
	return <>{component.name}</>
}
