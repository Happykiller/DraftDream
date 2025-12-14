import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import * as slugUtil from '@src/common/slug.util';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceProspectSourceMongo } from '@services/db/mongo/repositories/prospect/source.repository';
import { UpdateProspectSourceUsecase } from '@usecases/prospect/source/update.prospect-source.usecase';
import { UpdateProspectSourceDto } from '@services/db/dtos/prospect/source.dto';
import { ProspectSource } from '@services/db/models/prospect/source.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('UpdateProspectSourceUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceProspectSourceMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: UpdateProspectSourceUsecase;

  const id = 'source-1';
  const dto: UpdateProspectSourceDto = {
    label: 'New Label',
  };

  const now = new Date();
  const source: ProspectSource = {
    slug: "test-slug",
    id,
    locale: 'fr',
    label: 'New Label',
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

    usecase = new UpdateProspectSourceUsecase(inversifyMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should update a prospect source', async () => {
    const buildSlugSpy = jest.spyOn(slugUtil, 'buildSlug').mockReturnValue('new-label');
    (repositoryMock.update as any).mockResolvedValue(source);

    const result = await usecase.execute({ ...dto, id });

    expect(repositoryMock.update).toHaveBeenCalledWith(id, {
      label: dto.label,
      locale: undefined,
      visibility: undefined,
      slug: expect.any(String),
    });
    expect(buildSlugSpy).toHaveBeenCalledWith({
      label: dto.label,
      fallback: 'source',
    });
    expect(result).toEqual(source);
  });

  it('should return null when repository update returns null', async () => {
    (repositoryMock.update as any).mockResolvedValue(null);

    const result = await usecase.execute({ ...dto, id });

    expect(result).toBeNull();
  });

  it('should log and throw when repository fails', async () => {
    const failure = new Error('update failure');
    (repositoryMock.update as any).mockRejectedValue(failure);

    await expect(usecase.execute({ ...dto, id })).rejects.toThrow(ERRORS.UPDATE_PROSPECT_SOURCE_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`UpdateProspectSourceUsecase#execute => ${failure.message}`);
  });
});
