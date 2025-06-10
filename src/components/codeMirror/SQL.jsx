import CodeMirror from '@uiw/react-codemirror'

import { noop } from 'util'

import './style.css'
import { ownExtensions } from './util'

// Set up the SQL object to use the CodeMirror object with the right default settings.
export function SQL({ setElement, onCreateEditor = noop, lineNumbers = false, foldGutter = false, highlightActiveLine = false, extensions = [], children, value, ...props }) {
	value = value || children
	value = value.trim()
	if (typeof value !== 'string')
		throw new Error(`Invalid SQL query: expected a query with only text, but received something that possibly contains HTML components or similar.`)
	return <CodeMirror
		basicSetup={{ lineNumbers, foldGutter, highlightActiveLine, highlightActiveLineGutter: highlightActiveLine }}
		onCreateEditor={(...args) => {
			typeof setElement === 'function' && setElement(args[0]?.contentDOM)
			onCreateEditor(...args)
		}}
		{...{ readOnly: true, editable: false, value, ...props }}
		extensions={[...ownExtensions, ...extensions]}
		style={{ display: 'inline-block', transform: 'translateY(-1pt)' }}
	/>
}
