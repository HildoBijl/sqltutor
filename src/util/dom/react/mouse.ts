import { useState } from 'react';

import { Vector } from '../../geometry';

import { getEventPosition, UtilKeys, getUtilKeys } from '../dom';

import { useEventListener } from './events';

// Type for a mouse data object.
interface MouseData {
	position: Vector | undefined;
	keys: UtilKeys;
}

// Track the mouse position as well as the status of various utility keys. The format is { position: new Vector(x, y), keys: { shift: true, alt: false, ctrl: false } }.
export function useMouseData(): MouseData {
	// Prepare the state.
	const [data, setData] = useState<MouseData>({
		position: undefined,
		keys: { shift: false, alt: false, ctrl: false },
	});

	// Track mouse events.
	const storeData = (event: MouseEvent | TouchEvent) => {
		setData({
			position: getEventPosition(event),
			keys: getUtilKeys(event),
		});
	};
	useEventListener(['mousemove', 'touchstart', 'touchmove'], storeData);

	// Track key presses (Shift, Alt, Ctrl, etcetera).
	const processKeyPress = (event: KeyboardEvent) => {
		setData((prev) => ({
			...prev,
			keys: getUtilKeys(event),
		}));
	};
	useEventListener(['keydown', 'keyup'], processKeyPress);

	return data;
}

// Get the mouse position in client coordinates.
export function useMousePosition(): { x: number; y: number } | undefined {
	return useMouseData().position;
}
