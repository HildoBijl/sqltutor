import { useComponent } from 'edu'
import * as content from 'content'

export function ExercisePage() {
	const skill = useComponent()
	const module = content[skill.id]
	console.log(module)
	return <p>This will be the exercise page for skill {skill.id}.</p>
}
