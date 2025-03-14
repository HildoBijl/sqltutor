import { Link } from 'react-router-dom'

import { Subpage } from 'components'
import * as content from 'content'

import { tabs, useComponent, usePage } from './util'

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
	// Determine the tab matching the URL.
	const page = usePage()
	const tab = tabs.find(tab => tab.url === page)
	if (!page || !tab)
		return <Subpage><p>No tab has been defined yet in the URL. Specifically, try the <Link to={`/c/${component.id}/story`}>Story</Link> and the <Link to={`/c/${component.id}/theory`}>Theory</Link> pages.</p></Subpage>

	// Determine the content component to be displayed.
	const Content = module[tab.component]
	if (!Content)
		return <Subpage><p>The given page has not been defined yet.</p></Subpage>

	// Render the respective component.
	return <Subpage>
		<p>This will be a page for concepts/skills. Specifically, this is the page for the {component.type} {component.name}, tab {tab.title}.</p>
		<Content />
	</Subpage>
}

// ComponentTitle shows the title for a given educational component. It can be used in the Header bar.
export function ComponentTitle() {
	const component = useComponent()
	return <>{component.name}</>
}
