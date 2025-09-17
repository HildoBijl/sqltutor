import { AppBar, Toolbar, Typography, IconButton, Box, Button } from '@mui/material';
import {
  Menu as MenuIcon,
  ArrowBack as BackIcon,
  Home as HomeIcon,
  School as LearnIcon,
  FitnessCenter as PracticeIcon,
  Timeline as ProgressIcon,
  Code as PlaygroundIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const toggleSidebar = useAppStore((state) => state.toggleSidebar);

  const isHome = location.pathname === '/';

  const navItems = [
    { path: '/', label: 'Home', icon: HomeIcon },
    { path: '/learn', label: 'Learn', icon: LearnIcon },
    { path: '/practice', label: 'Practice', icon: PracticeIcon },
    { path: '/progress', label: 'Progress', icon: ProgressIcon },
    { path: '/playground', label: 'Playground', icon: PlaygroundIcon },
  ];

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        bgcolor: 'background.paper',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Toolbar>
        {/* Menu/Back Button */}
        <IconButton
          edge="start"
          color="inherit"
          aria-label={isHome ? 'menu' : 'back'}
          onClick={isHome ? toggleSidebar : handleBack}
          sx={{ mr: 2 }}
        >
          {isHome ? <MenuIcon /> : <BackIcon />}
        </IconButton>

        {/* Title */}
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 0,
            mr: 4,
            fontWeight: 600,
            color: 'primary.main',
          }}
        >
          SQL Valley
        </Typography>

        {/* Navigation */}
        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1 }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path === '/' ? '/home' : item.path);

            return (
              <Button
                key={item.path}
                startIcon={<Icon />}
                onClick={() => navigate(item.path)}
                sx={{
                  color: isActive ? 'primary.main' : 'text.secondary',
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
