import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceProspectSourceMongo } from '@services/db/mongo/repositories/prospect/source.repository';
import { GetProspectSourceUsecase } from '@usecases/prospect/source/get.prospect-source.usecase';
import { GetProspectSourceDto } from '@services/db/dtos/prospect/source.dto';
import { ProspectSource } from '@services/db/models/prospect/source.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('GetProspectSourceUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceProspectSourceMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: GetProspectSourceUsecase;

  const dto: GetProspectSourceDto = { id: 'source-1' };
  const now = new Date();
  const source: ProspectSource = {
    slug: "test-slug",
    id: 'source-1',
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
    repositoryMock = mock<BddServiceProspectSourceMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { prospectSource: BddServiceProspectSourceMongo }).prospectSource = repositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new GetProspectSourceUsecase(inversifyMock);
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

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.GET_PROSPECT_SOURCE_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`GetProspectSourceUsecase#execute => ${failure.message}`);
  });
});
