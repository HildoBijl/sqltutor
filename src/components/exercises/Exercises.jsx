import { lastOf } from 'util'

import { Exercise } from './Exercise'

export function Exercises({ skill, history }) {
	// For now only show the last exercise.
	const exercise = lastOf(history)
	return <Exercise skill={skill} exercise={exercise} />
}
