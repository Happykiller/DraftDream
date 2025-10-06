// src\\graphql\\program\\program.mapper.ts
import { ProgramGql } from '@graphql/program/program.gql.types';
import { ProgramUsecaseModel } from '@usecases/program/program.usecase.model';

export function mapProgramUsecaseToGql(model: ProgramUsecaseModel): ProgramGql {
  return {
    id: model.id,
    name: model.name,
    duration: model.duration,
    frequency: model.frequency,
    description: model.description,
    sessionIds: [...model.sessionIds],
    createdBy: model.createdBy,
    createdAt: model.createdAt,
    updatedAt: model.updatedAt,
  };
}
