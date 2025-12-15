import { beforeEach, describe, expect, it } from '@jest/globals';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceCategoryMongo } from '@services/db/mongo/repositories/category.repository';
import { CreateCategoryUsecase } from '@src/usecases/sport/category/create.category.usecase';
import { CreateCategoryUsecaseDto } from '@src/usecases/sport/category/category.usecase.dto';
import { CategoryUsecaseModel } from '@src/usecases/sport/category/category.usecase.model';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';

jest.mock('@src/common/slug.util', () => ({
  ...(jest.requireActual('@src/common/slug.util') as any),
  buildSlug: jest.fn(({ label }) => {
    // Simple slugify for testing purposes
    return label ? label.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '';
  }),
}));

interface LoggerMock {
  error: (message: string) => void;
}

describe('CreateCategoryUsecase', () => {
  let inversifyMock: Inversify;
  let bddServiceMock: BddServiceMongo;
  let categoryRepositoryMock: BddServiceCategoryMongo;
  let loggerMock: LoggerMock;
  let usecase: CreateCategoryUsecase;

  const dto: CreateCategoryUsecaseDto = {
    locale: 'en-US',
    label: 'Strength',
    visibility: 'PUBLIC',
    createdBy: 'user-123',
  };

  const now = new Date('2024-01-01T00:00:00.000Z');
  const category: CategoryUsecaseModel = {
    id: 'category-1',
    slug: 'strength',
    locale: 'en-us',
    label: 'Strength',
    visibility: 'PUBLIC',
    createdBy: 'user-123',
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    categoryRepositoryMock = {
      create: createMockFn(),
    } as unknown as BddServiceCategoryMongo;

    bddServiceMock = {
      category: categoryRepositoryMock,
    } as unknown as BddServiceMongo;

    loggerMock = {
      error: createMockFn(),
    };

    inversifyMock = {
      bddService: bddServiceMock,
      loggerService: loggerMock,
    } as unknown as Inversify;

    usecase = new CreateCategoryUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should create a category through the repository', async () => {
    asMock(categoryRepositoryMock.create).mockResolvedValue(category);

    const result = await usecase.execute(dto);

    expect(asMock(categoryRepositoryMock.create).mock.calls[0]).toEqual([
      {
        slug: 'strength',
        locale: dto.locale,
        label: dto.label,
        visibility: dto.visibility,
        createdBy: dto.createdBy,
      },
    ]);
    expect(result).toEqual(category);
  });

  it('should return null when the repository returns null', async () => {
    asMock(categoryRepositoryMock.create).mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when creation fails', async () => {
    const failure = new Error('database failure');
    asMock(categoryRepositoryMock.create).mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.CREATE_CATEGORY_USECASE);
    expect(asMock(loggerMock.error).mock.calls[0]).toEqual([
      `CreateCategoryUsecase#execute => ${failure.message}`,
    ]);
  });
});
