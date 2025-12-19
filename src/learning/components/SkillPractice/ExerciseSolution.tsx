import { useEffect, useMemo, useState } from 'react';

import { Box, Button, Collapse, Divider, Typography } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { EditorView } from '@codemirror/view';

import { ExerciseSection } from './ExerciseSection';
import type { PracticeSolution } from '../../types';

interface ExerciseSolutionProps {
  solution?: PracticeSolution | null;
  show?: boolean;
}

export function ExerciseSolution({ solution, show = true }: ExerciseSolutionProps) {
  const [expanded, setExpanded] = useState(true);

  const normalizedSolution = solution && solution.query ? solution : null;

  const readmeTheme = useMemo(
    () =>
      EditorView.theme(
        {
          '&': {
            backgroundColor: '#f6f8fa',
            color: '#24292f',
            borderRadius: '8px',
            border: '1px solid #d0d7de',
          },
          '.cm-content': {
            padding: '16px',
            fontFamily: 'Fira Code, monospace',
            fontSize: '0.95rem',
          },
          '.cm-scroller': {
            fontFamily: 'Fira Code, monospace',
          },
          '.cm-line': {
            padding: '0',
          },
          '.cm-gutters': {
            backgroundColor: '#f6f8fa',
            color: '#57606a',
            borderRight: 'none',
          },
          '.cm-activeLine': {
            backgroundColor: 'transparent',
          },
          '.cm-activeLineGutter': {
            backgroundColor: 'transparent',
          },
        },
        { dark: false },
      ),
    [],
  );

  const extensions = useMemo(() => [sql(), EditorView.lineWrapping, readmeTheme], [readmeTheme]);

  const basicSetup = useMemo(
    () => ({
      lineNumbers: false,
      foldGutter: false,
      highlightActiveLine: false,
      highlightActiveLineGutter: false,
      autocompletion: false,
      bracketMatching: false,
      closeBrackets: false,
    }),
    [],
  );

  useEffect(() => {
    if (normalizedSolution?.query) {
      setExpanded(true);
    }
  }, [normalizedSolution?.query]);

  const explanation =
    normalizedSolution?.explanation ??
    'We are working on a short explanation for this solution. Check back soon!';

  if (!normalizedSolution || !show) {
    return null;
  }

  return (
    <ExerciseSection
      title="Solution"
      showDivider={false}
      contentSx={{ p: 0 }}
      actions={
        <Button
          size="small"
          color="primary"
          variant="text"
          onClick={() => setExpanded((prev) => !prev)}
          endIcon={expanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
          sx={{ textTransform: 'none', fontWeight: 500, px: 1 }}
        >
          {expanded ? 'Hide' : 'Show'}
        </Button>
      }
    >
      <Collapse in={expanded} unmountOnExit>
        <Divider sx={{ mb: 2 }} />
        <Box sx={{ px: 2.5, pb: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {explanation}
          </Typography>
          <Box>
            <CodeMirror
              value={normalizedSolution.query}
              editable={false}
              height="auto"
              extensions={extensions}
              basicSetup={basicSetup}
            />
          </Box>
        </Box>
      </Collapse>
    </ExerciseSection>
  );
}
