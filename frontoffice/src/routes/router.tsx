// src/routes/router.tsx
import { createBrowserRouter, redirect } from 'react-router-dom';

import { session } from '@stores/session';
import { UserType } from '@src/commons/enums';
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

/** Loader enforcing both authentication and role membership. */
export function requireRoleLoader(allowedRoles: UserType[]) {
  const allowed = new Set<UserType>(allowedRoles);

  return () => {
    const { access_token, role } = session.getState();
    if (!access_token) {
      throw redirect('/login');
    }

    const roleIsAllowed = role && allowed.has(role as UserType);
    if (!roleIsAllowed) {
      throw redirect('/');
    }

    return null;
  };
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
    path: '/prospects',
    element: <ProtectedLayout />,
    loader: requireRoleLoader([UserType.Admin, UserType.Coach]),
    children: [
      {
        index: true,
        lazy: async () => {
          const mod = await import('@src/pages/Prospects');
          return { Component: withTitle(mod.Prospects, 'prospects.title') };
        },
      },
      {
        path: 'create',
        lazy: async () => {
          const mod = await import('@src/pages/prospects/ProspectCreate');
          return { Component: withTitle(mod.ProspectCreate, 'prospects.form.create_page_title') };
        },
      },
      {
        path: 'edit/:prospectId',
        lazy: async () => {
          const [componentModule, loaderModule] = await Promise.all([
            import('@src/pages/prospects/ProspectEdit'),
            import('@src/pages/prospects/ProspectEdit.loader'),
          ]);
          return {
            Component: withTitle(componentModule.ProspectEdit, 'prospects.form.edit_page_title'),
            loader: loaderModule.prospectEditLoader,
          };
        },
      },
    ],
  },
  {
    path: '/athletes',
    element: <ProtectedLayout />,
    loader: requireRoleLoader([UserType.Admin, UserType.Coach]),
    children: [
      {
        index: true,
        lazy: async () => {
          const mod = await import('@src/pages/Athletes');
          return { Component: withTitle(mod.Athletes, 'athletes.title') };
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
