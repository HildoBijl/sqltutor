import { Suspense, useMemo, useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
  value: string;
  tabKey: string;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, tabKey, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== tabKey}
      id={`concept-tabpanel-${tabKey}`}
      aria-labelledby={`concept-tab-${tabKey}`}
      {...other}
    >
      {value === tabKey && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ConceptPage() {
  const { conceptId } = useParams<{ conceptId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [currentTab, setCurrentTab] = useState<string>('theory'); // Fallback to theory tab

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
  const searchParamsString = searchParams.toString();
  const normalizedTabParam = searchParams.get('tab')?.toLowerCase() ?? null;

  const conceptMeta = useMemo<ContentMeta | undefined>(() => {
    if (!conceptId) return undefined;
    return contentIndex.find(item => item.type === 'concept' && item.id === conceptId);
  }, [conceptId]);

  // Sync the active tab with URL params and persisted component state
  useEffect(() => {
    if (!availableTabs.length) return;

    const tabKeys = availableTabs.map((tab) => tab.key);
    const defaultTab = tabKeys.includes('theory') ? 'theory' : tabKeys[0];

    const preferredTab =
      (normalizedTabParam && tabKeys.includes(normalizedTabParam) && normalizedTabParam) ||
      (componentState.tab && tabKeys.includes(componentState.tab) && componentState.tab) ||
      defaultTab;

    if (!preferredTab) return;

    if (preferredTab !== currentTab) {
      setCurrentTab(preferredTab);
    }

    if (componentState.tab !== preferredTab) {
      setComponentState({ tab: preferredTab });
    }

    if (normalizedTabParam !== preferredTab) {
      const params = new URLSearchParams(searchParamsString);
      params.set('tab', preferredTab);
      setSearchParams(params, { replace: true });
    }
  }, [
    availableTabs,
    componentState.tab,
    currentTab,
    normalizedTabParam,
    searchParamsString,
    setComponentState,
    setSearchParams,
  ]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
    setComponentState({ tab: newValue });
    const params = new URLSearchParams(searchParamsString);
    params.set('tab', newValue);
    setSearchParams(params, { replace: true });
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
                value={tab.key}
                id={`concept-tab-${tab.key}`}
                aria-controls={`concept-tabpanel-${tab.key}`}
                label={tab.label} 
                icon={tab.icon} 
                iconPosition="start" 
              />
            ))}
          </Tabs>
        </Box>

        {availableTabs.map((tab) => (
          <TabPanel key={tab.key} value={currentTab} tabKey={tab.key}>
            <CardContent>
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
