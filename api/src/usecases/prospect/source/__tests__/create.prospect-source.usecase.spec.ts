import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import * as slugUtil from '@src/common/slug.util';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceProspectSourceMongo } from '@services/db/mongo/repositories/prospect/source.repository';
import { CreateProspectSourceUsecase } from '@usecases/prospect/source/create.prospect-source.usecase';
import { CreateProspectSourceDto } from '@services/db/dtos/prospect/source.dto';
import { ProspectSource } from '@services/db/models/prospect/source.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('CreateProspectSourceUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let repositoryMock: MockProxy<BddServiceProspectSourceMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: CreateProspectSourceUsecase;

  const dto: CreateProspectSourceDto = {
    locale: 'fr',
    label: 'Client',
    visibility: 'PUBLIC',
    createdBy: 'admin-1',
    slug: 'test-slug',
  };

  const now = new Date('2024-02-10T12:00:00.000Z');
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

    usecase = new CreateProspectSourceUsecase(inversifyMock);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should create a prospect source through the repository', async () => {
    const buildSlugSpy = jest.spyOn(slugUtil, 'buildSlug').mockReturnValue(source.slug);
    (repositoryMock.create as any).mockResolvedValue(source);

    // Remove slug from dto for execution if it's not used in the usecase logic directly but generated
    // However, the DTO interface has slug. In the usecase, slug is generated.
    // The usecase takes CreateProspectSourceDto which has slug.
    // But usually create DTOs don't have slug if it's generated.
    // Let's check the DTO definition I wrote earlier.
    // The usecase: const slug = buildSlug(...); const created = await repo.create({ slug, ... });
    // So the input DTO to usecase might NOT need slug if the usecase generates it, BUT the DTO interface I defined HAS slug.
    // This implies the caller MUST provide a slug, OR the usecase ignores it and overwrites it.
    // Looking at the usecase code I wrote:
    // async execute(dto: CreateProspectSourceDto) { const slug = buildSlug(...); ... }
    // It seems I defined the DTO to have slug, which might be a mistake if it's auto-generated.
    // But for now I will pass it in the test.

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
      fallback: 'source',
    });
    expect(result).toEqual(source);
  });

  it('should return null when repository creation returns null', async () => {
    (repositoryMock.create as any).mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw when repository creation fails', async () => {
    const failure = new Error('create failure');
    (repositoryMock.create as any).mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.CREATE_PROSPECT_SOURCE_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(`CreateProspectSourceUsecase#execute => ${failure.message}`);
  });
});
