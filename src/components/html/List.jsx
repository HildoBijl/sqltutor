export function List({ items, useNumbers, className, style, itemStyle }) {
	// Check the input.
	if (!items || !Array.isArray(items))
		throw new Error(`Invalid list items: expected an array "items" property, but received something of type ${typeof items}.`)

	// Process style.
	style = {
		margin: '0.5rem 0',
		textAlign: 'justify',
		...(style || {}),
	}
	itemStyle = {
		margin: '0.2rem 0 0.2rem -1rem',
		...(itemStyle || {}),
	}

	// Render the list.
	const properties = { className, style }
	const contents = items.map((item, index) => <li key={index} style={itemStyle}>{item}</li>)
	return useNumbers ? <ol {...properties}>{contents}</ol> : <ul {...properties}>{contents}</ul>
}
