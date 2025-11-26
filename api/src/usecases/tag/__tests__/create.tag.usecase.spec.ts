import { beforeEach, describe, expect, it, jest } from '@jest/globals';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceTagMongo } from '@services/db/mongo/repositories/tag.repository';
import { CreateTagUsecase } from '@usecases/tag/create.tag.usecase';
import { CreateTagUsecaseDto } from '@usecases/tag/tag.usecase.dto';
import { TagUsecaseModel } from '@usecases/tag/tag.usecase.model';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

jest.mock('@src/common/slug.util', () => ({
  ...(jest.requireActual('@src/common/slug.util') as any),
  buildSlug: jest.fn(({ label }) => {
    return label ? label.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '';
  }),
}));

interface LoggerMock {
  error: (message: string) => void;
}

describe('CreateTagUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let tagRepositoryMock: BddServiceTagMongo;
  let loggerMock: LoggerMock;
  let usecase: CreateTagUsecase;

  const dto: CreateTagUsecaseDto = {
    locale: 'en-US',
    label: 'Mobility',
    visibility: 'public',
    createdBy: 'coach-123',
  };

  const now = new Date('2024-01-01T00:00:00.000Z');
  const tag: TagUsecaseModel = {
    id: 'tag-1',
    slug: 'mobility',
    locale: 'en-us',
    label: 'Mobility',
    visibility: 'public',
    createdBy: 'coach-123',
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    tagRepositoryMock = {
      create: createMockFn(),
    } as unknown as BddServiceTagMongo;

    bddServiceMock = {
      tag: tagRepositoryMock,
    } as unknown as BddServiceMongo;

    loggerMock = {
      error: createMockFn(),
    };

    inversifyMock = {
      bddService: bddServiceMock,
      loggerService: loggerMock,
    } as unknown as Inversify;

    usecase = new CreateTagUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should create a tag through the repository', async () => {
    asMock(tagRepositoryMock.create).mockResolvedValue(tag);

    const result = await usecase.execute(dto);

    expect(asMock(tagRepositoryMock.create).mock.calls[0]).toEqual([
      {
        slug: 'mobility',
        locale: dto.locale,
        label: dto.label,
        visibility: dto.visibility,
        createdBy: dto.createdBy,
      },
    ]);
    expect(result).toEqual(tag);
  });

  it('should return null when the repository returns null', async () => {
    asMock(tagRepositoryMock.create).mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when creation fails', async () => {
    const failure = new Error('database failure');
    asMock(tagRepositoryMock.create).mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.CREATE_TAG_USECASE);
    expect(asMock(loggerMock.error).mock.calls[0]).toEqual([
      `CreateTagUsecase#execute => ${failure.message}`,
    ]);
  });
});
