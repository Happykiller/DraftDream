// src\services\db\dtos\session.dto.ts
export type Visibility = 'private' | 'public';

export type CreateSessionDto = {
  slug: string;
  locale: string;

  title: string;
  durationMin: number;
  description?: string;

  /** Ordered list of exercise IDs (order by array index). */
  exerciseIds: string[];

  createdBy: string;
};

export type GetSessionDto = { id: string };

export type ListSessionsDto = {
  q?: string;
  locale?: string;
  createdBy?: string;
  includeArchived?: boolean; // default false (exclude deleted items)
  limit?: number;            // default 20
  page?: number;             // default 1
  sort?: Record<string, 1 | -1>; // default { updatedAt: -1 }
};

export type UpdateSessionDto = Partial<{
  slug: string;
  locale: string;

  title: string;
  durationMin: number;
  description: string;

  /** Replace the whole ordered list */
  exerciseIds: string[];
}>;
