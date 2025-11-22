import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceClientMongo } from '@services/db/mongo/repositories/client/client.repository';
import { GetClientUsecase } from '@usecases/client/client/get.client.usecase';
import { GetClientUsecaseDto } from '@usecases/client/client/client.usecase.dto';
import { ClientUsecaseModel } from '@usecases/client/client/client.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('GetClientUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceClientMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: GetClientUsecase;

  const dto: GetClientUsecaseDto = { id: 'client-1' };
  const now = new Date('2024-06-01T10:00:00.000Z');
  const client: ClientUsecaseModel = {
    id: dto.id,
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@fitdesk.com',
    objectiveIds: [],
    activityPreferenceIds: [],
    createdBy: 'admin-1',
    createdAt: now,
    updatedAt: now,
  } as ClientUsecaseModel;

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    repositoryMock = mock<BddServiceClientMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { client: BddServiceClientMongo }).client = repositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new GetClientUsecase(inversifyMock);
  });

  it('should fetch a client by id', async () => {
    repositoryMock.get.mockResolvedValue(client);

    const result = await usecase.execute(dto);

    expect(repositoryMock.get).toHaveBeenCalledWith({ id: dto.id });
    expect(result).toEqual(client);
  });

  it('should return null when repository returns null', async () => {
    repositoryMock.get.mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw when repository fails', async () => {
    const failure = new Error('get failed');
    repositoryMock.get.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.GET_CLIENT_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`GetClientUsecase#execute => ${failure.message}`);
  });
});
