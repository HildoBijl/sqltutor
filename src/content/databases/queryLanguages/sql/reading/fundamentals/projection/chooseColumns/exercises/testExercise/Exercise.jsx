import { useComponent } from 'edu'

export function Exercise() {
	const skillId = useComponent()
	return <p>This will be the exercise for skill {skillId}.</p>
}
