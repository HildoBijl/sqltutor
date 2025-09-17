import { Outlet } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Container,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Home as HomeIcon,
  School as LearnIcon,
  PlayArrow as PlaygroundIcon,
} from '@mui/icons-material';
import { DarkMode, LightMode, RestartAlt } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { ColorModeContext } from '@/theme';

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: HomeIcon },
    { path: '/learn', label: 'Learn', icon: LearnIcon },
    { path: '/playground', label: 'Playground', icon: PlaygroundIcon },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar position="static" sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
        <Container maxWidth="lg">
          <Toolbar>
            {/* Logo/Title */}
            <Typography
              variant="h6"
              component="div"
              sx={{
                flexGrow: 0,
                mr: 4,
                fontWeight: 600,
                color: 'primary.main',
                cursor: 'pointer',
              }}
              onClick={() => navigate('/')}
            >
              SQL Valley
            </Typography>

            {/* Navigation */}
            <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path ||
                  (item.path !== '/' && location.pathname.startsWith(item.path));

                return (
                  <Button
                    key={item.path}
                    startIcon={<Icon />}
                    onClick={() => navigate(item.path)}
                    sx={{
                      color: isActive ? 'primary.main' : 'text.secondary',
                      fontWeight: isActive ? 600 : 400,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                );
              })}
            </Box>

            {/* Theme toggle */}
            <ThemeToggle />

            {/* Reset data */}
            <ResetDataButton />
          </Toolbar>
        </Container>
      </AppBar>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          minHeight: 'calc(100vh - 64px)', // Subtract AppBar height
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

function ThemeToggle() {
  const { mode, toggleColorMode } = useContext(ColorModeContext);
  const isLight = mode === 'light';
  return (
    <Tooltip title={isLight ? 'Switch to dark mode' : 'Switch to light mode'}>
      <IconButton color="inherit" onClick={toggleColorMode} aria-label="toggle color mode">
        {isLight ? <DarkMode /> : <LightMode />}
      </IconButton>
    </Tooltip>
  );
}

function ResetDataButton() {
  const handleReset = () => {
    const confirmed = window.confirm(
      'Reset all your data? This clears progress, settings, and history.'
    );
    if (!confirmed) return;

    try {
      // Collect and remove app-specific localStorage keys
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (!key) continue;
        if (key === 'sqltutor-storage' || key.startsWith('component-')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => window.localStorage.removeItem(k));

      // Reload to fully reset in-memory state (avoids re-persisting stale store)
      window.location.reload();
    } catch (err) {
      console.error('Failed to reset data:', err);
      alert('Sorry, something went wrong resetting your data.');
    }
  };

  return (
    <Tooltip title="Reset all data">
      <IconButton color="inherit" onClick={handleReset} aria-label="reset all data">
        <RestartAlt />
      </IconButton>
    </Tooltip>
  );
}
