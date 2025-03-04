import { Outlet } from 'react-router-dom'

import { Header } from './Header'

export function Page() {
	return <>
		<Header />
		<Outlet />
	</>
}
