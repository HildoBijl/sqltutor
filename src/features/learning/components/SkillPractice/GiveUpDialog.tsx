import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import { Flag } from '@mui/icons-material';

interface GiveUpDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function GiveUpDialog({ open, onConfirm, onCancel }: GiveUpDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Need a Hint?</DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          Are you sure? You can also check out the Theory page to read more about how you might solve this
          exercise.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Keep Trying</Button>
        <Button onClick={onConfirm} color="warning" variant="contained" startIcon={<Flag />}>
          Give Up
        </Button>
      </DialogActions>
    </Dialog>
  );
}

