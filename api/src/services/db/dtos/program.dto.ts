// src\\services\\db\\dtos\\program.dto.ts
export type CreateProgramDto = {
  name: string;
  duration: number;
  frequency: number;
  description?: string;
  /** Ordered list of session IDs (order by array index). */
  sessionIds: string[];
  createdBy: string;
};

export type GetProgramDto = { id: string };

export type ListProgramsDto = {
  q?: string;
  createdBy?: string;
  includeArchived?: boolean; // default false (exclude deleted items)
  limit?: number;            // default 20
  page?: number;             // default 1
  sort?: Record<string, 1 | -1>; // default { updatedAt: -1 }
};

export type UpdateProgramDto = Partial<{
  name: string;
  duration: number;
  frequency: number;
  description: string;
  /** Replace the whole ordered list */
  sessionIds: string[];
}>;
