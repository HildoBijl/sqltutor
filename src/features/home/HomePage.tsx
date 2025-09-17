import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Container,
} from '@mui/material';
import {
  PlayArrow,
  School,
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
          Welcome to SQL Valley
        </Typography>
        <Typography variant="h5" sx={{ mb: 3, opacity: 0.9 }}>
          Master SQL through interactive exercises and real-world scenarios
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
              '&:hover': {
                bgcolor: 'grey.100',
              },
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
            SQL Playground
          </Button>
        </Box>
      </Paper>

      {/* Features Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', textAlign: 'center' }}>
            <CardContent sx={{
              p: 4,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <Box>
                <School sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Learn Concepts
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Master database fundamentals: tables, keys, data types, and more
                </Typography>
              </Box>
              <Button
                variant="outlined"
                onClick={() => navigate('/learn')}
                fullWidth
                sx={{ mt: 'auto' }}
              >
                Explore Concepts
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', textAlign: 'center' }}>
            <CardContent sx={{
              p: 4,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}>
              <Box>
                <Code sx={{ fontSize: 60, color: 'secondary.main', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Practice Skills
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Apply your knowledge with hands-on SQL exercises and real databases
                </Typography>
              </Box>
              <Button
                variant="outlined"
                onClick={() => navigate('/learn')}
                fullWidth
                sx={{ mt: 'auto' }}
              >
                Start Practicing
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
