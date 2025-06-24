import { useCallback, useMemo } from 'react'

import { lastOf, useLatest } from 'util'
import * as content from 'content'

import { useSkillDatabase } from '../../skillDatabase'

import { selectAndGenerateExercise } from './generation'

// useSkillStateHandlers defines various handlers that can be used to adjust the skill state. The tricky part is to keep the data structure of the skill state intact.
export function useSkillStateHandlers(skillState, setSkillState) {
	const skillStateRef = useLatest(skillState)
	if (!skillState)
		throw new Error(`Invalid skill state: expected at least an empty object, but received "${skillState}".`)

	// getSkillId retrieves the skillID from the skillState.
	const getSkillId = useCallback(() => {
		return extractSkillId(skillStateRef.current)
	}, [skillStateRef])

	// additionalDataRef is a reference object that will be passed to functions like generateState and checkInput.
	const [smallDatabase, resetSmallDatabase] = useSkillDatabase(getSkillId(), true, false)
	const [largeDatabase, resetLargeDatabase] = useSkillDatabase(getSkillId(), true, true)
	const additionalDataRef = useLatest({ smallDatabase, resetSmallDatabase, largeDatabase, resetLargeDatabase, database: smallDatabase, resetDatabase: resetSmallDatabase })

	// isDatabaseReady is a support function that indicates whether or not a database has properly loaded.
	const databaseReady = useMemo(() => {
		const databaseSetup = content[getSkillId()]?.database
		return !databaseSetup || !!(smallDatabase && largeDatabase)
	}, [getSkillId, smallDatabase, largeDatabase])

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

	// getState gives the state of the current exercise.
	const getState = useCallback(() => {
		return extractState(skillStateRef.current)
	}, [skillStateRef])

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

	// submitInput will take the current input and grade it. Based on the outcome, it will then end the exercise (when done correctly) or add a new input entry for another try.
	const submitInput = useCallback(() => {
		// Get the current state and input.
		const state = getState()
		const input = getInput()
		const exercise = getExercise()
		if (exercise.done)
			throw new Error(`Invalid submitInput call: tried to submit the input for the skill "${getSkillId()}" and the exercise "${getExercise().id}" but this exercise is already done. No further input can be submitted.`)

		// Get the exercise module and run the checkInput function in it.
		const skillModule = content[getSkillId()]
		const exerciseModule = skillModule.exercises[exercise.id]
		const { checkInput } = exerciseModule
		if (!checkInput)
			throw new Error(`Invalid checkInput function: for the skill "${getSkillId()}" the exercise "${getExercise().id}" has no proper checkInput function. The input cannot be checked.`)
		const correct = checkInput(state, input, additionalDataRef.current)

		// On an incorrect input, add a new input to the input list to start editing that.
		if (!correct)
			return setInputs(inputs => [...inputs, lastOf(inputs)])

		// On a correct input, note that the exercise is done.
		setSkillState(skillState => ({ ...skillState, numSolved: (skillState.numSolved || 0) + 1 }))
		return setExercise(exercise => ({ ...exercise, done: true, solved: true }))
	}, [getState, getInput, getSkillId, getExercise, setInputs, setSkillState, setExercise, additionalDataRef])

	// giveUp will take the current exercise and end it, with a note that the user gave up.
	const giveUp = useCallback(() => {
		// Check that the exercise isn't already done.
		const exercise = getExercise()
		if (exercise.done)
			throw new Error(`Invalid giveUp call: for the skill "${getSkillId()}" and the exercise "${getExercise().id}", tried to give up the exercise, but this exercise is already done.`)

		// Note that the exercise is done now.
		return setExercise(exercise => ({ ...exercise, done: true, givenUp: true }))
	}, [getExercise, getSkillId, setExercise])

	// startNewExercise will start a new exercise for the current skill. It can only do this when the currently existing exercise (if it exists) is already done.
	const startNewExercise = useCallback(() => {
		// Get the current exercise to check if it's done.
		const exercise = getExercise()
		if (exercise && !exercise.done)
			throw new Error(`Invalid startNewExercise call: tried to start a new exercise for the skill "${getSkillId()}" but there is still an exercise "${getExercise().id}" currently active. Cannot start a new exercise as a result.`)

		// Add a new exercise.
		const skillModule = content[getSkillId()]
		setExerciseHistory(exerciseHistory => [...(exerciseHistory || []), selectAndGenerateExercise(skillModule.exercises, exerciseHistory, additionalDataRef.current)])
	}, [getExercise, getSkillId, setExerciseHistory, additionalDataRef])

	// Return an object with all the defined handlers.
	return { getSkillId, databaseReady, getExerciseHistory, setExerciseHistory, getExercise, setExercise, getState, getInputs, setInputs, getInput, setInput, getInputParameter, setInputParameter, submitInput, giveUp, startNewExercise }
}

export function extractSkillId(skillState) {
	return skillState.id
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

export function extractStateFromExercise(exercise) {
	return exercise?.state || {}
}
export function extractState(skillState) {
	return extractStateFromExercise(extractExercise(skillState))
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
