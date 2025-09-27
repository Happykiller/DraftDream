// src/routes/router.tsx
import { t } from 'i18next';
import { createBrowserRouter, redirect } from 'react-router-dom';

import { session } from '@stores/session';
import { withTitle } from '@src/routes/withTitle';
import { PublicLayout } from '@layouts/PublicLayout';
import { ProtectedLayout } from '@layouts/ProtectedLayout';
import { Box, CircularProgress } from '@mui/material';

// Guard loader for protected branches
export async function requireAuthLoader() {
  const ok = session.getState().access_token !== null;
  if (!ok) {
    throw redirect('/login');
  }
  return null;
}

function AppFallback(): React.JSX.Element {
  return <Box
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <CircularProgress size={60} />
    </Box>;
}

export const router = createBrowserRouter([
  {
    // Public routes branch
    element: <PublicLayout />,
    HydrateFallback: AppFallback,
    children: [
      {
        path: '/login',
        // Route-level lazy import (newest pattern)
        lazy: async () => {
          const mod = await import('@src/pages/Login');
          return { Component: withTitle(mod.Login, t('login.title')) };
        },
      },
    ],
  },
  {
    // Protected routes branch with loader guard
    element: <ProtectedLayout />,
    loader: requireAuthLoader,
    HydrateFallback: AppFallback,
    children: [
      {
        // Home
        index: true, // "/" as index under this branch
        lazy: async () => {
          const mod = await import('@src/pages/Home');
          return { Component: mod.Home };
        },
      },
      // Add more protected children later...
    ],
  },
  {
    // Protected routes branch with loader guard
    element: <ProtectedLayout />,
    loader: requireAuthLoader,
    HydrateFallback: AppFallback,
    children: [
      {
        // Programs
        path: '/programs',
        lazy: async () => {
          const mod = await import('@src/pages/Programs');
          return { Component: mod.Programs };
        },
      },
      // Add more protected children later...
    ],
  },
  {
    // Protected routes branch with loader guard
    path: '/sandbox',
    element: <ProtectedLayout />,
    loader: requireAuthLoader,
    HydrateFallback: AppFallback,
    children: [
      {
        // Home
        index: true, // "/" as index under this branch
        lazy: async () => {
          const mod = await import('@src/pages/Sandbox');
          return { Component: mod.Sandbox };
        },
      },
      // Add more protected children later...
    ],
  },
  {
    // NotFound (public by default)
    path: '*',
    HydrateFallback: AppFallback,
    lazy: async () => {
      const mod = await import('@src/pages/NotFound');
      return { Component: mod.NotFound };
    },
  },
]);
