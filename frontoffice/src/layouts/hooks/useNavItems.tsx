// src/layouts/hooks/useNavItems.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import {
  Home,
  Info,
  Settings,
  PersonSearch,
  FitnessCenter,
  RestaurantMenu,
  SportsGymnastics,
  HelpCenter,
  CalendarMonth,
} from '@mui/icons-material';

import { UserType } from '@src/commons/enums.js';

export type NavItem = {
  label: string;
  icon: React.ReactNode;
  path: string;
  external?: boolean;
};

function createHomeItem(t: (key: string) => string): NavItem {
  return { label: t('home.title'), icon: <Home />, path: '/' };
}

function createProspectsItem(t: (key: string) => string): NavItem {
  return { label: t('prospects.title'), icon: <PersonSearch />, path: '/prospects' };
}

function createAthletesItem(t: (key: string) => string): NavItem {
  return { label: t('athletes.title'), icon: <SportsGymnastics />, path: '/athletes' };
}

function createProgramsCoachItem(t: (key: string) => string): NavItem {
  return {
    label: t('programs-coatch.title'),
    icon: <FitnessCenter />,
    path: '/programs-coach',
  };
}

function createProgramsAthleteItem(t: (key: string) => string): NavItem {
  return {
    label: t('programs-athlete.title'),
    icon: <FitnessCenter />,
    path: '/programs-athlete',
  };
}

function createNutritionCoachItem(t: (key: string) => string): NavItem {
  return {
    label: t('nutrition-coach.title'),
    icon: <RestaurantMenu />,
    path: '/nutrition-coach',
  };
}

function createNutritionAthleteItem(t: (key: string) => string): NavItem {
  return {
    label: t('nutrition-athlete.title'),
    icon: <RestaurantMenu />,
    path: '/nutrition-athlete',
  };
}

function createAthleteInformationItem(t: (key: string) => string): NavItem {
  return {
    label: t('athlete_information.title'),
    icon: <Info />,
    path: '/athlete-information',
  };
}

function createAgendaItem(t: (key: string) => string): NavItem {
  return {
    label: t('agenda.title'),
    icon: <CalendarMonth />,
    path: '/agenda',
  };
}

function createSandboxItem(t: (key: string) => string): NavItem {
  return { label: t('sandbox.title'), icon: <Settings />, path: '/sandbox' };
}

function createHelpCenterCoachItem(t: (key: string) => string): NavItem {
  return {
    label: t('help_center.nav_title'),
    icon: <HelpCenter />,
    path: '/help-center/coach',
  };
}

function createHelpCenterAthleteItem(t: (key: string) => string): NavItem {
  return {
    label: t('help_center.nav_title'),
    icon: <HelpCenter />,
    path: '/help-center/athlete',
  };
}

export type Role = UserType | 'guest' | undefined;

/** Build the navigation menu for the provided role while preserving ordering. */
export function buildNavItems(role: Role, t: (key: string) => string): NavItem[] {
  const items: NavItem[] = [createHomeItem(t)];

  switch (role) {
    case UserType.Admin: {
      items.push(
        createProspectsItem(t),
        createAthletesItem(t),
        createProgramsCoachItem(t),
        createProgramsAthleteItem(t),
        createNutritionCoachItem(t),
        createNutritionAthleteItem(t),
        createHelpCenterCoachItem(t),
        createSandboxItem(t),
      );
      break;
    }
    case UserType.Coach: {
      items.push(
        createProspectsItem(t),
        createAthletesItem(t),
        createProgramsCoachItem(t),
        createNutritionCoachItem(t),
        createHelpCenterCoachItem(t),
      );
      break;
    }
    case UserType.Athlete: {
      items.push(
        createProgramsAthleteItem(t),
        createNutritionAthleteItem(t),
        createAgendaItem(t),
        createAthleteInformationItem(t),
        createHelpCenterAthleteItem(t),
      );
      break;
    }
    default: {
      break;
    }
  }

  return items;
}

/** Return role-based navigation items. Pure list, memoized by role. */
export function useNavItems(role?: Role): NavItem[] {
  const { t } = useTranslation();

  return React.useMemo(() => buildNavItems(role, t), [role, t]);
}
