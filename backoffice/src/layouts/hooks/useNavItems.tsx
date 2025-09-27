// src/layouts/hooks/useNavItems.tsx
import { t } from 'i18next';
import * as React from 'react';
import { Home, Settings, FitnessCenter } from '@mui/icons-material';

export type NavItem = {
  label: string;
  icon: React.ReactNode;
  path: string;
  external?: boolean;
};

/** Return role-based navigation items. Pure list, memoized by role. */
export function useNavItems(role?: string): NavItem[] {
  return React.useMemo(() => {
    const base: NavItem[] = [
        { label: t('home.title'), icon: <Home />, path: '/' }
      ];

      if (role === 'admin') {
        base.push({
          label: t('programs.title'),
          icon: <FitnessCenter />,
          path: '/programs',
        });
      }
    
      base.push({ label: t('sandbox.title'), icon: <Settings />, path: '/sandbox' });
    
      return base;
  }, [role]);
}
