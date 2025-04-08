import { lastOf } from 'util'

import { Exercise } from './Exercise'

export function Exercises({ history, ...otherData }) {
	// For now only show the last exercise. ToDo: add overview of earlier exercises.
	const exercise = lastOf(history)
	return <Exercise exercise={exercise} {...otherData} />
}
