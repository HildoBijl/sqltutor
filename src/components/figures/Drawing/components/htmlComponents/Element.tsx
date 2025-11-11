import { type Ref, type HTMLAttributes, useCallback, useLayoutEffect } from 'react';

import { type VectorInput, Vector, ensureVector } from '@/utils/geometry';
import { useEnsureRef, useEqualRefOnEquality, useResizeListener, notSelectable } from '@/utils/dom';

import { useDrawingData, HtmlPortal } from '../../DrawingContext';

export interface ElementProps extends HTMLAttributes<HTMLDivElement> {
	position?: VectorInput;
	rotate?: number; // Radians
	scale?: number;
	anchor?: VectorInput; // -1 for left/top, 0 for center, 1 for right/bottom
	passive?: boolean; // Ignore mouse events
	behind?: boolean; // Placed behind SVG
	ref?: Ref<HTMLDivElement>;
}

export const getDefaultElement = (): ElementProps => ({
	position: Vector.zero,
	rotate: 0,
	scale: 1,
	anchor: new Vector(0, 0),
	passive: false,
	behind: false,
	ref: undefined,
});

export function Element(props: ElementProps) {
	const { children, position, rotate, scale, anchor, passive, behind, ref, style, ...rest } = { ...getDefaultElement(), ...props };
	const p = useEqualRefOnEquality(ensureVector(position, 2));
	const a = useEqualRefOnEquality(ensureVector(anchor, 2));

	// Update element position based on current scale and transform.
	const [mergedRef, internalRef] = useEnsureRef<HTMLDivElement>(ref);
	const { bounds, figure, getFigureScale } = useDrawingData();
	const updateElementPosition = useCallback(() => {
		// On no data, don't update.
		const element = internalRef.current;
		if (!element || !bounds || !figure?.inner)
			return;

		// Position the element accordingly.
		element.style.display = 'block'; // Display if not already done so.
		element.style.transformOrigin = `${(a.x + 1) / 2 * 100}% ${(a.y + 1) / 2 * 100}%`;
		element.style.transform = `
			translate(${-(a.x + 1) / 2 * 100}%, ${-(a.y + 1) / 2 * 100}%)
			scale(${getFigureScale()})
			translate(${p.x}px, ${p.y}px)
			scale(${scale})
			rotate(${rotate! * 180 / Math.PI}deg)
			${style?.transform ?? ''}`;
	}, [internalRef, bounds, figure, getFigureScale, p, a, rotate, scale]);

	// Call update on layout changes and resize.
	useLayoutEffect(updateElementPosition, [updateElementPosition, children]);
	useResizeListener(updateElementPosition);

	// Render the children inside the Drawing HTML contents container.
	return <HtmlPortal>
		<div ref={mergedRef} style={{
			display: 'none', // Hide initially.
			left: 0,
			position: 'absolute',
			top: 0,
			...(behind ? { zIndex: -1 } : { zIndex: 3 }),
			...(passive ? { ...notSelectable, pointerEvents: 'none' } : {}),
			...(style ?? {}),
		}} {...rest}>
			{children}
		</div>
	</HtmlPortal>
}
