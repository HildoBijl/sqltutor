import { useState, useMemo } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
  Divider,
  Typography,
  Chip,
} from '@mui/material';
import {
  ExpandLess,
  ExpandMore,
  CheckCircle,
  RadioButtonUnchecked,
  Book,
  Code,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppStore } from '@/store';
import { contentIndex as learningContentIndex, type ContentMeta } from '@/features/content';

interface SidebarProps {
  open: boolean;
}

type ComponentMeta = ContentMeta;

export function Sidebar({ open }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const components = useAppStore(state => state.components);

  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    concepts: true,
    skills: true,
  });

  const contentItems = useMemo(() => learningContentIndex, []);

  // Group components by type
  const groupedComponents = useMemo(() => {
    const concepts = contentItems.filter((c) => c.type === 'concept');
    const skills = contentItems.filter((c) => c.type === 'skill');
    return { concepts, skills };
  }, [contentItems]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleNavigate = (type: 'concept' | 'skill', componentId: string) => {
    navigate(`/${type}/${componentId}`);
  };

  const isCompleted = (component: ComponentMeta) => {
    const state = components[component.id];
    if (!state) return false;

    // For concepts, check if understood
    if (component.type === 'concept') {
      return state.type === 'concept' ? state.understood === true : false;
    }

    // For skills, check if completed (3+ exercises)
    if (component.type === 'skill') {
      return state.type === 'skill' ? (state.numSolved ?? 0) >= 3 : false;
    }

    return false;
  };

  const getProgress = (component: ComponentMeta) => {
    const state = components[component.id];
    if (!state) return null;

    // For skills, show exercise progress
    if (component.type === 'skill' && state.type === 'skill') {
      const solved = state.numSolved ?? 0;
      return solved > 0 ? `${solved}/3` : null;
    }

    return null;
  };

  const isActive = (component: ComponentMeta) => {
    const path = location.pathname;
    return path.includes(`/${component.type}/${component.id}`);
  };

  const completedConcepts = groupedComponents.concepts.filter(c => isCompleted(c)).length;
  const completedSkills = groupedComponents.skills.filter(s => isCompleted(s)).length;

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? 240 : 72,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? 240 : 72,
          boxSizing: 'border-box',
          top: 64, // Account for header height
          transition: 'width 0.3s',
          overflowX: 'hidden',
          bgcolor: 'background.paper',
          borderRight: 1,
          borderColor: 'divider',
        },
      }}
    >
      {open ? (
        <Box sx={{ overflow: 'auto' }}>
          {/* Concepts Section */}
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => toggleSection('concepts')}>
                <ListItemIcon>
                  <Book />
                </ListItemIcon>
                <ListItemText
                  primary="Concepts"
                  secondary={`${completedConcepts}/${groupedComponents.concepts.length}`}
                />
                {expandedSections.concepts ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>

            <Collapse in={expandedSections.concepts} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {groupedComponents.concepts.map((concept) => {
                  const completed = isCompleted(concept);
                  const active = isActive(concept);

                  return (
                    <ListItem
                      key={concept.id}
                      disablePadding
                      sx={{ pl: 2 }}
                    >
                      <ListItemButton
                        onClick={() => handleNavigate('concept', concept.id)}
                        selected={active}
                        sx={{
                          py: 0.5,
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                          '&.Mui-selected': {
                            bgcolor: 'action.selected',
                            '&:hover': {
                              bgcolor: 'action.selected',
                            },
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {completed ? (
                            <CheckCircle color="success" fontSize="small" />
                          ) : (
                            <RadioButtonUnchecked fontSize="small" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={concept.name}
                          primaryTypographyProps={{
                            fontSize: '0.875rem',
                            color: completed ? 'text.secondary' : 'text.primary',
                            fontWeight: active ? 500 : 400,
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Collapse>
          </List>

          <Divider />

          {/* Skills Section */}
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={() => toggleSection('skills')}>
                <ListItemIcon>
                  <Code />
                </ListItemIcon>
                <ListItemText
                  primary="Skills"
                  secondary={`${completedSkills}/${groupedComponents.skills.length}`}
                />
                {expandedSections.skills ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>

            <Collapse in={expandedSections.skills} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {groupedComponents.skills.map((skill) => {
                  const progress = getProgress(skill);
                  const completed = isCompleted(skill);
                  const active = isActive(skill);

                  return (
                    <ListItem
                      key={skill.id}
                      disablePadding
                      sx={{ pl: 2 }}
                    >
                      <ListItemButton
                        onClick={() => handleNavigate('skill', skill.id)}
                        selected={active}
                        sx={{
                          py: 0.5,
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                          '&.Mui-selected': {
                            bgcolor: 'action.selected',
                            '&:hover': {
                              bgcolor: 'action.selected',
                            },
                          },
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          {completed ? (
                            <CheckCircle color="success" fontSize="small" />
                          ) : (
                            <RadioButtonUnchecked fontSize="small" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={skill.name}
                          primaryTypographyProps={{
                            fontSize: '0.875rem',
                            color: completed ? 'text.secondary' : 'text.primary',
                            fontWeight: active ? 500 : 400,
                          }}
                        />
                        {progress && (
                          <Chip
                            label={progress}
                            size="small"
                            color={completed ? 'success' : 'default'}
                            sx={{ height: 20, fontSize: '0.75rem' }}
                          />
                        )}
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Collapse>
          </List>

          {/* Stats Summary */}
          <Box sx={{ p: 2, mt: 'auto', borderTop: 1, borderColor: 'divider' }}>
            <Typography variant="caption" color="text.secondary">
              Progress Summary
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2">
                Concepts: {completedConcepts}/{groupedComponents.concepts.length}
              </Typography>
              <Typography variant="body2">
                Skills: {completedSkills}/{groupedComponents.skills.length}
              </Typography>
            </Box>
          </Box>
        </Box>
      ) : (
        /* Collapsed Sidebar */
        <List>
          <ListItem disablePadding>
            <ListItemButton
              sx={{ justifyContent: 'center' }}
              onClick={() => navigate('/learn')}
            >
              <ListItemIcon sx={{ justifyContent: 'center' }}>
                <Book />
              </ListItemIcon>
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              sx={{ justifyContent: 'center' }}
              onClick={() => navigate('/learn')}
            >
              <ListItemIcon sx={{ justifyContent: 'center' }}>
                <Code />
              </ListItemIcon>
            </ListItemButton>
          </ListItem>
        </List>
      )}
    </Drawer>
  );
}
