// src/services/db/dtos/exercise.dto.ts
export type Visibility = 'private' | 'public';
export type ExerciseLevel = 'beginner' | 'intermediate' | 'advanced';

export type CreateExerciseDto = {
  slug: string;
  locale: string;
  label: string;
  description?: string;
  instructions?: string;
  level: ExerciseLevel;
  series: string;         // e.g. "3"
  repetitions: string;    // e.g. "10-12"
  charge?: string;        // e.g. "20kg" or "poids du corps"
  rest?: number;          // seconds
  videoUrl?: string;
  visibility: Visibility;
  categoryId: string;
  muscleIds: string[];
  equipmentIds?: string[];
  tagIds?: string[];

  createdBy: string;
};

export type GetExerciseDto = { id: string };

export type ListExercisesDto = {
  q?: string;
  locale?: string;
  createdBy?: string;
  visibility?: Visibility;
  level?: ExerciseLevel;
  categoryId?: string;
  includeArchived?: boolean; // default false
  limit?: number;            // default 20
  page?: number;             // default 1
  sort?: Record<string, 1 | -1>; // default { updatedAt: -1 }
};

export type UpdateExerciseDto = Partial<{
  slug: string;
  locale: string;
  label: string;
  description: string;
  instructions: string;
  level: ExerciseLevel;
  series: string;
  repetitions: string;
  charge: string;
  rest: number;
  videoUrl: string;
  visibility: Visibility;

  // Relations (replace whole sets)
  categoryId: string;
  muscleIds: string[];
  equipmentIds: string[];
  tagIds: string[];
}>; 
