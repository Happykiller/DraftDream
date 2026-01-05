// src/routes/router.tsx
import { createBrowserRouter, redirect } from 'react-router-dom';

import { session } from '@stores/session';
import { withTitle } from '@src/routes/withTitle';
import { PublicLayout } from '@layouts/PublicLayout';
import { ProtectedLayout } from '@layouts/ProtectedLayout';
import { AppFallback } from './AppFallback';

// Guard loader for protected branches
export async function requireAuthLoader() {
  const ok = session.getState().access_token !== null;
  if (!ok) throw redirect('/login');
  return null;
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
          return { Component: withTitle(mod.Login, 'login.title') };
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
          return { Component: withTitle(mod.Home, 'home.title') };
        },
      },
      {
        path: '/profile',
        lazy: async () => {
          const mod = await import('@src/pages/Profile');
          return { Component: withTitle(mod.Profile, 'profile.title') };
        },
      },
      {
        path: '/programs',
        lazy: async () => {
          const mod = await import('@src/pages/Programs');
          return { Component: withTitle(mod.Programs, 'programs.title') };
        },
      },
      {
        path: '/meals',
        lazy: async () => {
          const mod = await import('@src/pages/Meals');
          return { Component: withTitle(mod.Meals, 'meals.title') };
        },
      },
      {
        path: '/prospects',
        lazy: async () => {
          const mod = await import('@src/pages/Prospects');
          return { Component: withTitle(mod.Prospects, 'prospects.title') };
        },
      },
      {
        path: '/athletes',
        loader: () => redirect('/athletes/liaison'),
      },
      {
        path: '/athletes/liaison',
        lazy: async () => {
          const mod = await import('@src/pages/Athletes');
          return { Component: withTitle(mod.Athletes, 'athletes.liaison.title') };
        },
      },
      {
        path: '/athletes/information',
        lazy: async () => {
          const mod = await import('@src/pages/AthleteInformation');
          return { Component: withTitle(mod.AthleteInformation, 'athlete_information.title') };
        },
      },
      {
        path: '/sandbox',
        // IMPORTANT: keep an index child for /sandbox routing.
        children: [
          {
            index: true,
            lazy: async () => {
              const mod = await import('@src/pages/Sandbox');
              return { Component: withTitle(mod.Sandbox, 'sandbox.title') };
            },
          },
        ],
      },
      {
        path: '/theme-studio',
        lazy: async () => {
          const mod = await import('@src/pages/ThemeStudio');
          return { Component: withTitle(mod.ThemeStudio, 'theme_studio.title') };
        },
      },
      {
        path: '/users',
        lazy: async () => {
          const mod = await import('@src/pages/Users');
          return { Component: withTitle(mod.Users, 'users.title') };
        },
      },
    ],
  },
  {
    path: '*',
    HydrateFallback: AppFallback,
    lazy: async () => {
      const mod = await import('@src/pages/NotFound');
      return { Component: withTitle(mod.NotFound, 'not_found.title') };
    },
  },
]);
