// src/services/db/dtos/meal-day.dto.ts

export type MealDayVisibility = 'private' | 'public';

export type CreateMealDayDto = {
  slug: string;
  locale: string;

  label: string;
  description?: string;

  /** Ordered list of meal identifiers. */
  mealIds: string[];

  visibility: MealDayVisibility;
  createdBy: string;
};

export type GetMealDayDto = { id: string };

export type ListMealDaysDto = {
  q?: string;
  locale?: string;
  visibility?: MealDayVisibility;
  createdBy?: string;
  createdByIn?: string[];
  accessibleFor?: { ownerId: string; includeCreatorIds?: string[] };
  includeArchived?: boolean; // default false (exclude deleted items)
  limit?: number;            // default 20
  page?: number;             // default 1
  sort?: Record<string, 1 | -1>; // default { updatedAt: -1 }
};

export type UpdateMealDayDto = Partial<{
  slug: string;
  locale: string;

  label: string;
  description: string;

  /** Replace the full ordered list. */
  mealIds: string[];

  visibility: MealDayVisibility;
}>;

