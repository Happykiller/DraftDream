// src/layouts/hooks/useNavItems.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';

import {
  DirectionsRun,
  FitnessCenter,
  Group,
  Home,
  Settings,
} from '@mui/icons-material';

export type NavItem = {
  label: string;
  icon: React.ReactNode;
  path: string;
  external?: boolean;
};

function createHomeItem(t: (key: string) => string): NavItem {
  return { label: t('home.title'), icon: <Home />, path: '/' };
}

function createClientsItem(t: (key: string) => string): NavItem {
  return { label: t('clients.title'), icon: <Group />, path: '/clients' };
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

function createSandboxItem(t: (key: string) => string): NavItem {
  return { label: t('sandbox.title'), icon: <Settings />, path: '/sandbox' };
}

type Role = 'admin' | 'coach' | 'athlete' | undefined;

/** Build the navigation menu for the provided role while preserving ordering. */
export function buildNavItems(role: Role, t: (key: string) => string): NavItem[] {
  const items: NavItem[] = [createHomeItem(t)];

  switch (role) {
    case 'admin': {
      items.push(
        createClientsItem(t),
        createProgramsCoachItem(t),
        createProgramsAthleteItem(t),
        createSandboxItem(t),
      );
      break;
    }
    case 'coach': {
      items.push(createClientsItem(t), createProgramsCoachItem(t));
      break;
    }
    case 'athlete': {
      items.push(createProgramsAthleteItem(t));
      break;
    }
    default: {
      break;
    }
  }

  return items;
}

/** Return role-based navigation items. Pure list, memoized by role. */
export function useNavItems(role?: string): NavItem[] {
  const { t } = useTranslation();

  return React.useMemo(() => buildNavItems(role as Role, t), [role, t]);
}
