// src/usecases/exercise/exercise.usecase.model.ts
import { ExerciseLevel } from '@services/db/models/exercise.model';

export interface ExerciseUsecaseModel {
  id: string;
  slug: string;
  locale: string;
  label: string;
  description?: string;
  instructions?: string;
  level: ExerciseLevel;
  series: string;
  repetitions: string;
  charge?: string;
  rest?: number;
  videoUrl?: string;
  visibility: 'private' | 'public';

  categoryIds: string[];
  muscleIds: string[];
  equipmentIds?: string[];
  tagIds?: string[];

  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}
