import { Dialog, DialogTitle, DialogActions, Button, Typography, Box, Stack } from '@mui/material';
import { ArrowBack, Bolt, EmojiEvents, ArrowForward, Replay } from '@mui/icons-material';

interface ConceptCompletionDialogProps {
  open: boolean;
  conceptName?: string;
  nextUp?: string[];
  onClose: () => void;
  onViewSummary: () => void;
  onReturnToOverview: () => void;
  onNavigateToNext?: (id: string) => void;
}

export function ConceptCompletionDialog({
  open,
  conceptName,
  nextUp,
  onClose,
  onViewSummary,
  onReturnToOverview,
  onNavigateToNext,
}: ConceptCompletionDialogProps) {
  const nextId = nextUp?.[0];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: (theme) => ({
          borderRadius: 3,
          border: `1px solid ${theme.palette.success.main}`,
        }),
      }}
    >
      <DialogTitle component="div" sx={{ textAlign: 'center', pt: 4, pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <EmojiEvents sx={{ fontSize: 48, color: 'success.main' }} />
        </Box>
        <Typography variant="h5" component="p" sx={{ fontWeight: 600 }}>
          Concept understood
        </Typography>
        {conceptName && (
          <Typography
            variant="subtitle1"
            component="p"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            {conceptName}
          </Typography>
        )}
      </DialogTitle>

      <DialogActions sx={{ px: 4, pb: 4 }}>
        <Stack spacing={1.5} sx={{ width: '100%' }}>
          <Button onClick={onViewSummary} variant="contained" startIcon={<Bolt />} fullWidth>
            View summary
          </Button>

          {nextId && onNavigateToNext && (
            <Button
              onClick={() => onNavigateToNext(nextId)}
              variant="contained"
              startIcon={<ArrowForward />}
              fullWidth
            >
              Continue to next
            </Button>
          )}

          <Button
            onClick={onReturnToOverview}
            variant="outlined"
            startIcon={<ArrowBack />}
            fullWidth
          >
            Return to learning overview
          </Button>

          {/* <Button onClick={onClose} variant="outlined" startIcon={<Replay />} fullWidth>
            Stay on this concept
          </Button> */}
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
