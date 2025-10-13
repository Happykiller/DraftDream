// src/layouts/hooks/useNavItems.tsx
import * as React from 'react';
import { FitnessCenter, Home, ManageAccounts, Palette, Settings } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

export type NavItem = {
  label: string;
  icon: React.ReactNode;
  path: string;
  external?: boolean;
};

/** Return role-based navigation items. Pure list, memoized by role. */
export function useNavItems(role?: string): NavItem[] {
  const { t, i18n } = useTranslation();

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
          label: t('users.title'),
          icon: <ManageAccounts />,
          path: '/users',
        },
      );
    }

    base.push(
      { label: t('sandbox.title'), icon: <Settings />, path: '/sandbox' },
      { label: t('themeStudio.title'), icon: <Palette />, path: '/theme-studio' }
    );

    return base;
  }, [role, i18n.language, t]);
}
