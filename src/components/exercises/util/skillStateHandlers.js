import { useCallback } from 'react'

import { lastOf, useLatest } from 'util'

// useSkillStateHandlers defines various handlers that can be used to adjust the skill state. The tricky part is to keep the data structure of the skill state intact.
export function useSkillStateHandlers(skillState, setSkillState) {
	const skillStateRef = useLatest(skillState)

	// getExerciseHistory gives the full exercise history of the skill.
	const getExerciseHistory = useCallback(() => {
		return extractExerciseHistory(skillStateRef.current)
	}, [skillStateRef])

	// setExerciseHistory is a setter for the exercise history.
	const setExerciseHistory = useCallback(newExerciseHistory => {
		setSkillState(skillState => {
			const exerciseHistory = extractExerciseHistory(skillState)
			if (typeof newExerciseHistory === 'function')
				newExerciseHistory = newExerciseHistory(exerciseHistory)
			return { ...skillState, exerciseHistory: newExerciseHistory }
		})
	}, [setSkillState])

	// getExercise gives the current exercise in the exercise history.
	const getExercise = useCallback(() => {
		return extractExercise(skillStateRef.current)
	}, [skillStateRef])

	// setExercise is a setter for the current exercise in the exercise history.
	const setExercise = useCallback(newExercise => {
		setExerciseHistory(exerciseHistory => {
			const exercise = extractExerciseFromExerciseHistory(exerciseHistory)
			if (typeof newExercise === 'function')
				newExercise = newExercise(exercise)
			return [...exerciseHistory.slice(0, -1), newExercise]
		})
	}, [setExerciseHistory])

	// getInputs gives the list of inputs in the current exercise.
	const getInputs = useCallback(() => {
		return extractInputs(skillStateRef.current)
	}, [skillStateRef])

	// setInputs is a setter for the list of inputs in the current exercise.
	const setInputs = useCallback(newInputs => {
		setExercise(exercise => {
			const inputs = extractInputsFromExercise(exercise)
			if (typeof newInputs === 'function')
				newInputs = newInputs(inputs)
			return { ...exercise, inputs: newInputs }
		})
	}, [setExercise])

	// getInput will get the current input. (Note that the last input in the list is considered the current input.)
	const getInput = useCallback(() => {
		return extractInput(skillStateRef.current)
	}, [skillStateRef])

	// setInput will overwrite the entire current input with the given value.
	const setInput = useCallback(newInput => {
		setInputs(inputs => {
			const input = extractInputFromInputs(inputs)
			if (typeof newInput === 'function')
				newInput = newInput(input)
			return [...inputs.slice(0, -1), newInput]
		})
	}, [setInputs])

	// getInputParameter will return the value of a certain input key.
	const getInputParameter = useCallback(key => {
		return extractInputParameter(skillStateRef.current, key)
	}, [skillStateRef])

	// setInputParameter will overwrite one key-value pair in the input object.
	const setInputParameter = useCallback((key, newValue) => {
		setInput(input => {
			const value = extractInputParameterFromInput(input, key)
			if (typeof newValue === 'function')
				newValue = newValue(value)
			return { ...(input || {}), [key]: newValue }
		})
	}, [setInput])

	// // submitInput will take the current input and grade it. Based on the outcome, it will then end the exercise (when done correctly) or add a new input entry for another try.
	// const submitInput = useCallback(() => {
	// 	// ToDo: write this handler function.
	// 	setSkillState(skillState => skillState)
	// }, [setSkillState])

	// ToDo: add handler to start a new exercise too.

	return { getExerciseHistory, setExerciseHistory, getExercise, setExercise, getInputs, setInputs, getInput, setInput, getInputParameter, setInputParameter }
}

export function extractExerciseHistory(skillState) {
	return skillState.exerciseHistory || []
}

export function extractExerciseFromExerciseHistory(exerciseHistory) {
	return lastOf(exerciseHistory)
}
export function extractExercise(skillState) {
	return extractExerciseFromExerciseHistory(extractExerciseHistory(skillState))
}

export function extractInputsFromExercise(exercise) {
	return exercise?.inputs || []
}
export function extractInputs(skillState) {
	return extractInputsFromExercise(extractExercise(skillState))
}

export function extractInputFromInputs(inputs) {
	return lastOf(inputs)
}
export function extractInput(skillState) {
	return extractInputFromInputs(extractInputs(skillState))
}

export function extractInputParameterFromInput(input, key) {
	return (input || {})[key]
}
export function extractInputParameter(skillState, key) {
	return extractInputParameterFromInput(extractInput(skillState), key)
}
