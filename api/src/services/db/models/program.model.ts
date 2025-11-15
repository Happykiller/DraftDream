// src\\services\\db\\models\\program.model.ts
import { User } from '@services/db/models/user.model';

export interface ProgramExerciseSnapshot {
  /** Unique identifier for the snapshot inside the program. */
  id: string;
  /** Optional reference to the exercise template. */
  templateExerciseId?: string;
  /** Human readable name shown to athletes. */
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

export interface ProgramSessionSnapshot {
  /** Unique identifier for the snapshot inside the program. */
  id: string;
  /** Optional reference to the source session template. */
  templateSessionId?: string;
  slug?: string;
  locale?: string;
  label: string;
  durationMin: number;
  description?: string;
  exercises: ProgramExerciseSnapshot[];
}

export interface Program {
  id: string;
  slug: string;
  locale: string;
  label: string;
  visibility: 'private' | 'public';
  /** Duration in weeks; must be a positive integer. */
  duration: number;
  /** Number of training sessions per week. */
  frequency: number;
  description?: string;
  /** Snapshot of the program structure with editable sessions/exercises. */
  sessions: ProgramSessionSnapshot[];
  /** Optional assigned user id (the owner/assignee of the program). */
  userId?: string;
  createdBy: string | User;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
