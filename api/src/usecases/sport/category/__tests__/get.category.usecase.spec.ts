import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceCategoryMongo } from '@services/db/mongo/repositories/category.repository';
import { GetCategoryUsecase } from '@src/usecases/sport/category/get.category.usecase';
import { GetCategoryUsecaseDto } from '@src/usecases/sport/category/category.usecase.dto';
import { CategoryUsecaseModel } from '@src/usecases/sport/category/category.usecase.model';

interface LoggerMock {
  error: (message: string) => void;
}

describe('GetCategoryUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let categoryRepositoryMock: MockProxy<BddServiceCategoryMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: GetCategoryUsecase;

  const dto: GetCategoryUsecaseDto = {
    id: 'category-456',
  };

  const category: CategoryUsecaseModel = {
    id: 'category-456',
    slug: 'mobility',
    locale: 'en-US',
    label: 'Mobility',
    visibility: 'PRIVATE',
    createdBy: 'coach-1',
    createdAt: new Date('2024-01-02T00:00:00.000Z'),
    updatedAt: new Date('2024-02-02T00:00:00.000Z'),
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

    usecase = new GetCategoryUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should return the category retrieved from the repository', async () => {
    (categoryRepositoryMock.get as any).mockResolvedValue(category);

    const result = await usecase.execute(dto);

    expect(categoryRepositoryMock.get).toHaveBeenCalledWith({ id: dto.id });
    expect(result).toEqual(category);
    expect(result).not.toBe(category);
  });

  it('should return null when the category is not found', async () => {
    (categoryRepositoryMock.get as any).mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when retrieval fails', async () => {
    const failure = new Error('repository failure');
    (categoryRepositoryMock.get as any).mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.GET_CATEGORY_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(
      `GetCategoryUsecase#execute => ${failure.message}`,
    );
  });
});
