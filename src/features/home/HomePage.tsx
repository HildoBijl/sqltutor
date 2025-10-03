import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
} from '@mui/material';
import {
  PlayArrow,
  Code,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Hero Section */}
      <Paper
        sx={{
          p: 6,
          mb: 4,
          background: 'linear-gradient(135deg, #c8102e 0%, #960000 100%)',
          color: 'white',
          borderRadius: 3,
          textAlign: 'center',
        }}
      >
        <Typography variant="h2" gutterBottom fontWeight="bold">
          SQL Valley
        </Typography>
        <Typography variant="h5" sx={{ mb: 3, opacity: 0.9 }}>
          Learn SQL from concepts to practice
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            size="large"
            startIcon={<PlayArrow />}
            onClick={() => navigate('/learn')}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              '&:hover': { bgcolor: 'grey.100' },
            }}
          >
            Start Learning
          </Button>
          <Button
            variant="outlined"
            size="large"
            startIcon={<Code />}
            onClick={() => navigate('/playground')}
            sx={{
              borderColor: 'white',
              color: 'white',
              '&:hover': {
                borderColor: 'white',
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            Try Playground
          </Button>
        </Box>
      </Paper>

    </Container>
  );
}
