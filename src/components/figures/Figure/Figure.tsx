import { useImperativeHandle } from 'react';

import { useEnsureRef, useRefWithElement } from '@/utils/dom';

import { getDefaultFigure, FigureProps, FigureData } from './definitions';

export function Figure(props: FigureProps) {
	const { aspectRatio, maxWidth, innerProps, ref, style, ...rest } = { ...getDefaultFigure(), ...props };
	const { style: innerStyle, ...innerRest } = innerProps!;

	// Define refs and make them accessible to calling elements.
	const [figureInnerRef, figureInner] = useRefWithElement<HTMLDivElement>();
	const [figureOuterRef, figureOuter] = useRefWithElement<HTMLDivElement>();
	const [mergedRef] = useEnsureRef<FigureData>(props.ref);
	useImperativeHandle(mergedRef, () => ({
		get inner() { return figureInner },
		get outer() { return figureOuter },
	}), [figureInner, figureOuter]);

	// Render the figure.
	return <div ref={figureOuterRef} style={{
		boxSizing: 'content-box',
		margin: '0rem auto',
		padding: '0',
		position: 'relative',
		width: '100%',
		...(maxWidth === undefined ? {} : { maxWidth: `${maxWidth}px` }),
		...(style ?? {}),
	}} {...rest}>
		<div ref={figureInnerRef} style={{
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
