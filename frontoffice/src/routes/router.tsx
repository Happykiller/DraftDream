// src/routes/router.tsx
import { t } from 'i18next';
import { createBrowserRouter, redirect } from 'react-router-dom';

import { session } from '@stores/session';
import { withTitle } from '@src/routes/withTitle';
import { PublicLayout } from '@layouts/PublicLayout';
import { ProtectedLayout } from '@layouts/ProtectedLayout';

export async function requireAuthLoader() {
  const ok = session.getState().access_token !== null;
  if (!ok) {
    throw redirect('/login');
  }
  return null;
}

export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
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
    children: [
      {
        // Home
        index: true,
        lazy: async () => {
          const mod = await import('@src/pages/Home');
          return { Component: withTitle(mod.Home, t('home.title'))  };
        },
      },
    ],
  },
  {
    path: '/sandbox',
    element: <ProtectedLayout />,
    loader: requireAuthLoader,
    children: [
      {
        // Home
        index: true,
        lazy: async () => {
          const mod = await import('@src/pages/Sandbox');
          return { Component: withTitle(mod.Sandbox, t('sandbox.title'))  };
        },
      },
    ],
  },
  {
    path: '/programs-coach',
    element: <ProtectedLayout />,
    loader: requireAuthLoader,
    children: [
      {
        // ProgramsCoach
        index: true,
        lazy: async () => {
          const mod = await import('@src/pages/ProgramsCoach');
          return { Component: withTitle(mod.ProgramsCoach, t('programs-coatch.title'))  };
        },
      },
    ],
  },
  {
    path: '/clients',
    element: <ProtectedLayout />,
    loader: requireAuthLoader,
    children: [
      {
        // ProgramsCoach
        index: true,
        lazy: async () => {
          const mod = await import('@src/pages/Clients');
          return { Component: withTitle(mod.Clients, t('client.title'))  };
        },
      },
    ],
  },
  {
    // NotFound (public by default)
    path: '*',
    lazy: async () => {
      const mod = await import('@src/pages/NotFound');
      return { Component: withTitle(mod.NotFound, t('notfound.title'))  };
    },
  },
]);
