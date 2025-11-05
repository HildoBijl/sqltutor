import { ArrowBack, CheckCircle } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface ContentHeaderProps {
  title: string;
  description?: string;
  onBack: () => void;
  icon?: ReactNode;
  isCompleted?: boolean;
  progress?: {
    current: number;
    required: number;
    label?: string;
  };
  trailingContent?: ReactNode;
}

export function ContentHeader({
  title,
  description,
  onBack,
  icon,
  isCompleted,
  progress,
  trailingContent,
}: ContentHeaderProps) {
  const showProgress =
    progress && typeof progress.current === 'number' && typeof progress.required === 'number';

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Button startIcon={<ArrowBack />} onClick={onBack} sx={{ mr: 2 }}>
          Back to Learning
        </Button>
        {icon && (
          <Box sx={{ mr: 1, display: 'flex', alignItems: 'center' }}>
            {icon}
          </Box>
        )}
        <Typography variant="h4" sx={{ flexGrow: 1 }}>
          {title}
          {isCompleted && <CheckCircle color="success" sx={{ ml: 1 }} />}
        </Typography>
        {showProgress && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {progress.label ?? 'Progress:'}
            </Typography>
            <Box
              sx={{
                bgcolor:
                  progress.current >= progress.required ? 'success.main' : 'primary.main',
                color: 'common.white',
                px: 1.5,
                py: 0.5,
                borderRadius: 1,
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              {Math.min(progress.current, progress.required)}/{progress.required}
            </Box>
            {progress.current >= progress.required && (
              <Typography variant="body2" color="success.main" sx={{ fontWeight: 500 }}>
                Mastered!
              </Typography>
            )}
          </Box>
        )}
        {trailingContent}
      </Box>

      {description && (
        <Box sx={{ mb: 2, pl: 2 }}>
          <Typography variant="body1" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
            {description}
          </Typography>
        </Box>
      )}
    </>
  );
}
