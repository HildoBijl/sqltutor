import { Link } from 'react-router-dom'

import reactLogo from 'assets/react.svg'
import viteLogo from '/vite.svg'

export function Home() {
	return <>
		<div>
			<a href="https://vite.dev" target="_blank">
				<img src={viteLogo} className="logo" alt="Vite logo" />
			</a>
			<a href="https://react.dev" target="_blank">
				<img src={reactLogo} className="logo react" alt="React logo" />
			</a>
			<p>Check out the <Link to="/test">test page</Link> for the database input field, or the <Link to="/overview">overview page</Link> for the skill overview.</p>
		</div>
	</>
}
