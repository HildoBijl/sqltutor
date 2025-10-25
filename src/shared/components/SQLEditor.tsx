import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView, keymap } from '@codemirror/view';
import { Box, Paper } from '@mui/material';
import { useEffect, useMemo, useRef } from 'react';
import { useDebounce } from '@/shared/hooks';

interface SQLEditorProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  height?: string;
  readOnly?: boolean;
  autoFocus?: boolean;
  onExecute?: () => void;
  onLiveExecute?: (query: string) => void; // For live query execution
  enableLiveExecution?: boolean; // Enable live execution feature
  liveExecutionDelay?: number; // Debounce delay for live execution
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
  onLiveExecute,
  enableLiveExecution = false,
  liveExecutionDelay = 150,
}: SQLEditorProps) {
  const executeRef = useRef(onExecute);

  useEffect(() => {
    executeRef.current = onExecute;
  }, [onExecute]);

  // Debounce the value for live execution
  const debouncedValue = useDebounce(value, liveExecutionDelay);

  // Handle live execution when debounced value changes
  useEffect(() => {
    if (enableLiveExecution && onLiveExecute && debouncedValue.trim()) {
      onLiveExecute(debouncedValue);
    }
  }, [debouncedValue, enableLiveExecution, onLiveExecute]);

  const hasExecute = Boolean(onExecute);

  // Memoize editor configuration so it stays stable between renders.
  const extensions = useMemo(() => {
    const baseExtensions = [
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

    if (hasExecute) {
      baseExtensions.push(
        keymap.of([
          {
            key: 'Ctrl-Enter',
            mac: 'Cmd-Enter',
            run: () => {
              const execute = executeRef.current;
              if (execute) {
                execute();
                return true;
              }
              return false;
            },
          },
        ])
      );
    }

    return baseExtensions;
  }, [hasExecute]);

  const basicSetup = useMemo(
    () => ({
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
    }),
    []
  );

  return (
    <Paper
      elevation={2}
      sx={{
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: '#1e1e1e',
      }}
    >
      <CodeMirror
        key="sql-editor"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        theme={oneDark}
        extensions={extensions}
        height={height}
        editable={!readOnly}
        autoFocus={autoFocus}
        basicSetup={basicSetup}
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
