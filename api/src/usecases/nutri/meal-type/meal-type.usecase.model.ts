// src/usecases/meal-type/meal-type.usecase.model.ts
/** Represents a meal type in the use case layer. */
export interface MealTypeUsecaseModel {
  id: string;
  slug: string;
  locale: string;
  label: string;
  icon?: string | null;
  visibility: 'private' | 'public' | 'hybrid';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
