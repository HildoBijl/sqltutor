import { useState, useEffect, useRef } from 'react'
import { Outlet } from 'react-router-dom'

import { siteTitle } from 'settings'
import { useCurrentRoute } from 'routing'

import { Header } from './Header'

export function Page() {
	return <>
		<MetaTitle />
		<Header />
		<Outlet />
	</>
}

// The MetaTitle ensures that the <title> tag in the <head> part of the HTML is set properly, ensuring a proper title in the browser tab.
function MetaTitle() {
	const route = useCurrentRoute()

	// The route title might be a React component, and the HTML <title> tag requires a string. We use a round-about way of getting the inner text rendered in the given route title component.
	const hiddenTitleRef = useRef()
	const [headerTitle, setHeaderTitle] = useState()
	
	// When the route or the title in it changes, update the title.
	const currentTitle = hiddenTitleRef.current?.innerText
	useEffect(() => {
		setHeaderTitle(hiddenTitleRef.current?.innerText)
	}, [route, currentTitle, hiddenTitleRef])
	
	// Determine the tab title and show it.
	const tabTitle = `${(headerTitle ? `${headerTitle} | ` : '')}${siteTitle}`
	return <>
		<div ref={hiddenTitleRef} style={{ display: 'none' }}>{route.title}</div>
		<title>{tabTitle}</title>
	</>
}
