import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceClientMongo } from '@services/db/mongo/repositories/client/client.repository';
import { ListClientsUsecase } from '@usecases/client/client/list.clients.usecase';
import { ListClientsUsecaseDto } from '@usecases/client/client/client.usecase.dto';
import { ClientUsecaseModel } from '@usecases/client/client/client.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('ListClientsUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceClientMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: ListClientsUsecase;

  const dto: ListClientsUsecaseDto = {
    q: 'jane',
    statusId: 'status-1',
    levelId: 'level-1',
    sourceId: 'source-1',
    createdBy: 'admin-1',
    limit: 5,
    page: 2,
  };

  const now = new Date('2024-06-01T10:00:00.000Z');
  const client: ClientUsecaseModel = {
    id: 'client-1',
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

    usecase = new ListClientsUsecase(inversifyMock);
  });

  it('should list clients via the repository', async () => {
    repositoryMock.list.mockResolvedValue({ items: [client], total: 1, page: dto.page!, limit: dto.limit! });

    const result = await usecase.execute(dto);

    expect(repositoryMock.list).toHaveBeenCalledWith({
      q: dto.q,
      statusId: dto.statusId,
      levelId: dto.levelId,
      sourceId: dto.sourceId,
      createdBy: dto.createdBy,
      limit: dto.limit,
      page: dto.page,
    });
    expect(result).toEqual({ items: [client], total: 1, page: dto.page!, limit: dto.limit! });
  });

  it('should log and throw when repository fails', async () => {
    const failure = new Error('list failed');
    repositoryMock.list.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.LIST_CLIENTS_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`ListClientsUsecase#execute => ${failure.message}`);
  });
});
