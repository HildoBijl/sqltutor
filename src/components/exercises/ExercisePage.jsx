import { useEffect, useMemo } from 'react'

import { useLocalStorageState } from 'util'
import { useComponent } from 'edu'

import { useSkillStateHandlers } from './util'
import { Exercises } from './Exercises'

export function ExercisePage() {
	// Extract data needed to render the exercise page.
	const skill = useComponent()
	const [skillState, setSkillState] = useLocalStorageState(`component-${skill.id}`, { skillId: skill.id })

	// ToDo: filter exercises based on whether they exist and have a valid version.

	// Set up handlers for manipulating the skillState.
	const handlers = useSkillStateHandlers(skillState, setSkillState)
	const { getExercise, startNewExercise } = handlers

	// Whenever there are no exercises, initialize the first exercise. (When there is an exercise, display its solution still.)
	useEffect(() => {
		const exercise = getExercise()
		if (!exercise)
			startNewExercise()
	}, [getExercise, startNewExercise])

	// When no exercises are in the state yet, we are most likely initializing one. For now, show a loading note.
	const history = useMemo(() => skillState.exerciseHistory || [], [skillState])
	if (history.length === 0)
		return <p>Generating exercise...</p>

	// Show the exercises that have been done so far.
	return <Exercises {...{ skill, history, ...handlers }} />
}
