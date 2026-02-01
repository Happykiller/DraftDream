// src/services/db/models/task.model.ts
export interface Task {
  id: string;
  label: string;
  priority: 'LOW' | 'MIDDLE' | 'HIGH';
  status: 'TODO' | 'DONE';
  day: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
