// src/routes/router.tsx
import { createBrowserRouter, redirect } from 'react-router-dom';

import { PublicLayout } from '@layouts/PublicLayout';
import { ProtectedLayout } from '@layouts/ProtectedLayout';

// Guard loader for protected branches
export async function requireAuthLoader() {
  // Replace with your own auth source (context/inversify/jwt)
  //const ok = await authService.isAuthenticated();
  const ok =  false;
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
          const mod = await import('@pages/LoginPage');
          return { Component: mod.LoginPage };
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
          const mod = await import('@pages/HomePage');
          return { Component: mod.HomePage };
        },
      },
      // Add more protected children later...
    ],
  },
  {
    // NotFound (public by default)
    path: '*',
    lazy: async () => {
      const mod = await import('@pages/NotFoundPage');
      return { Component: mod.NotFoundPage };
    },
  },
]);
