import { defaultFigureOptions } from '../Figure'

export const defaultDrawingOptions = {
	...defaultFigureOptions,
	maxWidth: bounds => bounds.width, // Override the default maxWidth (undefined, meaning full width) to the bounds. Set to "fill" to always fill the available page width.
	width: 400,
	height: 300,
	useSvg: true,
	useCanvas: false,
}
delete defaultDrawingOptions.aspectRatio // We override the aspect ratio based on the width and height of the viewport.
