import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceCategoryMongo } from '@services/db/mongo/repositories/category.repository';
import { UpdateCategoryUsecase } from '@src/usecases/sport/category/update.category.usecase';
import { UpdateCategoryUsecaseDto } from '@src/usecases/sport/category/category.usecase.dto';
import { CategoryUsecaseModel } from '@src/usecases/sport/category/category.usecase.model';

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

describe('UpdateCategoryUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let categoryRepositoryMock: MockProxy<BddServiceCategoryMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: UpdateCategoryUsecase;

  const dto: UpdateCategoryUsecaseDto = {
    id: 'category-789',
    locale: 'en-US',
    label: 'Flexibility',
    visibility: 'PUBLIC',
  };

  const updatedCategory: CategoryUsecaseModel = {
    id: 'category-789',
    slug: 'flexibility',
    locale: 'en-US',
    label: 'Flexibility',
    visibility: 'PUBLIC',
    createdBy: 'coach-3',
    createdAt: new Date('2024-03-01T00:00:00.000Z'),
    updatedAt: new Date('2024-04-01T00:00:00.000Z'),
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

    usecase = new UpdateCategoryUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should update the category through the repository', async () => {
    categoryRepositoryMock.update.mockResolvedValue(updatedCategory);

    const result = await usecase.execute(dto);

    expect(categoryRepositoryMock.update).toHaveBeenCalledWith(dto.id, {
      slug: 'flexibility',
      locale: dto.locale,
      label: dto.label,
      visibility: dto.visibility,
    });
    expect(result).toEqual(updatedCategory);
    expect(result).not.toBe(updatedCategory);
  });

  it('should return null when the repository returns null', async () => {
    categoryRepositoryMock.update.mockResolvedValue(null);

    const result = await usecase.execute(dto);

    expect(result).toBeNull();
  });

  it('should log and throw a domain error when update fails', async () => {
    const failure = new Error('update failure');
    categoryRepositoryMock.update.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.UPDATE_CATEGORY_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(
      `UpdateCategoryUsecase#execute => ${failure.message}`,
    );
  });
});
