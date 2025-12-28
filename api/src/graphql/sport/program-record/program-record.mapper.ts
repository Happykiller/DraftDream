// src/graphql/sport/program-record/program-record.mapper.ts
import { ProgramRecordGql } from '@graphql/sport/program-record/program-record.gql.types';
import { ProgramRecordUsecaseModel } from '@src/usecases/sport/program-record/program-record.usecase.model';

export const mapProgramRecordUsecaseToGql = (model: ProgramRecordUsecaseModel): ProgramRecordGql => ({
  id: model.id,
  userId: model.userId,
  programId: model.programId,
  sessionId: model.sessionId,
  state: model.state,
  createdBy: model.createdBy,
  createdAt: model.createdAt,
  updatedAt: model.updatedAt,
});
