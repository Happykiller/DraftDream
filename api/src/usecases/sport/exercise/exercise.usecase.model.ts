// src/usecases/exercise/exercise.usecase.model.ts
export interface ExerciseUsecaseModel {
  id: string;
  slug: string;
  locale: string;
  label: string;
  description?: string;
  instructions?: string;
  series: string;
  repetitions: string;
  charge?: string;
  rest?: number;
  videoUrl?: string;
  visibility: 'private' | 'public' | 'hybrid';

  categoryIds: string[];
  muscleIds: string[];
  equipmentIds?: string[];
  tagIds?: string[];

  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
