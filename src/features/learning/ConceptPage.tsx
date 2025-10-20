import { Suspense, useMemo, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Tabs,
  Tab,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  CheckCircle,
  School,
  Lightbulb,
  MenuBook,
  OndemandVideo,
} from '@mui/icons-material';

import { useComponentState, useAppStore, type ConceptComponentState } from '@/store';
import { contentIndex, type ContentMeta } from '@/features/content';
import { useContent } from './hooks/useContent';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`concept-tabpanel-${index}`}
      aria-labelledby={`concept-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ConceptPage() {
  const { conceptId } = useParams<{ conceptId: string }>();
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(1); // Start with theory tab

  // Use new store
  const [componentState, setComponentState] = useComponentState<ConceptComponentState>(conceptId || '', 'concept');
  const hideStories = useAppStore((state) => state.hideStories);

  // Define available tabs, filtering out story if hideStories is enabled
  const allTabs = [
    { key: 'story', label: 'Story', icon: <MenuBook /> },
    { key: 'theory', label: 'Theory', icon: <Lightbulb /> },
    { key: 'video', label: 'Video', icon: <OndemandVideo /> },
    { key: 'summary', label: 'Summary', icon: <MenuBook /> },
  ];
  
  const availableTabs = allTabs.filter(tab => !(hideStories && tab.key === 'story'));

  const conceptMeta = useMemo<ContentMeta | undefined>(() => {
    if (!conceptId) return undefined;
    return contentIndex.find(item => item.type === 'concept' && item.id === conceptId);
  }, [conceptId]);

  // Always default to theory tab
  useEffect(() => {
    const theoryIndex = availableTabs.findIndex(tab => tab.key === 'theory');
    if (theoryIndex >= 0) {
      setCurrentTab(theoryIndex);
      setComponentState({ tab: 'theory' });
    }
  }, [availableTabs.length, hideStories]); // Only depend on tab count and hideStories changes

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    const selectedTab = availableTabs[newValue];
    if (selectedTab) {
      setComponentState({ tab: selectedTab.key });
    }
  };

  if (!conceptMeta) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">
          Concept not found
          <Button onClick={() => navigate('/learn')}>Return to learning</Button>
        </Alert>
      </Container>
    );
  }

  const isCompleted = componentState.understood || false;

  const handleComplete = () => {
    setComponentState({ understood: true });
  };

  const TheoryContent = useContent(conceptMeta?.id, 'Theory');
  const SummaryContent = useContent(conceptMeta?.id, 'Summary');
  const StoryContent = useContent(conceptMeta?.id, 'Story');
  const VideoContent = useContent(conceptMeta?.id, 'Video');

  const renderContent = (
    Component: ReturnType<typeof useContent>,
    emptyMessage: string,
  ) => {
    if (!Component) {
      return <Typography variant="body1" color="text.secondary">{emptyMessage}</Typography>;
    }
    return (
      <Suspense fallback={<Typography variant="body1" color="text.secondary">Loading content...</Typography>}>
        <Component />
      </Suspense>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/learn')}
          sx={{ mr: 2 }}
        >
          Back to Learning
        </Button>
        <School color="primary" sx={{ mr: 1 }} />
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          {conceptMeta.name}
          {isCompleted && <CheckCircle color="success" sx={{ ml: 1 }} />}
        </Typography>
      </Box>

      {/* Concept Info */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" color="text.secondary">
          {conceptMeta.description}
        </Typography>
      </Box>

      {/* Content Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={currentTab} onChange={handleTabChange}>
            {availableTabs.map((tab) => (
              <Tab 
                key={tab.key}
                label={tab.label} 
                icon={tab.icon} 
                iconPosition="start" 
              />
            ))}
          </Tabs>
        </Box>

        {availableTabs.map((tab, index) => (
          <TabPanel key={tab.key} value={currentTab} index={index}>
            <CardContent>
              <Typography variant="h5" gutterBottom>{tab.label}</Typography>
              {tab.key === 'theory' && renderContent(TheoryContent, 'Theory content coming soon.')}
              {tab.key === 'video' && renderContent(VideoContent, 'Video coming soon.')}
              {tab.key === 'summary' && renderContent(SummaryContent, 'Summary coming soon.')}
              {tab.key === 'story' && renderContent(StoryContent, 'Story coming soon.')}
            </CardContent>
          </TabPanel>
        ))}

      </Card>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <div />

        <Box sx={{ display: 'flex', gap: 2 }}>
          {!isCompleted && (
            <Button
              variant="contained"
              onClick={handleComplete}
              startIcon={<CheckCircle />}
            >
              Mark as Complete
            </Button>
          )}
        </Box>
      </Box>
    </Container>
  );
}
