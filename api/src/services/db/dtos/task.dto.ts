// src/services/db/dto/task.dto.ts
export interface CreateTaskDto {
  label: string;
  priority: 'LOW' | 'MIDDLE' | 'HIGH';
  status: 'TODO' | 'DONE';
  day: Date;
  createdBy: string;
}

export type UpdateTaskDto = Partial<Pick<CreateTaskDto, 'label' | 'priority' | 'status' | 'day'>>;

export interface GetTaskDto { id: string }

export interface ListTasksDto {
  priority?: 'LOW' | 'MIDDLE' | 'HIGH';
  status?: 'TODO' | 'DONE';
  day?: Date;
  dayFrom?: Date;
  dayTo?: Date;
  createdBy?: string;
  limit?: number;
  page?: number;
  sort?: Record<string, 1 | -1>;
}
