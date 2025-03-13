import { useState, useEffect } from 'react'

import { Subpage } from 'components'

import { useComponent, usePage } from './util'

// Component shows an educational component like a concept or a skill. This includes the tabs for "Theory", "Exercise" etcetera. It loads the contents dynamically.
export function Component() {
	const component = useComponent()

	// Create a state for the dynamically loaded contents to be rendered.
	const [importedComponentId, setImportedComponentId] = useState()
	const [importedComponent, setImportedComponent] = useState()
	const [error, setError] = useState()

	// On a change in the component, reload its contents.
	useEffect(() => {
		const importComponent = async () => {
			try {
				const module = await import(/* @vite-ignore */ `./${component.path.join('/')}/`)
				console.log(module)
				window.m = module
				setImportedComponent(module)
				setImportedComponentId(component.id)
			} catch (error) {
				console.log(error)
				window.e = error
				setError(error)
			}
		}
		importComponent()
	}, [component])

	// If there was an error while loading the module, show it.
	if (error)
		return <Subpage>
			<p>Oops ... something went long while load the page contents.</p>
			<p>Please check your connection and/or refresh the page to see if that fixes the issue.</p>
		</Subpage>

	// If the module hasn't loaded yet, or is outdated, show a loading message.
	if (!importedComponent || importedComponentId !== component.id)
		return <Subpage><p>Loading contents...</p></Subpage>

	// Render the component using the given module.
	return <ComponentFromModule {...{ component, module: importedComponent }} />
}

// ComponentFromModule shows a component, but then based on a given module that has already been loaded.
export function ComponentFromModule({ component, module }) {
	const { Story, Theory } = module

	// ToDo: dynamically walk through the tabs (from the util) and see which ones appear. Set up the actual physical tabs for it.
	const page = usePage()
	console.log(page)

	return <Subpage>
		<p>This will be a page for concepts/skills. Specifically, this is the page for the {component.type} {component.name}.</p>
		{Story ? <Story /> : null}
		{Theory ? <Theory /> : null}
	</Subpage>
}

// ComponentTitle shows the title for a given educational component. It can be used in the Header bar.
export function ComponentTitle() {
	const component = useComponent()
	return <>{component.name}</>
}
