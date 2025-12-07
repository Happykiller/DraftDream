import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceCategoryMongo } from '@services/db/mongo/repositories/category.repository';
import { ListCategoriesUsecase } from '@src/usecases/sport/category/list.category.usecase';
import { ListCategoriesUsecaseDto } from '@src/usecases/sport/category/category.usecase.dto';
import { CategoryUsecaseModel } from '@src/usecases/sport/category/category.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('ListCategoriesUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let categoryRepositoryMock: MockProxy<BddServiceCategoryMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: ListCategoriesUsecase;

  const dto: ListCategoriesUsecaseDto = {
    page: 2,
    limit: 10,
    locale: 'en-US',
  };

  const categories: CategoryUsecaseModel[] = [
    {
      id: 'category-1',
      slug: 'strength',
      locale: 'en-US',
      label: 'Strength',
      visibility: 'PUBLIC',
      createdBy: 'coach-1',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-10T00:00:00.000Z'),
    },
    {
      id: 'category-2',
      slug: 'endurance',
      locale: 'en-US',
      label: 'Endurance',
      visibility: 'PRIVATE',
      createdBy: 'coach-2',
      createdAt: new Date('2024-02-01T00:00:00.000Z'),
      updatedAt: new Date('2024-02-10T00:00:00.000Z'),
    },
  ];

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    categoryRepositoryMock = mock<BddServiceCategoryMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { category: BddServiceCategoryMongo }).category =
      categoryRepositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new ListCategoriesUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should list categories through the repository', async () => {
    categoryRepositoryMock.list.mockResolvedValue({
      items: categories,
      total: categories.length,
      page: dto.page!,
      limit: dto.limit!,
    });

    const result = await usecase.execute(dto);

    expect(categoryRepositoryMock.list).toHaveBeenCalledWith(dto);
    expect(result).toEqual({
      items: categories,
      total: categories.length,
      page: dto.page,
      limit: dto.limit,
    });
    expect(result.items[0]).not.toBe(categories[0]);
    expect(result.items[1]).not.toBe(categories[1]);
  });

  it('should call the repository with default parameters when none are provided', async () => {
    categoryRepositoryMock.list.mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
    });

    await usecase.execute();

    expect(categoryRepositoryMock.list).toHaveBeenCalledWith({});
  });

  it('should log and throw a domain error when listing fails', async () => {
    const failure = new Error('list failure');
    categoryRepositoryMock.list.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.LIST_CATEGORIES_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(
      `ListCategoriesUsecase#execute => ${failure.message}`,
    );
  });
});
