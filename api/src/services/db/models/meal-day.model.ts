// src/services/db/models/meal-day.model.ts

import type { MealDayVisibility } from '@services/db/dtos/meal-day.dto';

export interface MealDay {
  id: string;
  slug: string;
  locale: string;

  label: string;
  description?: string;

  /** Ordered list preserving the original meal sequence. */
  mealIds: string[];

  visibility: MealDayVisibility;
  createdBy: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

