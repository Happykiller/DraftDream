import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceProspectSourceMongo } from '@services/db/mongo/repositories/prospect/source.repository';
import { ListProspectSourcesUsecase } from '@usecases/prospect/source/list.prospect-source.usecase';
import { ListProspectSourcesDto } from '@services/db/dtos/prospect/source.dto';
import { ProspectSource } from '@services/db/models/prospect/source.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('ListProspectSourcesUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceProspectSourceMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: ListProspectSourcesUsecase;

  const now = new Date();
  const source: ProspectSource = {
    slug: "test-slug",
    id: 'source-1',
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
    repositoryMock = mock<BddServiceProspectSourceMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { prospectSource: BddServiceProspectSourceMongo }).prospectSource = repositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new ListProspectSourcesUsecase(inversifyMock);
  });

  it('should return list of sources', async () => {
    const dto: ListProspectSourcesDto = { page: 1, limit: 10 };
    repositoryMock.list.mockResolvedValue({
      items: [source],
      total: 1,
      page: 1,
      limit: 10,
    });

    const result = await usecase.execute(dto);

    expect(result).toEqual({
      items: [source],
      total: 1,
      page: 1,
      limit: 10,
    });
    expect(repositoryMock.list).toHaveBeenCalledWith(dto);
  });

  it('should log and throw when repository fails', async () => {
    const failure = new Error('list failure');
    repositoryMock.list.mockRejectedValue(failure);

    await expect(usecase.execute()).rejects.toThrow(ERRORS.LIST_PROSPECT_SOURCES_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`ListProspectSourcesUsecase#execute => ${failure.message}`);
  });
});
