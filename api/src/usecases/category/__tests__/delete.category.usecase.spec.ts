import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceCategoryMongo } from '@services/db/mongo/repositories/category.repository';
import { DeleteCategoryUsecase } from '@usecases/category/delete.category.usecase';
import { DeleteCategoryUsecaseDto } from '@usecases/category/category.usecase.dto';

interface LoggerMock {
  error: (message: string) => void;
}

describe('DeleteCategoryUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let categoryRepositoryMock: MockProxy<BddServiceCategoryMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: DeleteCategoryUsecase;

  const dto: DeleteCategoryUsecaseDto = {
    id: 'category-123',
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

    usecase = new DeleteCategoryUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should delete the category through the repository', async () => {
    categoryRepositoryMock.delete.mockResolvedValue(true);

    const result = await usecase.execute(dto);

    expect(categoryRepositoryMock.delete).toHaveBeenCalledWith(dto.id);
    expect(result).toBe(true);
  });

  it('should return false when the repository returns false', async () => {
    categoryRepositoryMock.delete.mockResolvedValue(false);

    const result = await usecase.execute(dto);

    expect(result).toBe(false);
  });

  it('should log and throw a domain error when deletion fails', async () => {
    const failure = new Error('database failure');
    categoryRepositoryMock.delete.mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.DELETE_CATEGORY_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(
      `DeleteCategoryUsecase#execute => ${failure.message}`,
    );
  });
});
