import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceClientStatusMongo } from '@services/db/mongo/repositories/client/status.repository';
import { ListClientStatusesUsecase } from '@usecases/client/status/list.client-status.usecase';
import { ListClientStatusesUsecaseDto } from '@usecases/client/status/client-status.usecase.dto';
import { ClientStatusUsecaseModel } from '@usecases/client/status/client-status.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('ListClientStatusesUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceClientStatusMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: ListClientStatusesUsecase;

  const dto: ListClientStatusesUsecaseDto = { q: 'client', limit: 5, page: 2 };
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

    usecase = new ListClientStatusesUsecase(inversifyMock);
  });

  it('should list statuses through the repository', async () => {
    repositoryMock.list.mockResolvedValue({ items: [status], total: 1, page: 1, limit: 20 });

    const result = await usecase.execute(dto);

    expect(repositoryMock.list).toHaveBeenCalledWith({
      q: dto.q,
      locale: dto.locale,
      createdBy: dto.createdBy,
      visibility: dto.visibility,
      limit: dto.limit,
      page: dto.page,
    });
    expect(result.items).toEqual([status]);
    expect(result.total).toBe(1);
  });

  it('should log and throw when repository fails', async () => {
    const failure = new Error('list failure');
    repositoryMock.list.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.LIST_CLIENT_STATUSES_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`ListClientStatusesUsecase#execute => ${failure.message}`);
  });
});
