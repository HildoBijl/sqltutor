import * as content from 'content'

export function Exercise({ skill, exercise }) {
	// Check that the exercise exists and is not outdated.
	const skillModule = content[skill.id]
	const exerciseModule = skillModule.exercises[exercise.id]
	if (!exerciseModule)
		throw new Error(`Invalid exercise ID: tried to render an exercise for skill "${skill.id}" and exercise "${exercise.id}" but this exercise could not be found at the given skill.`)
	if (!exerciseModule.meta?.version)
		throw new Error(`Invalid exercise definition: no version number has been provided. Every exercise should export a "meta" object with information about the exercise, including a version number.`)
	if (exerciseModule.meta.version !== exercise.version)
		throw new Error(`Outdated exercise: tried to render an exercise but the versions did not match. The exercise was originally generated on version "${exercise.version}" but the current version of the exercise is "${exerciseModule.meta.version}". Consider not rendering the outdated exercise altogether.`)

	// Check that the exercise is properly defined: it has an Exercise.
	const ExerciseComponent = exerciseModule.Exercise
	if (!ExerciseComponent)
		throw new Error(`Invalid exercise definition: the exercise at skill "${skill.id}" and exercise "${exercise.id}" does not seem to export an Exercise component. Check the exercise definition to make sure an Exercise component is exported properly.`)

	// Render the component of the exercise.
	return <ExerciseComponent state={exercise.state} />
}
