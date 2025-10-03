// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import { RouterProvider } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';

import initI18n from '@src/i18n';
import { theme } from '@theme/index';
import { router } from '@routes/router';
import LoaderOverlay from '@components/layout/LoaderOverlay';
import { FlashMessage } from '@components/layout/FlashMessage';

registerSW({ immediate: true });

(async () => {
  await initI18n();

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <FlashMessage />
        <LoaderOverlay />
        <RouterProvider router={router} />
      </ThemeProvider>
    </React.StrictMode>
  );
})();