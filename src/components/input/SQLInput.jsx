import CodeMirror from '@uiw/react-codemirror'
import { sql } from '@codemirror/lang-sql'
import { basicSetup } from 'codemirror'
import { oneDark } from '@codemirror/theme-one-dark'

// Override specific one-dark theme colors.
oneDark[1][1].value.rules = [
	".ͼp {color: #c81919; font-weight: 600;}", // Turn keywords into the web-app theme color.
	".ͼq {color: #abb2bf}",
	".ͼr {color: #61afef;}",
	".ͼs {color: #d19a66;}",
	".ͼt {color: #abb2bf;}",
	".ͼu {color: #ff25fd;}", // Turn numbers into a clear alternate color.
	".ͼv {color: #56b6c2;}",
	".ͼw {color: #7d8799;}",
	".ͼx {font-weight: bold;}",
	".ͼy {font-style: italic;}",
	".ͼz {text-decoration: line-through;}",
	".ͼ10 {color: #7d8799; text-decoration: underline;}",
	".ͼ11 {color: #e06c75; font-weight: bold;}",
	".ͼ12 {color: #d19a66;}",
	".ͼ13 {color: #98c379;}",
	".ͼ14 {color: #ffffff;}"
]

// Set up the SQLInput object to use the CodeMirror object with the right default settings.
export function SQLInput(props) {
	return <CodeMirror
		{...props}
		extensions={[basicSetup, sql(), ...(props.extensions || [])]}
		theme={props.theme || oneDark}
	/>
}
