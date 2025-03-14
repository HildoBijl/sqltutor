import { Subpage } from 'components'
import * as content from 'content'

import { useComponent, usePage } from './util'

// Component shows an educational component like a concept or a skill. This includes the tabs for "Theory", "Exercise" etcetera. It loads the contents dynamically.
export function Component() {
	const component = useComponent()

	// Extract the corresponding module.
	const module = content[component.id]
	if (!module)
		throw new Error(`Missing component contents: the component "${component.id}" does not seem to have contents yet. Make sure this concept/skill has its parts properly exported.`)

	// Render the component using the given module.
	return <ComponentFromModule {...{ component, module }} />
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
