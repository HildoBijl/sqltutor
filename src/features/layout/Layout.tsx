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
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  School as LearnIcon,
  PlayArrow as PlaygroundIcon,
} from '@mui/icons-material';
import { DarkMode, LightMode, RestartAlt, CenterFocusStrong, Settings, Check } from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useContext, useState } from 'react';
import { ColorModeContext } from '@/theme';
import { useAppStore } from '@/store';

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
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

            {/* Settings Menu */}
            <SettingsMenu />
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

function SettingsMenu() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  
  // Theme context
  const { mode, toggleColorMode } = useContext(ColorModeContext);
  const isLight = mode === 'light';
  
  // Hide stories state
  const hideStories = useAppStore((state) => state.hideStories);
  const toggleHideStories = useAppStore((state) => state.toggleHideStories);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeToggle = () => {
    toggleColorMode();
    // Don't close menu - allow multiple toggles
  };

  const handleHideStoriesToggle = () => {
    toggleHideStories();
    // Don't close menu - allow multiple toggles
  };

  const handleReset = () => {
    const confirmed = window.confirm(
      'Reset all your data? This clears progress, settings, and history.'
    );
    if (!confirmed) {
      handleClose();
      return;
    }

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
    handleClose();
  };

  return (
    <>
      <Tooltip title="Settings">
        <IconButton
          color="inherit"
          onClick={handleClick}
          aria-label="settings"
          aria-controls={open ? 'settings-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
        >
          <Settings />
        </IconButton>
      </Tooltip>
      
      <Menu
        id="settings-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'settings-button',
        }}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleHideStoriesToggle}>
          <ListItemIcon>
            <CenterFocusStrong 
              sx={{ color: hideStories ? 'primary.main' : 'inherit' }} 
            />
          </ListItemIcon>
          <ListItemText>Hide Stories</ListItemText>
          <Check 
            sx={{ 
              color: 'primary.main', 
              ml: 1,
              visibility: hideStories ? 'visible' : 'hidden'
            }} 
          />
        </MenuItem>
        
        <MenuItem onClick={handleThemeToggle}>
          <ListItemIcon>
            {isLight ? <DarkMode /> : <LightMode />}
          </ListItemIcon>
          <ListItemText>
            {isLight ? 'Dark Theme' : 'Light Theme'}
          </ListItemText>
        </MenuItem>
        
        <Divider />
        
        <MenuItem onClick={handleReset}>
          <ListItemIcon>
            <RestartAlt />
          </ListItemIcon>
          <ListItemText>Reset Data</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
}
