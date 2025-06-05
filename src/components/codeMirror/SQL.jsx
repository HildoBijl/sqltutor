import CodeMirror from '@uiw/react-codemirror'
import { sql } from '@codemirror/lang-sql'

import './style.css'

// Set up the SQL object to use the CodeMirror object with the right default settings.
export function SQL({ lineNumbers = false, foldGutter = false, highlightActiveLine = false, extensions = [], children, value, ...props }) {
	value = value || children
	return <CodeMirror
		basicSetup={{ lineNumbers, foldGutter, highlightActiveLine, highlightActiveLineGutter: highlightActiveLine, }}
		{...{ readOnly: true, editable: false, value, ...props }}
		extensions={[sql(), ...extensions]}
		style={{ display: 'inline-block' }}
	/>
}
