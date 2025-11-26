import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceProspectObjectiveMongo } from '@services/db/mongo/repositories/prospect/objective.repository';
import { GetProspectObjectiveUsecase } from '@usecases/prospect/objective/get.prospect-objective.usecase';
import { GetProspectObjectiveDto } from '@services/db/dtos/prospect/objective.dto';
import { ProspectObjective } from '@services/db/models/prospect/objective.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('GetProspectObjectiveUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceProspectObjectiveMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: GetProspectObjectiveUsecase;

  const dto: GetProspectObjectiveDto = { id: 'objective-2' };

  const now = new Date('2024-02-11T10:30:00.000Z');
  const objective: ProspectObjective = {
    slug: "test-slug",
    id: 'objective-2',
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
    repositoryMock = mock<BddServiceProspectObjectiveMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { prospectObjective: BddServiceProspectObjectiveMongo }).prospectObjective = repositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new GetProspectObjectiveUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should retrieve a prospect objective through the repository', async () => {
    repositoryMock.get.mockResolvedValue(objective);

    const result = await usecase.execute(dto);

    expect(repositoryMock.get).toHaveBeenCalledWith({ id: dto.id });
    expect(result).toEqual(objective);
  });

  it('should return null when the prospect objective is not found', async () => {
    repositoryMock.get.mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when repository get fails', async () => {
    const failure = new Error('get failure');
    repositoryMock.get.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.GET_PROSPECT_OBJECTIVE_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`GetProspectObjectiveUsecase#execute => ${failure.message}`);
  });
});
