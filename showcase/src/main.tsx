import './styles.css';

import { CssBaseline, ThemeProvider } from '@mui/material';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';

import App from './App.tsx';
import theme from './theme/index.ts';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element not found');
}

createRoot(container).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <HashRouter>
        <App />
      </HashRouter>
    </ThemeProvider>
  </StrictMode>
);
