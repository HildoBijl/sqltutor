import { useLocalStorageState } from 'util'
import { useComponent } from 'edu'
import * as content from 'content'

export function ExercisePage() {
	// Extract data needed to render the exercise page.
	const skill = useComponent()
	const module = content[skill.id]
	const [skillState, setSkillState] = useLocalStorageState(`component-${skill.id}`, {})

	// ToDo: render the component.
	console.log(module, skillState)
	return <p>This will be the exercise page for skill {skill.id}. The state is: {JSON.stringify(skillState)}</p>
}

