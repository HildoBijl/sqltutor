import { useRef, useImperativeHandle } from 'react'
import { Box } from '@mui/material'
import clsx from 'clsx'

import { processOptions, filterProperties, resolveFunctions, useEnsureRef } from 'util'

import { defaultFigureOptions } from './settings'

const figureStyle = {
	boxSizing: 'content-box',
	margin: '1rem auto',
	maxWidth: ({ maxWidth }) => maxWidth !== undefined ? `${maxWidth}px` : '',
	padding: '0',
	position: 'relative',
}

const innerFigureStyle = {
	boxSizing: 'content-box',
	height: 0,
	paddingBottom: ({ aspectRatio }) => `${aspectRatio * 100}%`,
	position: 'relative',
	width: '100%',
}

export function Figure(options) {
	options = processOptions(options, defaultFigureOptions)
	const styleOptions = filterProperties(options, ['maxWidth', 'aspectRatio'])

	// Define refs and make them accessible to calling elements.
	const ref = useEnsureRef(options.ref)
	const figureInner = useRef()
	const figureOuter = useRef()
	useImperativeHandle(ref, () => ({
		get inner() {
			return figureInner.current
		},
		get outer() {
			return figureOuter.current
		},
	}))

	// Render the figure.
	options.className = clsx('figure', options.className)
	return (
		<Box ref={figureOuter} sx={{ ...resolveFunctions(figureStyle, styleOptions), ...options.style }}>
			<Box ref={figureInner} sx={{ ...resolveFunctions(innerFigureStyle, styleOptions) }}>
				{options.children}
			</Box>
		</Box>
	)
}
