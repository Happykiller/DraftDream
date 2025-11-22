import { beforeEach, describe, expect, it, afterEach, jest } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import * as slugUtil from '@src/common/slug.util';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceProspectLevelMongo } from '@services/db/mongo/repositories/prospect/level.repository';
import { UpdateProspectLevelUsecase } from '@usecases/prospect/level/update.prospect-level.usecase';
import { UpdateProspectLevelDto } from '@services/db/dtos/prospect/level.dto';
import { ProspectLevel } from '@services/db/models/prospect/level.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('UpdateProspectLevelUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceProspectLevelMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: UpdateProspectLevelUsecase;

  const dto: UpdateProspectLevelDto = { label: 'Prospect' };
  const id = 'level-1';
  const now = new Date();
  const level: ProspectLevel = {
    slug: "test-slug",
    id: 'level-1',
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
    repositoryMock = mock<BddServiceProspectLevelMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { prospectLevel: BddServiceProspectLevelMongo }).prospectLevel = repositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new UpdateProspectLevelUsecase(inversifyMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should update level through the repository', async () => {
    const buildSlugSpy = jest.spyOn(slugUtil, 'buildSlug').mockReturnValue('generated-prospect');
    repositoryMock.update.mockResolvedValue(level);

    await expect(usecase.execute(id, dto)).resolves.toEqual(level);
    expect(repositoryMock.update).toHaveBeenCalledWith(id, {
      locale: dto.locale,
      label: dto.label,
      visibility: dto.visibility,
      slug: expect.any(String),
    });
    expect(buildSlugSpy).toHaveBeenCalledWith({
      label: dto.label,
      fallback: 'client-level',
    });
  });

  it('should return null when update fails to find entity', async () => {
    repositoryMock.update.mockResolvedValue(null);

    await expect(usecase.execute(id, dto)).resolves.toBeNull();
  });

  it('should log and throw when repository update fails', async () => {
    const failure = new Error('update failure');
    repositoryMock.update.mockRejectedValue(failure);

    await expect(usecase.execute(id, dto)).rejects.toThrow(ERRORS.UPDATE_PROSPECT_LEVEL_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`UpdateProspectLevelUsecase#execute => ${failure.message}`);
  });
});
