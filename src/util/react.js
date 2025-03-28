import { useState, useCallback, useEffect } from 'react'

// getWindowSize returns the size of the window at the current moment.
export function getWindowSize() {
	return {
		width: window.innerWidth,
		height: window.innerHeight,
	}
}

// useWindowSize is a hook that gives the window size and updates it when changed.
export function useWindowSize() {
	const [windowSize, setWindowSize] = useState(getWindowSize())

	// Set up a listener that updates the window size when it changes.
	const updateWindowSize = useCallback(() => setWindowSize(getWindowSize()), [])
	useEffect(() => {
		window.addEventListener('resize', updateWindowSize)
		return () => window.removeEventListener('resize', updateWindowSize)
	}, [updateWindowSize])

	return windowSize
}
