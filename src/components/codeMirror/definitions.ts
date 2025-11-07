import { EditorState, Compartment, Extension } from '@codemirror/state'
import { indentUnit } from '@codemirror/language'
import { sql } from '@codemirror/lang-sql'
import { ReactCodeMirrorProps } from '@uiw/react-codemirror';

// A Compartment to control tab size globally.
const tabSize = new Compartment();

// List of default extensions for all SQL components.
export const ownExtensions: Extension[] = [
	sql(),
	tabSize.of(EditorState.tabSize.of(2)), // Make sure tabs are two characters wide.
	indentUnit.of("\t"), // On indent, use a tab and not spaces.
];

// Types used for components.
export interface SQLProps extends Omit<ReactCodeMirrorProps, 'extensions'> {
	lineNumbers?: boolean;
	foldGutter?: boolean;
	highlightActiveLine?: boolean;
	extensions?: Extension[];
	value?: string;
	children?: string;
	setElement?: (element: HTMLElement | null) => void;
	onCreateEditor?: (...args: any[]) => void;
}
