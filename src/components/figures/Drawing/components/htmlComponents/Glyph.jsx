import { processOptions, filterOptions } from 'util'

import * as glyphs from 'assets/glyphs'

import { Element } from './Element'

const defaultGlyph = {
	...Element.defaultProps,
	passive: true, // Override Element's defaults.
	behind: true, // Override Element's defaults.
	name: undefined,
	height: undefined,
	width: 100,
	elementStyle: {},
	style: {},
}

export function Glyph(props) {
	// Process the provided options.
	props = processOptions(props, defaultGlyph)
	const { name, width, height, style } = props

	// On no file, don't render.
	if (!name || !glyphs[name])
		throw new Error(`Invalid Glyph requested: tried to request the Glyph with name "${name}" but could not find this. Is it exported from the glyphs directory?`)

	// Render the file in the given element.
	return <Element {...filterOptions({ ...props, style: props.elementStyle }, Element.defaultProps)}>
		<img src={glyphs[name]} {...{ width, height, style }} />
	</Element>
}
Glyph.defaultProps = defaultGlyph
