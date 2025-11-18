import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceClientLevelMongo } from '@services/db/mongo/repositories/client/level.repository';
import { UpdateClientLevelUsecase } from '@usecases/client/level/update.client-level.usecase';
import { UpdateClientLevelUsecaseDto } from '@usecases/client/level/client-level.usecase.dto';
import { ClientLevelUsecaseModel } from '@usecases/client/level/client-level.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('UpdateClientLevelUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceClientLevelMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: UpdateClientLevelUsecase;

  const dto: UpdateClientLevelUsecaseDto = { id: 'level-1', label: 'Prospect' };
  const now = new Date();
  const level: ClientLevelUsecaseModel = {
    id: 'level-1',
    slug: 'prospect',
    locale: 'fr',
    label: 'Prospect',
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

    usecase = new UpdateClientLevelUsecase(inversifyMock);
  });

  it('should update level through the repository', async () => {
    repositoryMock.update.mockResolvedValue(level);

    await expect(usecase.execute(dto)).resolves.toEqual(level);
  });

  it('should return null when update fails to find entity', async () => {
    repositoryMock.update.mockResolvedValue(null);

    await expect(usecase.execute(dto)).resolves.toBeNull();
  });

  it('should log and throw when repository update fails', async () => {
    const failure = new Error('update failure');
    repositoryMock.update.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.UPDATE_CLIENT_LEVEL_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`UpdateClientLevelUsecase#execute => ${failure.message}`);
  });
});
