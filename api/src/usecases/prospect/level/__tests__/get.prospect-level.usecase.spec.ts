import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceProspectLevelMongo } from '@services/db/mongo/repositories/prospect/level.repository';
import { GetProspectLevelUsecase } from '@usecases/prospect/level/get.prospect-level.usecase';
import { GetProspectLevelDto } from '@services/db/dtos/prospect/level.dto';
import { ProspectLevel } from '@services/db/models/prospect/level.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('GetProspectLevelUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceProspectLevelMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: GetProspectLevelUsecase;

  const dto: GetProspectLevelDto = { id: 'level-1' };
  const now = new Date();
  const level: ProspectLevel = {
    slug: "test-slug",
    id: 'level-1',
    locale: 'fr',
    label: 'Client',
    visibility: 'PUBLIC',
    createdBy: 'admin-1',
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    repositoryMock = mock<BddServiceProspectLevelMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { prospectLevel: BddServiceProspectLevelMongo }).prospectLevel = repositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new GetProspectLevelUsecase(inversifyMock);
  });

  it('should return a level when found', async () => {
    repositoryMock.get.mockResolvedValue(level);

    await expect(usecase.execute(dto)).resolves.toEqual(level);
  });

  it('should return null when not found', async () => {
    repositoryMock.get.mockResolvedValue(null);

    await expect(usecase.execute(dto)).resolves.toBeNull();
  });

  it('should log and throw when repository fails', async () => {
    const failure = new Error('get failure');
    repositoryMock.get.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.GET_PROSPECT_LEVEL_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`GetProspectLevelUsecase#execute => ${failure.message}`);
  });
});
