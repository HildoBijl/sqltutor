import { selectExercise } from './selecting'

// generateExercise takes the data of an exercise (whatever is exported from its folder) and sets up an object for this exercise that can be stored in storage.
export function generateExercise(exerciseData, additionalData) {
	return {
		id: exerciseData.id,
		version: exerciseData.meta.version,
		state: generateExerciseState(exerciseData, additionalData),
	}
}

// generateExerciseState takes the data of an exercise (whatever is exported from its folder) and sets up a state for this exercise.
export function generateExerciseState(exerciseData, additionalData) {
	// Check that the exercise is well-defined.
	if (!exerciseData.generateState)
		throw new Error(`Missing generateState function: the exercise with id "${exerciseData.id}" does not export a generateState function.`)

	// Generate and check the state.
	const exerciseState = exerciseData.generateState(additionalData)
	if (!exerciseState)
		throw new Error(`Invalid exercise state: the generateState function for the exercise with id "${exerciseData.id}" was falsy. This is not allowed. Did you forget to export the state from the function? If you do want an empty state, just return an empty object.`)

	// Return the state.
	return exerciseState
}

// selectAndGenerateExercise combines the selectExercise and the generateExercise functions: it selects an exercise based on a list of exercises and a history object. It then sets up a state for this exercise.
export function selectAndGenerateExercise(exercises, exerciseHistory, additionalData) {
	return generateExercise(selectExercise(exercises, exerciseHistory), additionalData)
}
