// src\\services\\db\\dtos\\program.dto.ts
export type ProgramExerciseSnapshotDto = {
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
};

export type ProgramSessionSnapshotDto = {
  id: string;
  templateSessionId?: string;
  slug?: string;
  locale?: string;
  label: string;
  durationMin: number;
  description?: string;
  exercises: ProgramExerciseSnapshotDto[];
};

export type CreateProgramDto = {
  slug: string;
  locale: string;
  label: string;
  duration: number;
  frequency: number;
  description?: string;
  /** Snapshot of sessions attached to the program. */
  sessions: ProgramSessionSnapshotDto[];
  /** Optional assigned user id */
  userId?: string;
  createdBy: string;
};

export type GetProgramDto = { id: string };

export type ListProgramsDto = {
  q?: string;
  locale?: string;
  createdBy?: string;
  createdByIn?: string[];
  /** Filter by assigned user id */
  userId?: string;
  includeArchived?: boolean; // default false (exclude deleted items)
  limit?: number;            // default 20
  page?: number;             // default 1
  sort?: Record<string, 1 | -1>; // default { updatedAt: -1 }
};

export type UpdateProgramDto = Partial<{
  slug: string;
  locale: string;
  label: string;
  duration: number;
  frequency: number;
  description: string;
  /** Replace the whole snapshot definition. */
  sessions: ProgramSessionSnapshotDto[];
  /** Set/replace the assigned user id */
  userId: string;
}>;
