import { useEffect, useMemo } from 'react'

import { useComponent, useComponentState } from 'edu'

import { useSkillStateHandlers } from './util'
import { Exercises } from './Exercises'

export function ExercisePage() {
	// Extract data needed to render the exercise page.
	const skill = useComponent()
	const [skillState, setSkillState] = useComponentState(skill.id)

	// ToDo: filter exercises based on whether they exist and have a valid version.

	// Set up handlers for manipulating the skillState.
	const handlers = useSkillStateHandlers(skillState, setSkillState)
	const { databaseReady, getExercise, startNewExercise } = handlers

	// Initialize the first exercise only if there's no exercise history at all and SQLJS is ready.
	// This ensures exercises persist across page refreshes and only change when explicitly requested.
	useEffect(() => {
		const exercise = getExercise()
		const history = skillState.exerciseHistory || []
		// Only auto-generate if there's no exercise history at all (first time visiting)
		if (!exercise && history.length === 0 && databaseReady)
			startNewExercise()
	}, [getExercise, startNewExercise, databaseReady, skillState.exerciseHistory])

	// When no exercises are in the state yet, we are most likely initializing one. For now, show a loading note.
	const history = useMemo(() => skillState.exerciseHistory || [], [skillState])
	if (history.length === 0)
		return <p>Generating exercise...</p>

	// Show the exercises that have been done so far.
	return <Exercises {...{ skill, history, ...handlers }} />
}
