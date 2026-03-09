import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';


interface PlanningModeIntroProps {
 open: boolean;
 onClose: () => void;
}

export function PlanningModeIntro({
  open, 
onClose, 
}: PlanningModeIntroProps) {
  

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
        <Typography variant="h5" fontWeight="bold">
          Welcome to planning mode
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ px: 4 }}>
          <Typography variant="body2" color="text.secondary" align='center'> 
            In planning mode, you can set a learning goal and get a personalized learning path to reach it. Click on a pin to set your goal and start planning your learning journey!
          </Typography>
        
      </DialogContent>
      <DialogActions sx={{ px: 4, pb: 4, pt: 2 }}>
        <Button onClick={onClose} variant="contained" fullWidth>Got it</Button>
      </DialogActions>
    </Dialog>
  );
}
