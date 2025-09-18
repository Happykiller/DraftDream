// src/routes/router.tsx
import { createBrowserRouter, redirect } from 'react-router-dom';

import { session } from '@stores/session';
import { PublicLayout } from '@layouts/PublicLayout';
import { ProtectedLayout } from '@layouts/ProtectedLayout';

// Guard loader for protected branches
export async function requireAuthLoader() {
  // Replace with your own auth source (context/inversify/jwt)
  //const ok = await authService.isAuthenticated();
  const ok = session.getState().access_token !== null;
  if (!ok) {
    // Use redirect helper from RR to avoid client flicker
    throw redirect('/login');
  }
  return null;
}

export const router = createBrowserRouter([
  {
    // Public routes branch
    element: <PublicLayout />,
    children: [
      {
        path: '/login',
        // Route-level lazy import (newest pattern)
        lazy: async () => {
          const mod = await import('@src/pages/Login');
          return { Component: mod.Login };
        },
      },
    ],
  },
  {
    // Protected routes branch with loader guard
    element: <ProtectedLayout />,
    loader: requireAuthLoader,
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
    path: '/sandbox',
    element: <ProtectedLayout />,
    loader: requireAuthLoader,
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
    lazy: async () => {
      const mod = await import('@src/pages/NotFound');
      return { Component: mod.NotFound };
    },
  },
]);
