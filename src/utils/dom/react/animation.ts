import { useRef, useCallback, useEffect } from 'react';

import { useLatest } from './consistency';

// Run an animation loop that repeatedly calls the given function as "animate(timeSinceMount, dtSinceLastCall)"". Times are in milliseconds.
export function useAnimation(animationFunc: (timeSinceMount: number, dtSinceLastCall: number) => void): void {
	const startTimeRef = useRef<number | undefined>(undefined);
	const previousTimeRef = useRef<number | undefined>(undefined);
	const requestRef = useRef<number | undefined>(undefined);
	const animationFuncRef = useLatest(animationFunc);

	// Set up an animate function that keeps calling itself.
	const animate = useCallback((pageTime: number) => {
		// Compute times.
		let time: number;
		let dt: number;
		if (startTimeRef.current === undefined) {
			startTimeRef.current = pageTime;
			time = 0;
			dt = 0;
		} else {
			time = pageTime - startTimeRef.current;
			dt = pageTime - (previousTimeRef.current ?? pageTime);
		}
		previousTimeRef.current = pageTime;

		// Call the given animation function.
		animationFuncRef.current(time, dt);
		requestRef.current = requestAnimationFrame(animate);
	}, [animationFuncRef]);

	// Start the animation cycle upon mounting.
	useEffect(() => {
		requestRef.current = requestAnimationFrame(animate);
		return () => {
			if (requestRef.current !== undefined)
				cancelAnimationFrame(requestRef.current);
		};
	}, [animate]);
}
