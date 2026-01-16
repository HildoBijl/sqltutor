import { AppBar, Toolbar, Typography, Box, Button, Container } from '@mui/material';
import {
  AutoStories as LearnIcon,
  // PlayArrow as PlaygroundIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAdminMode } from '@/learning/hooks/useAdminMode';
import { useSkillTreeHistory } from '@/learning/hooks/useSkillTreeHistory';
import { getSkillTreeDefinitions } from '@/learning/utils/skillTreeTracking';
import { SettingsMenu } from './Settings';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = useAdminMode();
  const skillTreeHistory = useSkillTreeHistory();
  const navItems = getSkillTreeDefinitions()
    .filter((tree) => isAdmin || skillTreeHistory.includes(tree.id))
    .map((tree) => ({
      path: tree.path,
      label: tree.label,
      icon: LearnIcon,
    }));

  return (
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
                location.pathname.startsWith(`${item.path}/`);

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

          <SettingsMenu />
        </Toolbar>
      </Container>
    </AppBar>
  );
}
