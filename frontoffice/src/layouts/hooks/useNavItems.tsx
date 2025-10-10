// src/layouts/hooks/useNavItems.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Home, Settings, FitnessCenter, Group } from '@mui/icons-material';

export type NavItem = {
  label: string;
  icon: React.ReactNode;
  path: string;
  external?: boolean;
};

/** Return role-based navigation items. Pure list, memoized by role. */
export function useNavItems(role?: string): NavItem[] {
  const { t } = useTranslation();

  return React.useMemo(() => {
    const base: NavItem[] = [
      { label: t('home.title'), icon: <Home />, path: '/' },
    ];

    if (role === 'coach') {
      base.push({
        label: t('clients.title'),
        icon: <Group />,
        path: '/clients',
      });
      base.push({
        label: t('programs-coatch.title'),
        icon: <FitnessCenter />,
        path: '/programs-coach',
      });
    }

    base.push({ label: t('sandbox.title'), icon: <Settings />, path: '/sandbox' });

    return base;
  }, [role, t]);
}
