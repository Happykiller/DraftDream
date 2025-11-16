// src/usecases/meal/meal.usecase.model.ts
/** Represents a meal entity at the use case layer. */
export interface MealUsecaseModel {
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
  visibility: 'private' | 'public';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
