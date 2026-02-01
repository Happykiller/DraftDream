// src/common/task-priority.enum.ts
// Centralized task priority values to ensure consistent usage across layers.
export enum TaskPriority {
  LOW = 'LOW',
  MIDDLE = 'MIDDLE',
  HIGH = 'HIGH',
}

export type TaskPriorityValue = `${TaskPriority}`;
