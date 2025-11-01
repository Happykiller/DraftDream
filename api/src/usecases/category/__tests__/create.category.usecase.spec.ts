import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceCategoryMongo } from '@services/db/mongo/repositories/category.repository';
import { CreateCategoryUsecase } from '@usecases/category/create.category.usecase';
import { CreateCategoryUsecaseDto } from '@usecases/category/category.usecase.dto';
import { CategoryUsecaseModel } from '@usecases/category/category.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('CreateCategoryUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let categoryRepositoryMock: MockProxy<BddServiceCategoryMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: CreateCategoryUsecase;

  const dto: CreateCategoryUsecaseDto = {
    slug: 'strength',
    locale: 'en-US',
    label: 'Strength',
    visibility: 'public',
    createdBy: 'user-123',
  };

  const now = new Date('2024-01-01T00:00:00.000Z');
  const category: CategoryUsecaseModel = {
    id: 'category-1',
    slug: 'strength',
    locale: 'en-us',
    label: 'Strength',
    visibility: 'public',
    createdBy: 'user-123',
    createdAt: now,
    updatedAt: now,
  };

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    categoryRepositoryMock = mock<BddServiceCategoryMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { category: BddServiceCategoryMongo }).category =
      categoryRepositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new CreateCategoryUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should create a category through the repository', async () => {
    categoryRepositoryMock.create.mockResolvedValue(category);

    const result = await usecase.execute(dto);

    expect(categoryRepositoryMock.create).toHaveBeenCalledWith({
      slug: dto.slug,
      locale: dto.locale,
      label: dto.label,
      visibility: dto.visibility,
      createdBy: dto.createdBy,
    });
    expect(result).toEqual(category);
  });

  it('should return null when the repository returns null', async () => {
    categoryRepositoryMock.create.mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when creation fails', async () => {
    const failure = new Error('database failure');
    categoryRepositoryMock.create.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.CREATE_CATEGORY_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(
      `CreateCategoryUsecase#execute => ${failure.message}`,
    );
  });
});
