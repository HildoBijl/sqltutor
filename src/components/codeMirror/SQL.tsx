import CodeMirror from '@uiw/react-codemirror';

import { noop } from '@/utils'

import './style.css'
import { ownExtensions, SQLProps } from './util'

export function SQL({
	setElement,
	onCreateEditor = noop,
	lineNumbers = false,
	foldGutter = false,
	highlightActiveLine = false,
	extensions = [],
	children,
	value,
	...props
}: SQLProps) {
	// Prefer children if value is not provided.
	value = value || children || '';
	value = value.trim();

	// Ensure the value is given.
	if (typeof value !== 'string')
		throw new Error(`Invalid SQL query: expected a query with only text, but received something of type "${typeof value}".`);

	return (
		<CodeMirror
			basicSetup={{
				lineNumbers,
				foldGutter,
				highlightActiveLine,
				highlightActiveLineGutter: highlightActiveLine,
			}}
			onCreateEditor={(...args) => {
				setElement?.(args[0]?.contentDOM ?? null);
				onCreateEditor(...args);
			}}
			{...{ readOnly: true, editable: false, value, ...props }}
			extensions={[...ownExtensions, ...extensions]}
			style={{ display: 'inline-block', transform: 'translateY(-1pt)' }}
		/>
	);
}
