import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceClientLevelMongo } from '@services/db/mongo/repositories/client/level.repository';
import { GetClientLevelUsecase } from '@usecases/client/level/get.client-level.usecase';
import { GetClientLevelUsecaseDto } from '@usecases/client/level/client-level.usecase.dto';
import { ClientLevelUsecaseModel } from '@usecases/client/level/client-level.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('GetClientLevelUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceClientLevelMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: GetClientLevelUsecase;

  const dto: GetClientLevelUsecaseDto = { id: 'level-1' };
  const now = new Date();
  const level: ClientLevelUsecaseModel = {
    id: 'level-1',
    slug: 'client',
    locale: 'fr',
    label: 'Client',
    visibility: 'public',
    createdBy: 'admin-1',
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    repositoryMock = mock<BddServiceClientLevelMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { clientLevel: BddServiceClientLevelMongo }).clientLevel = repositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new GetClientLevelUsecase(inversifyMock);
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

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.GET_CLIENT_LEVEL_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`GetClientLevelUsecase#execute => ${failure.message}`);
  });
});
