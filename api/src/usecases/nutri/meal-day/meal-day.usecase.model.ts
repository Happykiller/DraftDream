// src/usecases/meal-day/meal-day.usecase.model.ts

export interface MealDayUsecaseModel {
  id: string;
  slug: string;
  locale: string;

  label: string;
  description?: string;

  mealIds: string[];

  visibility: 'private' | 'public';
  createdBy: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

