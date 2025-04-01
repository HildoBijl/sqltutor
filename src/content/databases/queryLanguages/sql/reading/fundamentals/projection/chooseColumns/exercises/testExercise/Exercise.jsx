import { useComponent } from 'edu'

export function Exercise({ state }) {
	const skill = useComponent()
	return <p>This will be the test exercise for skill {skill.id}. The state is {JSON.stringify(state)}.</p>
}
