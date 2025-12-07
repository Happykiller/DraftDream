import { beforeEach, describe, expect, it, jest, afterEach } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import * as slugUtil from '@src/common/slug.util';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceProspectLevelMongo } from '@services/db/mongo/repositories/prospect/level.repository';
import { CreateProspectLevelUsecase } from '@usecases/prospect/level/create.prospect-level.usecase';
import { CreateProspectLevelDto } from '@services/db/dtos/prospect/level.dto';
import { ProspectLevel } from '@services/db/models/prospect/level.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('CreateProspectLevelUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceProspectLevelMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: CreateProspectLevelUsecase;

  const dto: CreateProspectLevelDto = {
    locale: 'fr',
    label: 'Client',
    visibility: 'PUBLIC',
    createdBy: 'admin-1',
    slug: 'test-slug',
  };

  const now = new Date('2024-02-10T12:00:00.000Z');
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

    usecase = new CreateProspectLevelUsecase(inversifyMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should create a prospect level through the repository', async () => {
    const buildSlugSpy = jest.spyOn(slugUtil, 'buildSlug').mockReturnValue(level.slug);
    repositoryMock.create.mockResolvedValue(level);

    const result = await usecase.execute(dto);

    expect(repositoryMock.create).toHaveBeenCalledWith({
      locale: dto.locale,
      label: dto.label,
      visibility: dto.visibility,
      createdBy: dto.createdBy,
      slug: expect.any(String),
    });
    expect(buildSlugSpy).toHaveBeenCalledWith({
      label: dto.label,
      fallback: 'level',
    });
    expect(result).toEqual(level);
  });

  it('should return null when repository creation returns null', async () => {
    repositoryMock.create.mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw when repository creation fails', async () => {
    const failure = new Error('create failure');
    repositoryMock.create.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.CREATE_PROSPECT_LEVEL_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`CreateProspectLevelUsecase#execute => ${failure.message}`);
  });
});
