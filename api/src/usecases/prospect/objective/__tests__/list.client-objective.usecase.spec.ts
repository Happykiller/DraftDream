import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceClientObjectiveMongo } from '@services/db/mongo/repositories/client/objective.repository';
import { ListClientObjectivesUsecase, ListClientObjectivesUsecaseResult } from '@usecases/client/objective/list.client-objective.usecase';
import { ListClientObjectivesUsecaseDto } from '@usecases/client/objective/client-objective.usecase.dto';
import { ClientObjectiveUsecaseModel } from '@usecases/client/objective/client-objective.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('ListClientObjectivesUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let clientObjectiveRepositoryMock: MockProxy<BddServiceClientObjectiveMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: ListClientObjectivesUsecase;

  const now = new Date('2024-02-12T16:20:00.000Z');
  const clientObjective: ClientObjectiveUsecaseModel = {
    id: 'objective-3',
    slug: 'performance',
    locale: 'en-us',
    label: 'Performance',
    visibility: 'public',
    createdBy: 'coach-8',
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

    usecase = new ListClientObjectivesUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should list client objectives through the repository', async () => {
    const dto: ListClientObjectivesUsecaseDto = {
      q: 'perf',
      locale: 'en-US',
      createdBy: 'coach-8',
      visibility: 'public',
      page: 2,
      limit: 5,
      sort: { updatedAt: -1 },
    };

    const repositoryResult: ListClientObjectivesUsecaseResult = {
      items: [clientObjective],
      total: 1,
      page: 2,
      limit: 5,
    };

    clientObjectiveRepositoryMock.list.mockResolvedValue(repositoryResult);

    const result = await usecase.execute(dto);

    expect(clientObjectiveRepositoryMock.list).toHaveBeenCalledWith(dto);
    expect(result).toEqual(repositoryResult);
    expect(result.items[0]).not.toBe(repositoryResult.items[0]);
  });

  it('should list with default parameters when dto is omitted', async () => {
    const repositoryResult: ListClientObjectivesUsecaseResult = {
      items: [clientObjective],
      total: 1,
      page: 1,
      limit: 20,
    };

    clientObjectiveRepositoryMock.list.mockResolvedValue(repositoryResult);

    const result = await usecase.execute();

    expect(clientObjectiveRepositoryMock.list).toHaveBeenCalledWith({});
    expect(result).toEqual(repositoryResult);
  });

  it('should log and throw a domain error when repository list fails', async () => {
    const failure = new Error('list failure');
    clientObjectiveRepositoryMock.list.mockRejectedValue(failure);

    await expect(usecase.execute()).rejects.toThrow(ERRORS.LIST_CLIENT_OBJECTIVES_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`ListClientObjectivesUsecase#execute => ${failure.message}`);
  });
});

