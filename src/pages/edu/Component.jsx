import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Box from '@mui/material/Box'

import { firstOf } from 'util'
import { Subpage, Container } from 'components'
import * as content from 'content'

import { tabs, useComponent, useUrlTab } from './util'

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
	// Filter the tabs contained in this module.
	const shownTabs = tabs.filter(tab => module[tab.component])

	// When the module is empty, show a note.
	if (shownTabs.length === 0)
		return <Subpage><p>Content for the {component.type} <strong>{component.name}</strong> is still under development. Come back later!</p></Subpage>

	// If there is only one tab present in the module, show this page without showing tabs.
	if (shownTabs.length === 1) {
		const Content = module[firstOf(shownTabs).component]
		return <Subpage><Content /></Subpage>
	}

	// When there are multiple pages, show tabs that manage the component within it.
	return <TabbedComponent {...{ component, module, shownTabs }} />
}

// TabbedComponent takes a component and shows tabs above it.
export function TabbedComponent({ component, module, shownTabs }) {
	const theme = useTheme()
	const navigate = useNavigate()

	// Check the URL and set up the active tab based on it. (The URL of the tab is used as indicator.)
	const urlTab = useUrlTab()
	const [tab, setTab] = useState(shownTabs.find(tab => tab.url === urlTab)?.url || firstOf(shownTabs).url)
	const updateTab = (event, newTab) => setTab(shownTabs[newTab].url)

	// When the URL changes, update the tab accordingly.
	useEffect(() => {
		setTab(oldTab => shownTabs.find(tab => tab.url === urlTab)?.url || oldTab)
	}, [urlTab, shownTabs, setTab])

	// When the tab does not reflect the URL, update the URL.
	useEffect(() => {
		if (urlTab !== tab)
			navigate(`/c/${component.id}/${tab}`, { replace: true })
	}, [navigate, urlTab, tab, component])

	// Determine info about what needs to be shown.
	const currTab = shownTabs.find(shownTab => shownTab.url === tab)
	const tabIndex = shownTabs.indexOf(currTab)
	const Content = module[currTab.component]

	// Render the contents, with the tabs first and the page after.
	return <>
		<Box sx={{ background: theme.palette.secondary.main }}>
			<Container>
				<Tabs value={tabIndex} onChange={updateTab} variant="fullWidth">
					{shownTabs.map(tab => <Tab key={tab.url} label={tab.title} sx={{ color: theme.palette.secondary.contrastText }} />)}
				</Tabs>
			</Container>
		</Box>
		<Subpage>
			<Content />
		</Subpage>
	</>
}

// ComponentTitle shows the title for a given educational component. It can be used in the Header bar.
export function ComponentTitle() {
	const component = useComponent()
	return <>{component.name}</>
}
