import { Link } from 'react-router-dom'

import { Subpage } from 'components'

export function Home() {
	return <Subpage>
		<h1>SQL Valley</h1>
		<p>The SQL Valley web app will be built here. It is under development!</p>
		<p>Check out the <Link to="/test">test page</Link> for the database input field, or the <Link to="/overview">overview page</Link> for the skill overview, <Link to="/test2">database overview</Link>.</p>
		<p> Also, check out the <Link to="/design">design page</Link> for the design page.</p>
	</Subpage >
}
