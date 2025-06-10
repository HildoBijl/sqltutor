import { EditorState, Compartment } from '@codemirror/state'
import { indentUnit } from '@codemirror/language'
import { sql } from '@codemirror/lang-sql'

// Set up a list of extensions that we want to include in all SQL components (both display and input).
const tabSize = new Compartment
export const ownExtensions = [
	sql(),
	tabSize.of(EditorState.tabSize.of(2)), // Make sure tabs are two characters wide.
	indentUnit.of("\t"), // On indent, use a tab and not spaces.
]

export const getOwnExtensions = () => {
	const tabSize = new Compartment
	return [
		sql(),
		tabSize.of(EditorState.tabSize.of(2)), // Make sure tabs are two characters wide.
		indentUnit.of("\t"), // On indent, use a tab and not spaces.
	]
}
