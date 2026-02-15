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
          return { Component: mod.Profile };
        },
      },
    ],
  },
  {
    path: '/athlete-information',
    element: <ProtectedLayout />,
    loader: requireRoleLoader([UserType.Athlete]),
    children: [
      {
        index: true,
        lazy: async () => {
          const mod = await import('@src/pages/AthleteInformation');
          return { Component: withTitle(mod.AthleteInformation, 'athlete_information.title') };
        },
      },
    ],
  },
  {
    path: '/agenda',
    element: <ProtectedLayout />,
    loader: requireRoleLoader([UserType.Athlete]),
    children: [
      {
        index: true,
        lazy: async () => {
          const mod = await import('@src/pages/Agenda');
          return { Component: withTitle(mod.Agenda, 'agenda.title') };
        },
      },
      {
        path: 'daily-report',
        children: [
          {
            index: true,
            lazy: async () => {
              const mod = await import('@src/pages/DailyReport');
              return { Component: withTitle(mod.DailyReport, 'daily_report.title') };
            },
          },
          {
            path: 'view/:reportId',
            lazy: async () => {
              const mod = await import('@src/pages/DailyReportDetail');
              return { Component: withTitle(mod.DailyReportDetail, 'daily_report.title_view') };
            },
          },
        ],
      },
    ],
  },
  {
    path: '/agenda-showcase',
    element: <ProtectedLayout />,
    loader: requireAuthLoader,
    children: [
      {
        index: true,
        lazy: async () => {
          const mod = await import('@src/pages/AgendaShowcase');
          return { Component: withTitle(mod.AgendaShowcase, 'Agenda Showcase') };
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
          const mod = await import('@src/pages/programs/ProgramDetails');
          return {
            Component: withTitle(
              mod.ProgramDetails,
              'programs-details.title',
            ),
          };
        },
      },
      {
        path: 'edit/:programId',
        lazy: async () => {
          const mod = await import('@src/pages/programs/ProgramCoachEdit');
          return {
            Component: withTitle(
              mod.ProgramCoachEdit,
              'programs-coatch.builder.edit_title',
            ),
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
          const mod = await import('@src/pages/programs/ProgramDetails');
          return {
            Component: withTitle(
              mod.ProgramDetails,
              'programs-details.title',
            ),
          };
        },
      },
    ],
  },
  {
    path: '/program-record/:recordId',
    element: <ProtectedLayout />,
    loader: requireAuthLoader,
    children: [
      {
        index: true,
        lazy: async () => {
          const mod = await import('@src/pages/program-records/ProgramRecordDetails');
          return {
            Component: withTitle(mod.ProgramRecordDetails, 'program_record.details.title'),
          };
        },
      },
    ],
  },
  {
    path: '/meal-record/:recordId',
    element: <ProtectedLayout />,
    loader: requireAuthLoader,
    children: [
      {
        index: true,
        lazy: async () => {
          const mod = await import('@src/pages/nutrition-records/MealRecordDetails');
          return {
            Component: withTitle(mod.MealRecordDetails, 'meal_record.details.title'),
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
          const mod = await import('@src/pages/nutrition/NutritionPlanCoachEdit');
          return {
            Component: withTitle(
              mod.NutritionPlanCoachEdit,
              'nutrition-coach.builder.edit_title',
            ),
          };
        },
      },
      {
        path: 'view/:mealPlanId',
        lazy: async () => {
          const mod = await import('@src/pages/nutrition/NutritionPlanDetails');
          return {
            Component: withTitle(mod.NutritionPlanDetails, 'nutrition-details.title'),
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
          };
        },
      },
    ],
  },

  {
    path: '/help-center/coach',
    element: <ProtectedLayout />,
    loader: requireRoleLoader([UserType.Admin, UserType.Coach]),
    children: [
      {
        index: true,
        lazy: async () => {
          const mod = await import('@src/pages/help/HelpCenterCoach');
          return {
            Component: withTitle(mod.HelpCenterCoach, 'help_center.coach.title'),
          };
        },
      },
    ],
  },
  {
    path: '/help-center/athlete',
    element: <ProtectedLayout />,
    loader: requireRoleLoader([UserType.Athlete]),
    children: [
      {
        index: true,
        lazy: async () => {
          const mod = await import('@src/pages/help/HelpCenterAthlete');
          return {
            Component: withTitle(mod.HelpCenterAthlete, 'help_center.athlete.title'),
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
          const mod = await import('@src/pages/prospects/ProspectEdit');
          return {
            Component: withTitle(mod.ProspectEdit, 'prospects.form.edit_page_title'),
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
      {
        path: 'view/:linkId',
        lazy: async () => {
          const mod = await import('@src/pages/athletes/AthleteLinkDetails');
          return {
            Component: withTitle(mod.AthleteLinkDetails, 'athletes.details.title'),
          };
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
