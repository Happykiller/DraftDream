// src/usecases/task/task.usecase.model.ts
import { TaskPriority } from '@src/common/task-priority.enum';
import { TaskStatus } from '@src/common/task-status.enum';

export interface TaskUsecaseModel {
  id: string;
  label: string;
  priority: TaskPriority;
  status: TaskStatus;
  day: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
