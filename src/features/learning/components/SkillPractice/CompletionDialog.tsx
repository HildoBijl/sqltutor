import { Dialog, DialogTitle, DialogActions, Button, Typography, Box } from '@mui/material';
import { ArrowBack, EmojiEvents, MenuBook, Replay } from '@mui/icons-material';

interface CompletionDialogProps {
  open: boolean;
  skillName?: string;
  onClose: () => void;
  onViewStory?: () => void;
  onContinueLearning: () => void;
  showStoryButton: boolean;
}

export function CompletionDialog({
  open,
  skillName,
  onClose,
  onViewStory,
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
      <DialogTitle sx={{ textAlign: 'center', pt: 4, pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
          <EmojiEvents sx={{ fontSize: 48, color: 'success.main' }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Skill mastered
        </Typography>
        {skillName && (
          <Typography variant="subtitle1" color="text.secondary">
            {skillName}
          </Typography>
        )}
      </DialogTitle>

      <DialogActions
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: 1.5,
          px: 4,
          pb: 4,
        }}
      >
        {showStoryButton && onViewStory && (
          <Button
            onClick={onViewStory}
            variant="contained"
            startIcon={<MenuBook />}
            sx={{ width: '100%', textTransform: 'none' }}
          >
            Check out the story
          </Button>
        )}

        <Button
          onClick={onContinueLearning}
          variant={showStoryButton && onViewStory ? 'outlined' : 'contained'}
          startIcon={<ArrowBack />}
          sx={{ width: '100%', textTransform: 'none' }}
        >
          Back to learning overview
        </Button>

        <Button
          onClick={onClose}
          variant="outlined"
          startIcon={<Replay />}
          sx={{ width: '100%', textTransform: 'none' }}
        >
          Stay at this exercise
        </Button>
      </DialogActions>
    </Dialog>
  );
}
