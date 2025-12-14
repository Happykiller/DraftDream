import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceMealTypeMongo } from '@services/db/mongo/repositories/meal-type.repository';
import { DeleteMealTypeUsecase } from '@src/usecases/nutri/meal-type/delete.meal-type.usecase';
import { DeleteMealTypeUsecaseDto } from '@src/usecases/nutri/meal-type/meal-type.usecase.dto';

interface LoggerMock {
  error: (message: string) => void;
}

describe('DeleteMealTypeUsecase', () => {
  let inversifyMock: MockProxy<Inversify>;
  let bddServiceMock: MockProxy<BddServiceMongo>;
  let mealTypeRepositoryMock: MockProxy<BddServiceMealTypeMongo>;
  let loggerMock: MockProxy<LoggerMock>;
  let usecase: DeleteMealTypeUsecase;

  const dto: DeleteMealTypeUsecaseDto = {
    id: 'meal-type-77',
  };

  beforeEach(() => {
    inversifyMock = mock<Inversify>();
    bddServiceMock = mock<BddServiceMongo>();
    mealTypeRepositoryMock = mock<BddServiceMealTypeMongo>();
    loggerMock = mock<LoggerMock>();

    (bddServiceMock as unknown as { mealType: BddServiceMealTypeMongo }).mealType =
      mealTypeRepositoryMock;
    inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
    inversifyMock.loggerService = loggerMock;

    usecase = new DeleteMealTypeUsecase(inversifyMock);
  });

  it('should build', () => {
    expect(usecase).toBeDefined();
  });

  it('should delete the meal type through the repository', async () => {
    (mealTypeRepositoryMock.delete as any).mockResolvedValue(true);

    const result = await usecase.execute(dto);

    expect(mealTypeRepositoryMock.delete).toHaveBeenCalledWith(dto.id);
    expect(result).toBe(true);
  });

  it('should return false when the repository returns false', async () => {
    (mealTypeRepositoryMock.delete as any).mockResolvedValue(false);

    const result = await usecase.execute(dto);

    expect(result).toBe(false);
  });

  it('should log and throw a domain error when deletion fails', async () => {
    const failure = new Error('database failure');
    (mealTypeRepositoryMock.delete as any).mockRejectedValue(failure);

    await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.DELETE_MEAL_TYPE_USECASE);
    expect(loggerMock.error).toHaveBeenCalledWith(
      `DeleteMealTypeUsecase#execute => ${failure.message}`,
    );
  });
});
