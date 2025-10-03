// src/routes/router.tsx
import { t } from 'i18next';
import { Box, CircularProgress } from '@mui/material';
import { createBrowserRouter, redirect } from 'react-router-dom';

import { session } from '@stores/session';
import { withTitle } from '@src/routes/withTitle';
import { PublicLayout } from '@layouts/PublicLayout';
import { ProtectedLayout } from '@layouts/ProtectedLayout';

// Guard loader for protected branches
export async function requireAuthLoader() {
  const ok = session.getState().access_token !== null;
  if (!ok) throw redirect('/login');
  return null;
}

function AppFallback(): React.JSX.Element {
  return (
    <Box
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
    </Box>
  );
}

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    HydrateFallback: AppFallback,
    children: [
      {
        path: '/login',
        lazy: async () => {
          const mod = await import('@src/pages/Login');
          return { Component: withTitle(mod.Login, t('login.title')) };
        },
      },
    ],
  },
  {
    element: <ProtectedLayout />,
    loader: requireAuthLoader,
    HydrateFallback: AppFallback,
    children: [
      {
        index: true,
        lazy: async () => {
          const mod = await import('@src/pages/Home');
          return { Component: mod.Home };
        },
      },
      {
        path: '/programs',
        lazy: async () => {
          const mod = await import('@src/pages/Programs');
          return { Component: mod.Programs };
        },
      },
      {
        path: '/sandbox',
        // 👇 IMPORTANT: enfant index pour /sandbox
        children: [
          {
            index: true,
            lazy: async () => {
              const mod = await import('@src/pages/Sandbox');
              return { Component: mod.Sandbox };
            },
          },
        ],
      },
      {
        path: '/users',
        lazy: async () => {
          const mod = await import('@src/pages/Users');
          return { Component: mod.Users };
        },
      },
    ],
  },
  {
    path: '*',
    HydrateFallback: AppFallback,
    lazy: async () => {
      const mod = await import('@src/pages/NotFound');
      return { Component: mod.NotFound };
    },
  },
]);
