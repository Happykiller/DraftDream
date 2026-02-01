// src/common/task-status.enum.ts
// Centralized task status values to ensure consistent usage across layers.
export enum TaskStatus {
  TODO = 'TODO',
  DONE = 'DONE',
}

export type TaskStatusValue = `${TaskStatus}`;
