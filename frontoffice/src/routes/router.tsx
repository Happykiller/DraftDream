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
      {
        path: '/profile',
        lazy: async () => {
          const mod = await import('@src/pages/Profile');
          return { Component: withTitle(mod.Profile, 'profile.title') };
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
          const mod = await import('@src/pages/programs/ProgramsCoach');
          return { Component: withTitle(mod.ProgramsCoach, 'programs-coatch.title') };
        },
      },
      {
        path: 'create',
        lazy: async () => {
          const mod = await import('@src/pages/programs/ProgramCoachCreate');
          return { Component: withTitle(mod.ProgramCoachCreate, 'programs-coatch.builder.title') };
        },
      },
      {
        path: 'view/:programId',
        lazy: async () => {
          const [componentModule, loaderModule] = await Promise.all([
            import('@src/pages/programs/ProgramDetails'),
            import('@src/pages/programs/ProgramDetails.loader'),
          ]);
          return {
            Component: withTitle(
              componentModule.ProgramDetails,
              'programs-details.title',
            ),
            loader: loaderModule.programDetailsLoader,
          };
        },
      },
      {
        path: 'edit/:programId',
        lazy: async () => {
          const [componentModule, loaderModule] = await Promise.all([
            import('@src/pages/programs/ProgramCoachEdit'),
            import('@src/pages/programs/ProgramCoachEdit.loader'),
          ]);
          return {
            Component: withTitle(
              componentModule.ProgramCoachEdit,
              'programs-coatch.builder.edit_title',
            ),
            loader: loaderModule.programCoachEditLoader,
          };
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
          const mod = await import('@src/pages/programs/ProgramsAthlete');
          return { Component: withTitle(mod.ProgramsAthlete, 'programs-athlete.title') };
        },
      },
      {
        path: 'view/:programId',
        lazy: async () => {
          const [componentModule, loaderModule] = await Promise.all([
            import('@src/pages/programs/ProgramDetails'),
            import('@src/pages/programs/ProgramDetails.loader'),
          ]);
          return {
            Component: withTitle(
              componentModule.ProgramDetails,
              'programs-details.title',
            ),
            loader: loaderModule.programDetailsLoader,
          };
        },
      },
    ],
  },
  {
    path: '/nutrition-coach',
    element: <ProtectedLayout />,
    loader: requireAuthLoader,
    children: [
      { 
        index: true,
        lazy: async () => {
          const mod = await import('@src/pages/nutrition/NutritionPlansCoach');
          return {
            Component: withTitle(mod.NutritionPlansCoach, 'nutrition-coach.title'),
          };
        },
      },
      {
        path: 'create',
        lazy: async () => {
          const mod = await import('@src/pages/nutrition/NutritionPlanCoachCreate');
          return {
            Component: withTitle(mod.NutritionPlanCoachCreate, 'nutrition-coach.builder.title'),
          };
        },
      },
      {
        id: 'nutrition-plan-edit',
        path: 'edit/:mealPlanId',
        lazy: async () => {
          const [componentModule, loaderModule] = await Promise.all([
            import('@src/pages/nutrition/NutritionPlanCoachEdit'),
            import('@src/pages/nutrition/NutritionPlanCoachEdit.loader'),
          ]);
          return {
            Component: withTitle(
              componentModule.NutritionPlanCoachEdit,
              'nutrition-coach.builder.edit_title',
            ),
            loader: loaderModule.nutritionPlanCoachEditLoader,
          };
        },
      },
      {
        path: 'view/:mealPlanId',
        lazy: async () => {
          const [componentModule, loaderModule] = await Promise.all([
            import('@src/pages/nutrition/NutritionPlanDetails'),
            import('@src/pages/nutrition/NutritionPlanDetails.loader'),
          ]);
          return {
            Component: withTitle(componentModule.NutritionPlanDetails, 'nutrition-details.title'),
            loader: loaderModule.nutritionPlanDetailsLoader,
          };
        },
      },
    ],
  },
  {
    path: '/nutrition-athlete',
    element: <ProtectedLayout />,
    loader: requireAuthLoader,
    children: [
      {
        index: true,
        lazy: async () => {
          const mod = await import('@src/pages/nutrition/NutritionPlansAthlete');
          return {
            Component: withTitle(mod.NutritionPlansAthlete, 'nutrition-athlete.title'),
          };
        },
      },
      {
        path: 'view/:mealPlanId',
        lazy: async () => {
          const mod = await import('@src/pages/nutrition/NutritionPlanDetails');
          return {
            Component: withTitle(mod.NutritionPlanDetails, 'nutrition-details.title'),
            loader: mod.nutritionPlanDetailsLoader,
          };
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
