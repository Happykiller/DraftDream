import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceProspectObjectiveMongo } from '@services/db/mongo/repositories/prospect/objective.repository';
import { ListProspectObjectivesUsecase, ListProspectObjectivesUsecaseResult } from '@usecases/prospect/objective/list.prospect-objective.usecase';
import { ListProspectObjectivesDto } from '@services/db/dtos/prospect/objective.dto';
import { ProspectObjective } from '@services/db/models/prospect/objective.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('ListProspectObjectivesUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceProspectObjectiveMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: ListProspectObjectivesUsecase;

  const now = new Date('2024-02-12T16:20:00.000Z');
  const objective: ProspectObjective = {
    slug: "test-slug",
    id: 'objective-3',
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
    repositoryMock = mock<BddServiceProspectObjectiveMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { prospectObjective: BddServiceProspectObjectiveMongo }).prospectObjective = repositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new ListProspectObjectivesUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should list prospect objectives through the repository', async () => {
    const dto: ListProspectObjectivesDto = {
      q: 'perf',
      locale: 'en-US',
      createdBy: 'coach-8',
      visibility: 'public',
      page: 2,
      limit: 5,
      sort: { updatedAt: -1 },
    };

    const repositoryResult: ListProspectObjectivesUsecaseResult = {
      items: [objective],
      total: 1,
      page: 2,
      limit: 5,
    };

    repositoryMock.list.mockResolvedValue(repositoryResult);

    const result = await usecase.execute(dto);

    expect(repositoryMock.list).toHaveBeenCalledWith(dto);
    expect(result).toEqual(repositoryResult);
  });

  it('should list with default parameters when dto is omitted', async () => {
    const repositoryResult: ListProspectObjectivesUsecaseResult = {
      items: [objective],
      total: 1,
      page: 1,
      limit: 20,
    };

    repositoryMock.list.mockResolvedValue(repositoryResult);

    const result = await usecase.execute();

    expect(repositoryMock.list).toHaveBeenCalledWith({});
    expect(result).toEqual(repositoryResult);
  });

  it('should log and throw a domain error when repository list fails', async () => {
    const failure = new Error('list failure');
    repositoryMock.list.mockRejectedValue(failure);

    await expect(usecase.execute()).rejects.toThrow(ERRORS.LIST_PROSPECT_OBJECTIVES_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`ListProspectObjectivesUsecase#execute => ${failure.message}`);
  });
});
