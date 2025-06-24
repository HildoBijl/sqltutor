import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '@mui/material/styles'
import { Tabs, Tab, Box } from '@mui/material'

import { firstOf, useWindowSize } from 'util'
import { Subpage, Container, useLocalStorageStateParameter, useIsLocalStorageInitialized } from 'components'
import { useComponent } from 'edu'
import * as content from 'content'
import { ExercisePage, CompleteConcept } from 'eduComponents'

import { tabs, useUrlTab } from './tabs'

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
	// Filter the tabs contained in this module. Deal with the exercises separately.
	const shownTabs = tabs.filter(tab => module[tab.component] || (tab.url === 'exercises' && module.exercises))

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
	const initialTab = shownTabs.find(tab => urlTab && tab.url.toLowerCase() === urlTab.toLowerCase())?.url || firstOf(shownTabs).url
	const [tab, setTab] = useLocalStorageStateParameter(`component-${component.id}`, 'tab', initialTab, { id: component.id })
	const isLocalStorageInitialized = useIsLocalStorageInitialized()
	const updateTab = (event, newTab) => setTab(shownTabs[newTab].url)

	// When the URL tab changes, update the tab accordingly.
	const [processedUrlTab, setProcessedUrlTab] = useState()
	useEffect(() => {
		if (isLocalStorageInitialized) {
			setTab(oldTab => shownTabs.find(tab => tab.url === urlTab)?.url || oldTab)
			setProcessedUrlTab(urlTab)
		}
	}, [isLocalStorageInitialized, urlTab, shownTabs, setTab])

	// When the tab does not reflect the URL, then update the URL. (We do check whether the urlTab is the same as what we've seen before. After all, if the URL tab suddenly changes, then we should adjust the tab, and not put the URL back to what the tab is.)
	useEffect(() => {
		if (isLocalStorageInitialized && urlTab === processedUrlTab && urlTab !== tab)
			navigate(`/c/${component.id}/${tab}`, { replace: true })
	}, [isLocalStorageInitialized, urlTab, processedUrlTab, tab, navigate, component])

	// Determine info about what needs to be shown.
	let currTab = shownTabs.find(shownTab => shownTab.url === tab)
	if (!currTab)
		currTab = firstOf(shownTabs) // Fallback that usually never happens, except perhaps when the tab stored in localStorage has for instance been removed in an update of the web-app.
	const tabIndex = shownTabs.indexOf(currTab)
	const Content = module[currTab.component] || (currTab.url === 'exercises' && ExercisePage)

	// Render the contents, with the tabs first and the page after.
	const windowSize = useWindowSize()
	const sizePerTab = windowSize.width / shownTabs.length
	const tinyScreen = sizePerTab < 100
	const smallScreen = sizePerTab < 150
	return <>
		<Box sx={{ background: theme.palette.secondary.main }}>
			<Container>
				<Tabs value={tabIndex} onChange={updateTab} variant="fullWidth">
					{shownTabs.map(tab => {
						const showText = tab.title && (!tab.icon || !tinyScreen) // On a tiny screen don't render text (unless it's the only thing we have).
						const showIcon = tab.icon && (!showText || !smallScreen) // Render an icon when there's no text, or when there's enough space.
						return <Tab key={tab.url} label={showText && tab.title} icon={showIcon && <tab.icon />} iconPosition="start" sx={{ color: theme.palette.secondary.contrastText, minHeight: '48px', minWidth: '48px' }} />
					})}
				</Tabs>
			</Container>
		</Box>
		<Subpage>
			<Content />
			{component.type === 'concept' && ['theory', 'summary'].includes(tab) && <CompleteConcept />}
		</Subpage>
	</>
}

// ComponentTitle shows the title for a given educational component. It can be used in the Header bar.
export function ComponentTitle() {
	const component = useComponent()
	return <>{component.name}</>
}
