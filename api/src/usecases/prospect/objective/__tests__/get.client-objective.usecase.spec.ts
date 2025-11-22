import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceClientObjectiveMongo } from '@services/db/mongo/repositories/client/objective.repository';
import { GetClientObjectiveUsecase } from '@usecases/client/objective/get.client-objective.usecase';
import { GetClientObjectiveUsecaseDto } from '@usecases/client/objective/client-objective.usecase.dto';
import { ClientObjectiveUsecaseModel } from '@usecases/client/objective/client-objective.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('GetClientObjectiveUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let clientObjectiveRepositoryMock: MockProxy<BddServiceClientObjectiveMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: GetClientObjectiveUsecase;

  const dto: GetClientObjectiveUsecaseDto = { id: 'objective-2' };

  const now = new Date('2024-02-11T10:30:00.000Z');
  const clientObjective: ClientObjectiveUsecaseModel = {
    id: 'objective-2',
    slug: 'mass-gain',
    locale: 'en-us',
    label: 'Mass gain',
    visibility: 'private',
    createdBy: 'coach-7',
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    clientObjectiveRepositoryMock = mock<BddServiceClientObjectiveMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { clientObjective: BddServiceClientObjectiveMongo }).clientObjective = clientObjectiveRepositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new GetClientObjectiveUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should retrieve a client objective through the repository', async () => {
    clientObjectiveRepositoryMock.get.mockResolvedValue(clientObjective);

    const result = await usecase.execute(dto);

    expect(clientObjectiveRepositoryMock.get).toHaveBeenCalledWith({ id: dto.id });
    expect(result).toEqual(clientObjective);
  });

  it('should return null when the client objective is not found', async () => {
    clientObjectiveRepositoryMock.get.mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when repository get fails', async () => {
    const failure = new Error('get failure');
    clientObjectiveRepositoryMock.get.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.GET_CLIENT_OBJECTIVE_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`GetClientObjectiveUsecase#execute => ${failure.message}`);
  });
});

