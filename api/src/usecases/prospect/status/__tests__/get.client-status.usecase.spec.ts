import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceClientStatusMongo } from '@services/db/mongo/repositories/client/status.repository';
import { GetClientStatusUsecase } from '@usecases/client/status/get.client-status.usecase';
import { GetClientStatusUsecaseDto } from '@usecases/client/status/client-status.usecase.dto';
import { ClientStatusUsecaseModel } from '@usecases/client/status/client-status.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('GetClientStatusUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceClientStatusMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: GetClientStatusUsecase;

  const dto: GetClientStatusUsecaseDto = { id: 'status-1' };
  const now = new Date();
  const status: ClientStatusUsecaseModel = {
    id: 'status-1',
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
    repositoryMock = mock<BddServiceClientStatusMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { clientStatus: BddServiceClientStatusMongo }).clientStatus = repositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new GetClientStatusUsecase(inversifyMock);
  });

  it('should return a status when found', async () => {
    repositoryMock.get.mockResolvedValue(status);

    await expect(usecase.execute(dto)).resolves.toEqual(status);
  });

  it('should return null when not found', async () => {
    repositoryMock.get.mockResolvedValue(null);

    await expect(usecase.execute(dto)).resolves.toBeNull();
  });

  it('should log and throw when repository fails', async () => {
    const failure = new Error('get failure');
    repositoryMock.get.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.GET_CLIENT_STATUS_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`GetClientStatusUsecase#execute => ${failure.message}`);
  });
});
