export function Par({ children, ...props }) {
	props.style = {
		display: 'block',
		margin: '1em 0',
		textAlign: 'justify',
		...(props.style || {})
	}
	return <div {...props}>{children}</div> // Turn paragraphs into divs, so they may contain a larger variety of elements without getting hydration errors.
}
