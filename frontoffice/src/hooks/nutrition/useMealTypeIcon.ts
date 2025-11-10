// src/hooks/nutrition/useMealTypeIcon.ts
import * as React from 'react';
import type { SvgIconComponent } from '@mui/icons-material';
import {
  BreakfastDining,
  BrunchDining,
  DinnerDining,
  EmojiFoodBeverage,
  Fastfood,
  LocalDining,
  LunchDining,
  RamenDining,
  Restaurant,
  RestaurantMenu,
  SoupKitchen,
} from '@mui/icons-material';

import { getMealIcon } from '@components/nutrition/mealPlanBuilderUtils';

export interface UseMealTypeIconOptions {
  icon?: string | null;
  fallbackReference: string;
}

type IconLibrary = Record<string, SvgIconComponent>;

const ICON_LIBRARY: IconLibrary = {
  breakfast: BreakfastDining,
  breakfastdining: BreakfastDining,
  brunch: BrunchDining,
  brunchdining: BrunchDining,
  lunch: LunchDining,
  lunchdining: LunchDining,
  dinner: DinnerDining,
  dinnerdining: DinnerDining,
  ramen: RamenDining,
  ramendining: RamenDining,
  soup: SoupKitchen,
  soupkitchen: SoupKitchen,
  restaurant: Restaurant,
  restaurantmenu: RestaurantMenu,
  dining: LocalDining,
  localdining: LocalDining,
  fastfood: Fastfood,
  beverage: EmojiFoodBeverage,
  emojifoodbeverage: EmojiFoodBeverage,
};

function normalizeIconKey(value: string): string {
  return value.replace(/\s+/g, '').replace(/[-_]/g, '').toLowerCase();
}

/**
 * Resolves the Material UI icon component for the provided meal type definition.
 * Falls back to the deterministic hash-based icon when the meal type does not specify one.
 */
export function useMealTypeIcon({ icon, fallbackReference }: UseMealTypeIconOptions): SvgIconComponent {
  return React.useMemo(() => {
    const trimmedIcon = icon?.trim();
    if (trimmedIcon) {
      const normalized = normalizeIconKey(trimmedIcon);
      const IconComponent = ICON_LIBRARY[normalized];
      if (IconComponent) {
        return IconComponent;
      }
    }

    const safeReference = fallbackReference && fallbackReference.trim().length > 0 ? fallbackReference : 'default-icon';
    return getMealIcon(safeReference);
  }, [icon, fallbackReference]);
}
