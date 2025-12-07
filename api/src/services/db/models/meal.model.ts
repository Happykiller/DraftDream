// src/services/db/models/meal.model.ts
/** Database model describing a meal document. */
export interface Meal {
  id: string;
  slug: string;
  locale: string;
  label: string;
  typeId: string;
  foods: string;
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  visibility: 'PRIVATE' | 'PUBLIC';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
