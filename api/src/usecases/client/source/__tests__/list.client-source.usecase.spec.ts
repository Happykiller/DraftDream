import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceClientSourceMongo } from '@services/db/mongo/repositories/client/source.repository';
import { ListClientSourcesUsecase } from '@usecases/client/source/list.client-source.usecase';
import { ListClientSourcesUsecaseDto } from '@usecases/client/source/client-source.usecase.dto';
import { ClientSourceUsecaseModel } from '@usecases/client/source/client-source.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('ListClientSourcesUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceClientSourceMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: ListClientSourcesUsecase;

  const dto: ListClientSourcesUsecaseDto = { q: 'client', limit: 5, page: 2 };
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

    usecase = new ListClientSourcesUsecase(inversifyMock);
  });

  it('should list sources through the repository', async () => {
    repositoryMock.list.mockResolvedValue({ items: [source], total: 1, page: 1, limit: 20 });

    const result = await usecase.execute(dto);

    expect(repositoryMock.list).toHaveBeenCalledWith({
      q: dto.q,
      locale: dto.locale,
      createdBy: dto.createdBy,
      visibility: dto.visibility,
      limit: dto.limit,
      page: dto.page,
    });
    expect(result.items).toEqual([source]);
    expect(result.total).toBe(1);
  });

  it('should log and throw when repository fails', async () => {
    const failure = new Error('list failure');
    repositoryMock.list.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.LIST_CLIENT_SOURCES_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`ListClientSourcesUsecase#execute => ${failure.message}`);
  });
});
