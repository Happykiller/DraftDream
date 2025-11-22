import { beforeEach, describe, expect, it, jest, afterEach } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import * as slugUtil from '@src/common/slug.util';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceClientSourceMongo } from '@services/db/mongo/repositories/client/source.repository';
import { UpdateClientSourceUsecase } from '@usecases/client/source/update.client-source.usecase';
import { UpdateClientSourceUsecaseDto } from '@usecases/client/source/client-source.usecase.dto';
import { ClientSourceUsecaseModel } from '@usecases/client/source/client-source.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('UpdateClientSourceUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceClientSourceMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: UpdateClientSourceUsecase;

  const dto: UpdateClientSourceUsecaseDto = { id: 'source-1', label: 'Prospect' };
  const now = new Date();
  const source: ClientSourceUsecaseModel = {
    id: 'source-1',
    slug: 'prospect',
    locale: 'fr',
    label: 'Prospect',
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

    usecase = new UpdateClientSourceUsecase(inversifyMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should update source through the repository', async () => {
    const buildSlugSpy = jest.spyOn(slugUtil, 'buildSlug').mockReturnValue('generated-prospect');
    repositoryMock.update.mockResolvedValue(source);

    await expect(usecase.execute(dto)).resolves.toEqual(source);
    expect(repositoryMock.update).toHaveBeenCalledWith(dto.id, {
      slug: 'generated-prospect',
      locale: dto.locale,
      label: dto.label,
      visibility: dto.visibility,
    });
    expect(buildSlugSpy).toHaveBeenCalledWith({
      label: dto.label,
      fallback: 'client-source',
    });
  });

  it('should return null when update fails to find entity', async () => {
    repositoryMock.update.mockResolvedValue(null);

    await expect(usecase.execute(dto)).resolves.toBeNull();
  });

  it('should log and throw when repository update fails', async () => {
    const failure = new Error('update failure');
    repositoryMock.update.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.UPDATE_CLIENT_SOURCE_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`UpdateClientSourceUsecase#execute => ${failure.message}`);
  });
});
