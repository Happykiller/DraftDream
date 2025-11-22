import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceClientLevelMongo } from '@services/db/mongo/repositories/client/level.repository';
import { ListClientLevelsUsecase } from '@usecases/client/level/list.client-level.usecase';
import { ListClientLevelsUsecaseDto } from '@usecases/client/level/client-level.usecase.dto';
import { ClientLevelUsecaseModel } from '@usecases/client/level/client-level.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('ListClientLevelsUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceClientLevelMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: ListClientLevelsUsecase;

  const dto: ListClientLevelsUsecaseDto = { q: 'client', limit: 5, page: 2 };
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

    usecase = new ListClientLevelsUsecase(inversifyMock);
  });

  it('should list levels through the repository', async () => {
    repositoryMock.list.mockResolvedValue({ items: [level], total: 1, page: 1, limit: 20 });

    const result = await usecase.execute(dto);

    expect(repositoryMock.list).toHaveBeenCalledWith({
      q: dto.q,
      locale: dto.locale,
      createdBy: dto.createdBy,
      visibility: dto.visibility,
      limit: dto.limit,
      page: dto.page,
    });
    expect(result.items).toEqual([level]);
    expect(result.total).toBe(1);
  });

  it('should log and throw when repository fails', async () => {
    const failure = new Error('list failure');
    repositoryMock.list.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.LIST_CLIENT_LEVELS_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`ListClientLevelsUsecase#execute => ${failure.message}`);
  });
});
