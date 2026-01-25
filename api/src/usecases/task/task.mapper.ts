// src/usecases/task/task.mapper.ts
import { Task } from '@services/db/models/task.model';
import { toTaskPriority, toTaskStatus } from '@src/common/enum.util';
import { TaskPriority } from '@src/common/task-priority.enum';
import { TaskStatus } from '@src/common/task-status.enum';

import { TaskUsecaseModel } from './task.usecase.model';

/**
 * Maps persistence models into use case models with normalized enums.
 */
export const mapTaskToUsecase = (task: Task): TaskUsecaseModel => ({
  id: task.id,
  label: task.label,
  priority: toTaskPriority(task.priority) ?? TaskPriority.LOW,
  status: toTaskStatus(task.status) ?? TaskStatus.TODO,
  day: task.day,
  createdBy: task.createdBy,
  createdAt: task.createdAt,
  updatedAt: task.updatedAt,
  deletedAt: task.deletedAt,
});
