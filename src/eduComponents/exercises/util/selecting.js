import { selectRandomly } from 'util'

// selectExercise takes a list of exercises, as well as the history (what exercises were done previously) and chooses which exercise should be done next. It returns the exerciseData object, which is the object exported by the exercise folder.
export function selectExercise(exercises) {
	// For now we simply randomly select an exercise from the list.
	const exerciseId = selectRandomly(Object.keys(exercises))
	return {
		...exercises[exerciseId],
		id: exerciseId,
	}
	// ToDo: involve the history (second function parameter) in some way when selecting exercises.
}
