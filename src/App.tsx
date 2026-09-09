import { StrictMode, useEffect, useMemo } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { router } from '@/navigation';
import { ExerciseStorageProvider } from '@sqlvalley/exercise-engine';
import { getTheme, ColorModeContext } from '@sqlvalley/ui';
import { SQLJSProvider, DatabaseProvider } from '@sqlvalley/sql/sqljs';
import { ErrorBoundary } from '@sqlvalley/ui';
import { exerciseStorage } from './exerciseStorage';
import { useHasHydrated, useSettingsStore } from './store';

export function App() {
  const mode = useSettingsStore((s) => s.currentTheme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const isStoreReady = useHasHydrated();

  const muiTheme = useMemo(() => getTheme(mode), [mode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  const toggleColorMode = () => setTheme(mode === 'light' ? 'dark' : 'light');

  if (!isStoreReady) {
    return null;
  }

  return (
    <StrictMode>
      <ErrorBoundary>
        <ColorModeContext.Provider value={{ mode, toggleColorMode }}>
          <ThemeProvider theme={muiTheme}>
            <CssBaseline />
            <SQLJSProvider>
              <DatabaseProvider>
                <ExerciseStorageProvider storage={exerciseStorage}>
                  <RouterProvider router={router} />
                </ExerciseStorageProvider>
              </DatabaseProvider>
            </SQLJSProvider>
          </ThemeProvider>
        </ColorModeContext.Provider>
      </ErrorBoundary>
    </StrictMode>
  );
}
