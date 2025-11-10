// src/hooks/nutrition/useMealTypeIcon.ts
import * as React from 'react';
import * as Icons from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';
import { DinnerDining } from '@mui/icons-material';

type IconLibrary = Record<string, SvgIconComponent | undefined>;

// Casting keeps tree-shaking available while allowing dynamic icon lookup.
const iconLibrary: IconLibrary = Icons as unknown as IconLibrary;

const FALLBACK_ICON: SvgIconComponent = DinnerDining;

/**
 * Resolves the Material UI icon component matching the provided meal type icon name.
 * Falls back to {@link DinnerDining} when the requested icon is unavailable.
 */
export function useMealTypeIcon(icon?: string | null): SvgIconComponent {
  return React.useMemo(() => {
    const trimmedIcon = icon?.trim();
    if (trimmedIcon) {
      const matchedIcon = iconLibrary[trimmedIcon];
      if (matchedIcon) {
        return matchedIcon;
      }
    }

    return FALLBACK_ICON;
  }, [icon]);
}
