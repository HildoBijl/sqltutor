import CodeMirror from '@uiw/react-codemirror'

import './style.css'
import { ownExtensions } from './util'

// Set up the SQLInput object to use the CodeMirror object with the right default settings.
export function SQLInput({
	lineNumbers = true, foldGutter = false, highlightActiveLine = true,
	extensions = [], ...props
}) {
	return <CodeMirror
		basicSetup={{ lineNumbers, foldGutter, highlightActiveLine, highlightActiveLineGutter: highlightActiveLine }}
		{...props}
		extensions={[...ownExtensions, ...extensions]}
	/>
}
