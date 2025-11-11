// src\\usecases\\program\\program.usecase.model.ts
export interface ProgramExerciseUsecaseModel {
  id: string;
  templateExerciseId?: string;
  label: string;
  description?: string;
  instructions?: string;
  series?: string;
  repetitions?: string;
  charge?: string;
  restSeconds?: number;
  videoUrl?: string;
  level?: string;
  categoryIds?: string[];
  muscleIds?: string[];
  equipmentIds?: string[];
  tagIds?: string[];
}

export interface ProgramSessionUsecaseModel {
  id: string;
  templateSessionId?: string;
  slug?: string;
  locale?: string;
  label: string;
  durationMin: number;
  description?: string;
  exercises: ProgramExerciseUsecaseModel[];
}

export interface ProgramUsecaseModel {
  id: string;
  slug: string;
  locale: string;
  label: string;
  duration: number;
  frequency: number;
  description?: string;
  sessions: ProgramSessionUsecaseModel[];
  userId?: string;
  createdBy: string;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
