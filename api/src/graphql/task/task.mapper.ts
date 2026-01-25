// src/graphql/task/task.mapper.ts
import { TaskGql } from '@graphql/task/task.gql.types';
import { TaskUsecaseModel } from '@usecases/task/task.usecase.model';

export function mapTaskUsecaseToGql(task: TaskUsecaseModel): TaskGql {
  return {
    id: task.id,
    label: task.label,
    priority: task.priority,
    status: task.status,
    day: task.day,
    createdBy: task.createdBy,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}
