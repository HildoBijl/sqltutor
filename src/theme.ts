import { createTheme } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';
import { createContext } from 'react';

export const getTheme = (mode: PaletteMode) =>
  createTheme({
    palette: {
      mode,
      primary: {
        main: '#c8102e',
        light: '#ff4444',
        dark: '#960000',
      },
      secondary: {
        main: '#262626',
        light: '#3e3e3e',
        dark: '#0f0f0f',
      },
      background: {
        default: mode === 'dark' ? '#181818' : '#f7f7f7',
        paper: mode === 'dark' ? '#21252b' : '#ffffff',
      },
      text: {
        primary: mode === 'dark' ? '#eaecf1' : '#1a1a1a',
        secondary: mode === 'dark' ? '#abb2bf' : '#4a4a4a',
      },
      success: {
        main: '#98bc37',
      },
      error: {
        main: '#e73636',
      },
      divider: mode === 'dark' ? '#3e4451' : '#e0e0e0',
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontSize: '2.5rem', fontWeight: 600 },
      h2: { fontSize: '2rem', fontWeight: 600 },
      h3: { fontSize: '1.75rem', fontWeight: 500 },
      h4: { fontSize: '1.5rem', fontWeight: 500 },
      h5: { fontSize: '1.25rem', fontWeight: 500 },
      h6: { fontSize: '1rem', fontWeight: 500 },
      body1: { fontSize: '1rem', lineHeight: 1.6 },
      body2: { fontSize: '0.875rem', lineHeight: 1.5 },
    },
    shape: { borderRadius: 8 },
    components: {
      MuiButton: {
        styleOverrides: {
          root: { textTransform: 'none', fontWeight: 500, borderRadius: 8 },
          contained: {
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
          },
        },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
      MuiTableCell: {
        styleOverrides: {
          root: { borderColor: mode === 'dark' ? '#3e4451' : '#e0e0e0' },
          head: {
            backgroundColor: mode === 'dark' ? '#282c34' : '#f5f5f5',
            color: '#c8102e',
            fontWeight: 'bold',
          },
          body: { color: mode === 'dark' ? '#eaecf1' : '#1a1a1a' },
        },
      },
      MuiAlert: { styleOverrides: { root: { borderRadius: 8 } } },
      MuiCard: { styleOverrides: { root: { backgroundImage: 'none', borderRadius: 12 } } },
      MuiChip: { styleOverrides: { root: { borderRadius: 16 } } },
      MuiTextField: {
        defaultProps: { variant: 'outlined' },
        styleOverrides: { root: { '& .MuiOutlinedInput-root': { borderRadius: 8 } } },
      },
    },
  });

// Backwards-compat: existing imports that expect a theme object
export const theme = getTheme('light');

export const ColorModeContext = createContext<{
  mode: PaletteMode;
  toggleColorMode: () => void;
}>({ mode: 'dark', toggleColorMode: () => { } });
