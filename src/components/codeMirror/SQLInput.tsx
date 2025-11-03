import CodeMirror from '@uiw/react-codemirror'

import './style.css'
import { ownExtensions, SQLProps } from './util'

export function SQLInput({
  lineNumbers = true,
  foldGutter = false,
  highlightActiveLine = true,
  extensions = [],
  ...props
}: SQLProps) {
  return (
    <CodeMirror
      basicSetup={{
        lineNumbers,
        foldGutter,
        highlightActiveLine,
        highlightActiveLineGutter: highlightActiveLine,
      }}
      extensions={[...ownExtensions, ...extensions]}
      {...props}
    />
  );
}
