import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceClientStatusMongo } from '@services/db/mongo/repositories/client/status.repository';
import { UpdateClientStatusUsecase } from '@usecases/client/status/update.client-status.usecase';
import { UpdateClientStatusUsecaseDto } from '@usecases/client/status/client-status.usecase.dto';
import { ClientStatusUsecaseModel } from '@usecases/client/status/client-status.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('UpdateClientStatusUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceClientStatusMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: UpdateClientStatusUsecase;

  const dto: UpdateClientStatusUsecaseDto = { id: 'status-1', label: 'Prospect' };
  const now = new Date();
  const status: ClientStatusUsecaseModel = {
    id: 'status-1',
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
    repositoryMock = mock<BddServiceClientStatusMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { clientStatus: BddServiceClientStatusMongo }).clientStatus = repositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new UpdateClientStatusUsecase(inversifyMock);
  });

  it('should update status through the repository', async () => {
    repositoryMock.update.mockResolvedValue(status);

    await expect(usecase.execute(dto)).resolves.toEqual(status);
  });

  it('should return null when update fails to find entity', async () => {
    repositoryMock.update.mockResolvedValue(null);

    await expect(usecase.execute(dto)).resolves.toBeNull();
  });

  it('should log and throw when repository update fails', async () => {
    const failure = new Error('update failure');
    repositoryMock.update.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.UPDATE_CLIENT_STATUS_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`UpdateClientStatusUsecase#execute => ${failure.message}`);
  });
});
