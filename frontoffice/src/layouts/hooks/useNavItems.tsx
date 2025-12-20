// src/layouts/hooks/useNavItems.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import {
  DirectionsRun,
  EmojiEvents,
  FitnessCenter,
  Group,
  Home,
  Info,
  RestaurantMenu,
  Settings,
} from '@mui/icons-material';

import { UserType } from '@src/commons/enums';

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
  return { label: t('prospects.title'), icon: <Group />, path: '/prospects' };
}

function createAthletesItem(t: (key: string) => string): NavItem {
  return { label: t('athletes.title'), icon: <EmojiEvents />, path: '/athletes' };
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
    icon: <DirectionsRun />,
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

function createSandboxItem(t: (key: string) => string): NavItem {
  return { label: t('sandbox.title'), icon: <Settings />, path: '/sandbox' };
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
      );
      break;
    }
    case UserType.Athlete: {
      items.push(
        createProgramsAthleteItem(t),
        createNutritionAthleteItem(t),
        createAthleteInformationItem(t),
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
