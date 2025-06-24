import { Link } from 'react-router-dom'

import { Subpage, useLocalStorageValue } from 'components'
import { concepts, skills } from 'edu'

export function Overview() {
	const localStorage = useLocalStorageValue()

	return <Subpage>
		<p>Contents are split up into small modular blocks. We distinguish between:</p>
		<ul>
			<li><strong>Concepts</strong>: an idea like &quot;What is a database?&quot; that can be visualized</li>
			<li><strong>Skills</strong>: an action like &quot;Write a single-table query&quot; that can be executed</li>
		</ul>
		<p>You find the full list of the contents below.</p>
		<h4>Concepts</h4>
		<ul>
			{Object.values(concepts).map(concept => <li key={concept.id}><Link to={`/c/${concept.id}`}>{concept.name}</Link>{localStorage[`component-${concept.id}`]?.understood ? ' (completed)' : ''}</li>)}
		</ul>
		<h4>Skills</h4>
		<ul>
			{Object.values(skills).map(skill => {
				const numSolved = localStorage[`component-${skill.id}`]?.numSolved || 0
				const message = numSolved === 0 ? '' : (numSolved >= 3 ? ' (completed)' : ` (progress: ${numSolved}/3)`)
				return <li key={skill.id}><Link to={`/c/${skill.id}`}>{skill.name}</Link>{message}</li>
			})}
		</ul>
	</Subpage >
}
