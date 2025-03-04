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
	const tabTitle = `${(route.title ? `${route.title} | ` : '')}${siteTitle}`
	return <title>{tabTitle}</title>
}
