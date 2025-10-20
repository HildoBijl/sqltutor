import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Stack,
  Paper,
  useTheme,
  alpha,
  Divider,
  Link,
} from '@mui/material';
import {
  PlayArrow,
  Code,
  School,
  AutoStories,
  TrendingUp,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const theme = useTheme();
  const navigate = useNavigate();

  const steps = [
    {
      icon: <AutoStories fontSize="large" />,
      title: 'Learn Concepts',
      description: 'Start with fundamental database concepts. Each concept includes theory pages and examples to help you understand the underlying principles.',
    },
    {
      icon: <Code fontSize="large" />,
      title: 'Practice Skills',
      description: 'Apply what you\'ve learned through skill-specific exercises. Write SQL queries and get immediate feedback on whether they produce the expected results.',
    },
    {
      icon: <TrendingUp fontSize="large" />,
      title: 'Track Progress',
      description: 'The skill tree shows which concepts and skills you\'ve completed and which are available next. Prerequisites are clearly marked so you know what to learn first.',
    },
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: 'white',
          py: { xs: 6, md: 10 },
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h2"
            gutterBottom
            sx={{
              fontWeight: 600,
              fontSize: { xs: '2rem', md: '3rem' },
              mb: 3,
            }}
          >
            SQL Valley
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              opacity: 0.95,
              fontWeight: 400,
              lineHeight: 1.6,
            }}
          >
            An interactive learning tool for SQL developed by the Database Group at TU/e. 
            Navigate through concepts and skills using a visual skill tree, practice with real databases, 
            and get immediate feedback on your queries.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button
              variant="contained"
              size="large"
              startIcon={<School />}
              onClick={() => navigate('/learn')}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                py: 1.5,
                px: 3,
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
                py: 1.5,
                px: 3,
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              SQL Playground
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 6, textAlign: 'center' }}>
          How It Works
        </Typography>
        
        <Grid container spacing={4}>
          {steps.map((step, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Box sx={{ textAlign: 'center' }}>
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 3,
                  }}
                >
                  <Box sx={{ color: 'primary.main' }}>
                    {step.icon}
                  </Box>
                </Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, mb: 2 }}>
                  {step.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {step.description}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* About Section */}
      <Box sx={{ bgcolor: 'background.paper', py: 8 }}>
        <Container maxWidth="md">
          <Paper
            elevation={0}
            sx={{
              p: 4,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
            }}
          >
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
              About This Tool
            </Typography>
            <Stack spacing={2}>
              <Typography variant="body1" color="text.secondary">
                SQL Valley was developed by the Database Group at Eindhoven University of Technology 
                to support student-centered, competency-based SQL instruction.
              </Typography>
              <Typography variant="body1" color="text.secondary">
                The tool addresses common challenges in learning SQL: lack of immediate feedback, 
                difficulty setting up local databases, and unclear learning progression. By providing 
                a structured skill tree with integrated theory and practice, students can learn at 
                their own pace while maintaining clear visibility of their progress.
              </Typography>
              <Typography variant="body1" color="text.secondary">
                All SQL queries run directly in your browser using an in-memory database, so you can 
                practice safely without worrying about breaking anything or needing to install software.
              </Typography>
            </Stack>
          </Paper>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
          Ready to Learn SQL?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Start with the basics or jump to any concept you want to explore.
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<PlayArrow />}
          onClick={() => navigate('/learn')}
          sx={{
            py: 1.5,
            px: 4,
          }}
        >
          Begin Learning
        </Button>
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {/* Project Info */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                SQL Valley
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Interactive SQL learning platform for TU/e database courses (2ID50, JBI050)
              </Typography>
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                Contact
              </Typography>
              <Stack spacing={0.5}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Hildo Bijl · 
                    <Link
                      href="mailto:h.j.bijl@tue.nl"
                      sx={{
                        ml: 0.5,
                        color: 'text.secondary',
                        textDecoration: 'none',
                        '&:hover': { color: 'primary.main' },
                      }}
                    >
                      h.j.bijl@tue.nl
                    </Link>
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Nick Yakovets · 
                    <Link
                      href="mailto:n.yakovets@tue.nl"
                      sx={{
                        ml: 0.5,
                        color: 'text.secondary',
                        textDecoration: 'none',
                        '&:hover': { color: 'primary.main' },
                      }}
                    >
                      n.yakovets@tue.nl
                    </Link>
                  </Typography>
                </Box>
              </Stack>
            </Grid>

            {/* Team */}
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                Development Team
              </Typography>
              <Stack spacing={0.5}>
                <Typography variant="body2" color="text.secondary">
                  Strahil Peykov (Educational Programmer)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Alexandra Boala (Skill Tree Developer)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Razvan (Storyline Designer)
                </Typography>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} Eindhoven University of Technology
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
