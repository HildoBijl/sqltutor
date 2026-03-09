import { Dialog, DialogTitle, Typography} from '@mui/material';


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
        <Typography
            variant="h5" 
            fontWeight="bold">
                Welcome to planning mode
            </Typography>
     </DialogTitle>
    </Dialog>
  );
}
