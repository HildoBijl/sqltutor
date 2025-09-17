import { createBrowserRouter } from 'react-router-dom';
import { Suspense } from 'react';
import { LoadingScreen } from '@/shared/components/LoadingScreen';
import { ErrorBoundary } from '@/shared/components/ErrorBoundary';

// Import components
import HomePage from '@/features/home/HomePage';
import LearningOverviewPage from '@/features/learning/LearningOverviewPage';
import ConceptPage from '@/features/learning/ConceptPage';
import SkillPage from '@/features/learning/SkillPage';
import PlaygroundPage from '@/features/playground/PlaygroundPage';
import { Layout } from '@/features/layout/Layout';

function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Something went wrong</h1>
        <p><a href="/">Return to Home</a></p>
      </div>
    ),
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <HomePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'learn',
        element: (
          <SuspenseWrapper>
            <LearningOverviewPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'concept/:conceptId',
        element: (
          <SuspenseWrapper>
            <ConceptPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'skill/:skillId',
        element: (
          <SuspenseWrapper>
            <SkillPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'playground',
        element: (
          <SuspenseWrapper>
            <PlaygroundPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: '*',
        element: (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <h1>404 - Page not found</h1>
            <p><a href="/">Return to Home</a></p>
          </div>
        ),
      },
    ],
  },
]);