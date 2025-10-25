// src/routes/router.tsx
import { createBrowserRouter, redirect } from 'react-router-dom';

import { session } from '@stores/session';
import { withTitle } from '@src/routes/withTitle';
import { PublicLayout } from '@layouts/PublicLayout';
import { ProtectedLayout } from '@layouts/ProtectedLayout';

/** Loader ensuring visitors are authenticated before entering private routes. */
export async function requireAuthLoader() {
  const ok = session.getState().access_token !== null;
  if (!ok) {
    throw redirect('/login');
  }
  return null;
}

/** Central route configuration shared by the application. */
export const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      {
        path: '/login',
        lazy: async () => {
          const mod = await import('@src/pages/Login');
          return { Component: withTitle(mod.Login, 'login.title') };
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
          return { Component: withTitle(mod.Home, 'home.title') };
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
          return { Component: withTitle(mod.Sandbox, 'sandbox.title') };
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
          return { Component: withTitle(mod.ProgramsCoach, 'programs-coatch.title') };
        },
      },
    ],
  },
  {
    path: '/programs-athlete',
    element: <ProtectedLayout />,
    loader: requireAuthLoader,
    children: [
      {
        // ProgramsAthlete
        index: true,
        lazy: async () => {
          const mod = await import('@src/pages/ProgramsAthlete');
          return { Component: withTitle(mod.ProgramsAthlete, 'programs-athlete.title') };
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
          return { Component: withTitle(mod.Clients, 'clients.title') };
        },
      },
    ],
  },
  {
    // NotFound (public by default)
    path: '*',
    lazy: async () => {
      const mod = await import('@src/pages/NotFound');
      return { Component: withTitle(mod.NotFound, 'not_found.page.title') };
    },
  },
]);
