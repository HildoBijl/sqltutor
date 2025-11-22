import { Dialog, DialogTitle, DialogActions, Button, Typography, Box, Stack } from '@mui/material';
import { ArrowBack, Bolt, EmojiEvents, MenuBook, Replay } from '@mui/icons-material';

interface CompletionDialogProps {
  open: boolean;
  skillName?: string;
  onClose: () => void;
  onViewStory?: () => void;
  onViewSummary?: () => void;
  onContinueLearning: () => void;
  showStoryButton: boolean;
}

export function CompletionDialog({
  open,
  skillName,
  onClose,
  onViewStory,
  onViewSummary,
  onContinueLearning,
  showStoryButton,
}: CompletionDialogProps) {
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
          Skill mastered
        </Typography>
        {skillName && (
          <Typography
            variant="subtitle1"
            component="p"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            {skillName}
          </Typography>
        )}
      </DialogTitle>

      <DialogActions sx={{ px: 4, pb: 4 }}>
        <Stack spacing={1.5} sx={{ width: '100%' }}>
          {onViewSummary && (
            <Button
              onClick={onViewSummary}
              variant="contained"
              startIcon={<Bolt />}
              fullWidth
            >
              View summary
            </Button>
          )}

          {showStoryButton && onViewStory && (
            <Button onClick={onViewStory} variant="contained" startIcon={<MenuBook />} fullWidth>
              Check out the story
            </Button>
          )}

          <Button
            onClick={onContinueLearning}
            variant={showStoryButton && onViewStory ? 'outlined' : 'contained'}
            startIcon={<ArrowBack />}
            fullWidth
          >
            Back to learning overview
          </Button>

          <Button onClick={onClose} variant="outlined" startIcon={<Replay />} fullWidth>
            Stay at this exercise
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  );
}
