import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceClientSourceMongo } from '@services/db/mongo/repositories/client/source.repository';
import { GetClientSourceUsecase } from '@usecases/client/source/get.client-source.usecase';
import { GetClientSourceUsecaseDto } from '@usecases/client/source/client-source.usecase.dto';
import { ClientSourceUsecaseModel } from '@usecases/client/source/client-source.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('GetClientSourceUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceClientSourceMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: GetClientSourceUsecase;

  const dto: GetClientSourceUsecaseDto = { id: 'source-1' };
  const now = new Date();
  const source: ClientSourceUsecaseModel = {
    id: 'source-1',
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
    repositoryMock = mock<BddServiceClientSourceMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { clientSource: BddServiceClientSourceMongo }).clientSource = repositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new GetClientSourceUsecase(inversifyMock);
  });

  it('should return a source when found', async () => {
    repositoryMock.get.mockResolvedValue(source);

    await expect(usecase.execute(dto)).resolves.toEqual(source);
  });

  it('should return null when not found', async () => {
    repositoryMock.get.mockResolvedValue(null);

    await expect(usecase.execute(dto)).resolves.toBeNull();
  });

  it('should log and throw when repository fails', async () => {
    const failure = new Error('get failure');
    repositoryMock.get.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.GET_CLIENT_SOURCE_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`GetClientSourceUsecase#execute => ${failure.message}`);
  });
});
