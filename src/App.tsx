import { StrictMode, useEffect, useMemo } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { router } from './navigation';
import { getTheme, ColorModeContext } from './theme';
import { SQLJSProvider, DatabaseProvider } from './components/sql/sqljs';
import { ErrorBoundary } from './components';
import { useSettings, useIsStoreReady } from './store';

export function App() {
  const {currentTheme, setTheme } = useSettings();
  const isStoreReady = useIsStoreReady();

  const muiTheme = useMemo(() => getTheme(currentTheme), [currentTheme]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  const toggleColorMode = () => setTheme(currentTheme === 'light' ? 'dark' : 'light');

  if (!isStoreReady) {
    return null;
  }

  return (
    <StrictMode>
      <ErrorBoundary>
        <ColorModeContext.Provider value={{ mode: currentTheme, toggleColorMode }}>
          <ThemeProvider theme={muiTheme}>
            <CssBaseline />
            <SQLJSProvider>
              <DatabaseProvider>
                <RouterProvider router={router} />
              </DatabaseProvider>
            </SQLJSProvider>
          </ThemeProvider>
        </ColorModeContext.Provider>
      </ErrorBoundary>
    </StrictMode>
  );
}
