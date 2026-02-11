// src/layouts/hooks/useNavItems.tsx
import * as React from 'react';
import {
  Home,
  Group,
  ManageAccounts,
  Palette,
  Settings,
  PersonSearch,
  InfoOutlined,
  LinkOutlined,
  FitnessCenter,
  StickyNote2,
  RestaurantMenu,
  SportsGymnastics,
  TaskAlt,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export type NavItem = {
  label: string;
  icon: React.ReactNode;
  path: string;
  external?: boolean;
  children?: NavItem[];
};

/** Return role-based navigation items. Pure list, memoized by role. */
export function useNavItems(role?: string): NavItem[] {
  const { t } = useTranslation();

  return React.useMemo(() => {
    const base: NavItem[] = [
      { label: t('home.title'), icon: <Home />, path: '/' },
    ];

    if (role === 'admin') {
      base.push(
        {
          label: t('programs.title'),
          icon: <FitnessCenter />,
          path: '/programs',
        },
        {
          label: t('meals.title'),
          icon: <RestaurantMenu />,
          path: '/meals',
        },
        {
          label: t('tasks.title'),
          icon: <TaskAlt />,
          path: '/tasks',
        },
        {
          label: t('notes.title'),
          icon: <StickyNote2 />,
          path: '/notes',
        },
        {
          label: t('prospects.title'),
          icon: <PersonSearch />,
          path: '/prospects',
        },
        {
          label: t('athletes.title'),
          icon: <SportsGymnastics />,
          path: '/athletes/liaison',
          children: [
            { label: t('athletes.nav.liaison'), icon: <LinkOutlined />, path: '/athletes/liaison' },
            { label: t('athletes.nav.information'), icon: <InfoOutlined />, path: '/athletes/information' },
          ],
        },
        {
          label: t('coach.title'),
          icon: <ManageAccounts />,
          path: '/coach',
        },
        {
          label: t('users.title'),
          icon: <Group />,
          path: '/users',
        },
      );
    }

    base.push(
      { label: t('sandbox.title'), icon: <Settings />, path: '/sandbox' },
      { label: t('themeStudio.title'), icon: <Palette />, path: '/theme-studio' }
    );

    return base;
  }, [role, t]);
}
