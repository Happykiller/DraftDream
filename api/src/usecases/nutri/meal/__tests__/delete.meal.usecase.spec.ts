import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceMealMongo } from '@services/db/mongo/repositories/meal.repository';
import { DeleteMealUsecase } from '@src/usecases/nutri/meal/delete.meal.usecase';
import { DeleteMealUsecaseDto } from '@src/usecases/nutri/meal/meal.usecase.dto';

interface LoggerMock {
  error: (message: string) => void;
}

describe('DeleteMealUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let mealRepositoryMock: MockProxy<BddServiceMealMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: DeleteMealUsecase;

  const dto: DeleteMealUsecaseDto = {
    id: 'meal-11',
  };

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    mealRepositoryMock = mock<BddServiceMealMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { meal: BddServiceMealMongo }).meal = mealRepositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new DeleteMealUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should delete the meal through the repository', async () => {
    (mealRepositoryMock.delete as any).mockResolvedValue(true);

    const result = await usecase.execute(dto);

    expect(mealRepositoryMock.delete).toHaveBeenCalledWith(dto.id);
    expect(result).toBe(true);
  });

  it('should return false when the repository returns false', async () => {
    (mealRepositoryMock.delete as any).mockResolvedValue(false);

    const result = await usecase.execute(dto);

    expect(result).toBe(false);
  });

  it('should log and throw a domain error when deletion fails', async () => {
    const failure = new Error('database failure');
    (mealRepositoryMock.delete as any).mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.DELETE_MEAL_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(
      `DeleteMealUsecase#execute => ${failure.message}`,
    );
  });
});
