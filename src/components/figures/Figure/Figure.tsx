import { useRef, useImperativeHandle, CSSProperties } from 'react';

import { processOptions, resolveFunctions, useEnsureRef } from '@/utils';

import { defaultFigureOptions, FigureOptions, FigureRef } from './settings';

const figureStyle = {
	boxSizing: 'content-box',
	margin: '1rem auto',
	maxWidth: ({ maxWidth }: { maxWidth?: number }) => (maxWidth !== undefined ? `${maxWidth}px` : ''),
	padding: '0',
	position: 'relative',
};

const innerFigureStyle = {
	boxSizing: 'content-box',
	height: 0,
	paddingBottom: ({ aspectRatio }: { aspectRatio?: number }) => `${(aspectRatio ?? 0.75) * 100}%`,
	position: 'relative',
	width: '100%',
};

export function Figure(options: FigureOptions) {
	options = processOptions<FigureOptions>(options, defaultFigureOptions);

	// Define refs and make them accessible to calling elements.
	const figureInner = useRef<HTMLDivElement>(null);
	const figureOuter = useRef<HTMLDivElement>(null);
	const ref = useEnsureRef<FigureRef>(options.ref);
	useImperativeHandle(ref, () => ({
		get inner() { return figureInner.current },
		get outer() { return figureOuter.current },
	}));

	// Render the figure.
	return <div ref={figureOuter} className={options.className} style={{ ...resolveFunctions(figureStyle, { maxWidth: options.maxWidth }), ...options.style } as CSSProperties}>
		<div ref={figureInner} style={resolveFunctions(innerFigureStyle, { aspectRatio: options.aspectRatio }) as CSSProperties}>
			{options.children}
		</div>
	</div>
}
