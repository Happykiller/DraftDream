// src/services/db/models/meal-type.model.ts
/** Database model describing a meal type document. */
export interface MealType {
  id: string;
  slug: string;
  locale: string;
  label: string;
  icon?: string | null;
  visibility: 'private' | 'public';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
