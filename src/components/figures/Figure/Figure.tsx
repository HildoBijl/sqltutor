import { useRef, useImperativeHandle } from 'react';

import { useEnsureRef } from '@/utils';

import { getDefaultFigure, FigureProps, FigureData } from './definitions';

export function Figure(props: FigureProps) {
	const { aspectRatio, maxWidth, innerProps, ref, style, ...rest } = { ...getDefaultFigure(), ...props };
	const { style: innerStyle, ...innerRest } = innerProps!;

	// Define refs and make them accessible to calling elements.
	const figureInner = useRef<HTMLDivElement>(null);
	const figureOuter = useRef<HTMLDivElement>(null);
	const [mergedRef] = useEnsureRef<FigureData>(props.ref);
	useImperativeHandle(mergedRef, () => ({
		get inner() { return figureInner.current },
		get outer() { return figureOuter.current },
	}));

	// Render the figure.
	return <div ref={figureOuter} style={{
		boxSizing: 'content-box',
		margin: '1rem auto',
		padding: '0',
		position: 'relative',
		...(maxWidth === undefined ? {} : { maxWidth: `${maxWidth}px` }),
		...(style ?? {}),
	}} {...rest}>
		<div ref={figureInner} style={{
			boxSizing: 'content-box',
			height: 0,
			paddingBottom: `${aspectRatio! * 100}%`,
			position: 'relative',
			width: '100%',
			...(innerStyle ?? {}),
		}} {...innerRest}>
			{props.children}
		</div>
	</div>
}
