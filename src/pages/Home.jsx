import { Link } from 'react-router-dom'

import { Subpage } from 'components'

export function Home() {
	return <Subpage>
		<h1>SQL-Tutor</h1>
		<p>The SQL-Tutor web app will be built here. It is under development.</p>
		<p>Check out the <Link to="/test">test page</Link> for the database input field, or the <Link to="/overview">overview page</Link> for the skill overview.</p>
	</Subpage >
}
