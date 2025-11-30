// src/services/db/models/meal-day.model.ts



export interface MealDay {
  id: string;
  slug: string;
  locale: string;

  label: string;
  description?: string;

  /** Ordered list preserving the original meal sequence. */
  mealIds: string[];

  visibility: 'private' | 'public' | 'hybrid';
  createdBy: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
