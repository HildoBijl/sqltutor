import { Subpage } from 'components'

import { concepts, skills } from 'edu'

export function Overview() {
	return <Subpage>
		<p>Contents are split up into small modular blocks. We distinguish between concepts (an idea like &quot;What is a database?&quot; that can be visualized) and skills (an action like &quot;Write a single-table query&quot; that can be executed). You find the full list of the contents below.</p>
		<h4>Concepts</h4>
		<ul>
			{Object.values(concepts).map(concept => <li key={concept.id}>{concept.name}</li>)}
		</ul>
		<h4>Skills</h4>
		<ul>
			{Object.values(skills).map(skill => <li key={skill.id}>{skill.name}</li>)}
		</ul>
	</Subpage>
}
