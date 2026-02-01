// src/usecases/task/task.usecase.dto.ts
import { Role } from '@src/common/role.enum';
import { TaskPriority } from '@src/common/task-priority.enum';
import { TaskStatus } from '@src/common/task-status.enum';

export interface UsecaseSession { userId: string; role: Role }

export interface CreateTaskUsecaseDto {
  label: string;
  priority: TaskPriority;
  status: TaskStatus;
  day: Date;
  session: UsecaseSession;
}

export interface GetTaskUsecaseDto {
  id: string;
  session: UsecaseSession;
}

export interface ListTasksUsecaseDto {
  priority?: TaskPriority;
  status?: TaskStatus;
  day?: Date;
  dayFrom?: Date;
  dayTo?: Date;
  createdBy?: string;
  limit?: number;
  page?: number;
  session: UsecaseSession;
}

export interface UpdateTaskUsecaseDto {
  id: string;
  label?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  day?: Date;
  session: UsecaseSession;
}

export interface DeleteTaskUsecaseDto {
  id: string;
  session: UsecaseSession;
}

export interface HardDeleteTaskUsecaseDto {
  id: string;
  session: UsecaseSession;
}
