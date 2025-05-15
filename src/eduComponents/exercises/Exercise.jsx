import { Button } from '@mui/material'
import { Close as Cross, Check, ArrowForward } from '@mui/icons-material'

import { ButtonContainer } from 'components'
import * as content from 'content'

export function Exercise(props) {
	const { exercise, skill } = props

	// Check that the exercise exists.
	const skillModule = content[skill.id]
	const exerciseModule = skillModule.exercises[exercise.id]
	if (!exerciseModule)
		throw new Error(`Invalid exercise ID: tried to render an exercise for skill "${skill.id}" and exercise "${exercise.id}" but this exercise could not be found at the given skill.`)

	// Check that the exercise is not outdated: it has a version number, and it's the same as what the generated exercise was based on.
	if (!exerciseModule.meta?.version)
		throw new Error(`Invalid exercise definition: no version number has been provided. Every exercise should export a "meta" object with information about the exercise, including a version number.`)
	if (exerciseModule.meta.version !== exercise.version)
		throw new Error(`Outdated exercise: tried to render an exercise but the versions did not match. The exercise was originally generated on version "${exercise.version}" but the current version of the exercise is "${exerciseModule.meta.version}". Consider not rendering the outdated exercise altogether.`)

	// Check that the exercise is properly defined: it has an Exercise.
	const ExerciseComponent = exerciseModule.Exercise
	if (!ExerciseComponent)
		throw new Error(`Invalid exercise definition: the exercise at skill "${skill.id}" and exercise "${exercise.id}" does not seem to export an Exercise component. Check the exercise definition to make sure an Exercise component is exported properly.`)
	const SolutionComponent = exerciseModule.Solution
	if (!SolutionComponent)
		throw new Error(`Invalid exercise definition: the exercise at skill "${skill.id}" and exercise "${exercise.id}" does not seem to export a Solution component. Check the exercise definition to make sure a Solution component is exported properly.`)

	// Render the component of the exercise.
	const { getState, submitInput, giveUp, startNewExercise } = props
	const state = getState()
	return <>
		<ExerciseComponent state={state} {...props} />
		{!exercise.done ? <>
			<ButtonContainer>
				<Button variant="contained" onClick={submitInput} startIcon={<Check />}>Check input</Button>
				<Button variant="contained" onClick={giveUp} color="secondary" startIcon={<Cross />}>Give up</Button>
			</ButtonContainer>
		</> : <>
			<SolutionComponent state={state} {...props} />
			<ButtonContainer>
				<Button variant="contained" onClick={startNewExercise} endIcon={<ArrowForward />}>Start new exercise</Button>
			</ButtonContainer>
		</>}
	</>
}
