import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView, keymap } from '@codemirror/view';
import { Box, Paper } from '@mui/material';

interface SQLEditorProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  height?: string;
  readOnly?: boolean;
  autoFocus?: boolean;
  onExecute?: () => void;
  showResults?: boolean; // accepted for compatibility, no-op here
}

export function SQLEditor({
  value,
  onChange,
  placeholder = 'Enter SQL query...',
  height = '300px',
  readOnly = false,
  autoFocus = false,
  onExecute,
}: SQLEditorProps) {
  const extensions = [
    sql(),
    EditorView.theme({
      '&': {
        fontSize: '14px',
      },
      '.cm-content': {
        padding: '12px',
      },
      '.cm-focused .cm-cursor': {
        borderLeftColor: '#c8102e',
      },
      '.cm-focused .cm-selectionBackground, ::selection': {
        backgroundColor: '#c8102e33',
      },
    }),
    EditorView.lineWrapping,
  ];

  // Add keyboard shortcut for execution
  if (onExecute) {
    extensions.push(
      keymap.of([
        {
          key: 'Ctrl-Enter',
          mac: 'Cmd-Enter',
          run: () => {
            onExecute();
            return true;
          },
        },
      ])
    );
  }

  return (
    <Paper
      elevation={2}
      sx={{
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <CodeMirror
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        theme={oneDark}
        extensions={extensions}
        height={height}
        editable={!readOnly}
        autoFocus={autoFocus}
        basicSetup={{
          lineNumbers: true,
          foldGutter: false,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          highlightSelectionMatches: true,
          searchKeymap: true,
        }}
      />
    </Paper>
  );
}

// Syntax highlighting component for displaying SQL (non-editable)
interface SQLDisplayProps {
  children: string;
  inline?: boolean;
}

export function SQLDisplay({ children, inline = false }: SQLDisplayProps) {
  if (inline) {
    return (
      <Box
        component="code"
        sx={{
          px: 0.5,
          py: 0.25,
          bgcolor: 'action.hover',
          borderRadius: 0.5,
          fontFamily: 'monospace',
          fontSize: '0.875em',
          color: 'primary.main',
        }}
      >
        {children}
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 2 }}>
      <SQLEditor
        value={children.trim()}
        readOnly
        height="auto"
      />
    </Box>
  );
}
