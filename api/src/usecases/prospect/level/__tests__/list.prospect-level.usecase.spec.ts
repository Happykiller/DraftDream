import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceProspectLevelMongo } from '@services/db/mongo/repositories/prospect/level.repository';
import { ListProspectLevelsUsecase } from '@usecases/prospect/level/list.prospect-level.usecase';
import { ListProspectLevelsDto } from '@services/db/dtos/prospect/level.dto';
import { ProspectLevel } from '@services/db/models/prospect/level.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('ListProspectLevelsUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceProspectLevelMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: ListProspectLevelsUsecase;

  const dto: ListProspectLevelsDto = { q: 'client', limit: 5, page: 2 };
  const now = new Date();
  const level: ProspectLevel = {
    slug: "test-slug",
    id: 'level-1',
    locale: 'fr',
    label: 'Client',
    visibility: 'PUBLIC',
    createdBy: 'admin-1',
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    repositoryMock = mock<BddServiceProspectLevelMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { prospectLevel: BddServiceProspectLevelMongo }).prospectLevel = repositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new ListProspectLevelsUsecase(inversifyMock);
  });

  it('should list levels through the repository', async () => {
    (repositoryMock.list as any).mockResolvedValue({ items: [level], total: 1, page: 1, limit: 20 });

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
    (repositoryMock.list as any).mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.LIST_PROSPECT_LEVELS_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`ListProspectLevelsUsecase#execute => ${failure.message}`);
  });
});
