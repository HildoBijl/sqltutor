import {useState} from "react";
import {useEventListener} from "./events"

export function useIsTouchDevice(): boolean {
	const query = typeof window === 'undefined' ? null : window.matchMedia('(pointer: coarse)');
	const [isTouch, setIsTouch] = useState(() => query?.matches ?? false);
	useEventListener('change', () => setIsTouch(query?.matches ?? false), query);
	return isTouch;
}