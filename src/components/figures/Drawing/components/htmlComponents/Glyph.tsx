import { type CSSProperties } from 'react';

import * as glyphs from '@/assets/glyphs';

import { type ElementProps, getDefaultElement, Element } from './Element';

export interface GlyphProps extends ElementProps {
	name: keyof typeof glyphs;
	width?: number;
	height?: number;
	elementStyle?: CSSProperties;
}

export const getDefaultGlyph = (): GlyphProps => ({
	...getDefaultElement(),
	passive: true,
	behind: true,
	name: undefined as unknown as keyof typeof glyphs, // Placeholder until defined.
	width: 100,
	height: undefined,
	elementStyle: {},
});

export function Glyph(props: GlyphProps) {
	const { name, width, height, style, elementStyle, ...rest } = { ...getDefaultGlyph(), ...props };

	// Validate that the requested glyph exists.
	const glyphSource = glyphs[name];
	if (!glyphSource)
		throw new Error(`Invalid Glyph: no glyph with name "${name}" exists. Is it exported from the glyphs directory?`);

	return <Element style={elementStyle} {...rest}>
		<img src={glyphSource} width={width} height={height} style={style} />
	</Element>;
}
