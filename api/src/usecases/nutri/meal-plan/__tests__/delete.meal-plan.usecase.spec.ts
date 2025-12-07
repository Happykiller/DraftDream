import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceMealPlanMongo } from '@services/db/mongo/repositories/meal-plan.repository';
import { DeleteMealPlanUsecase } from '@src/usecases/nutri/meal-plan/delete.meal-plan.usecase';
import { DeleteMealPlanUsecaseDto } from '@src/usecases/nutri/meal-plan/meal-plan.usecase.dto';
import { MealPlanUsecaseModel } from '@src/usecases/nutri/meal-plan/meal-plan.usecase.model';

interface LoggerMock {
    error: (message: string) => void;
}

describe('DeleteMealPlanUsecase', () => {
    let inversifyMock: MockProxy<Inversify>;
    let bddServiceMock: MockProxy<BddServiceMongo>;
    let mealPlanRepositoryMock: MockProxy<BddServiceMealPlanMongo>;
    let loggerMock: MockProxy<LoggerMock>;
    let usecase: DeleteMealPlanUsecase;

    const dto: DeleteMealPlanUsecaseDto = {
        id: 'plan-1',
        session: {
            userId: 'user-1',
            role: Role.COACH,
        },
    };

    const existingMealPlan: MealPlanUsecaseModel = {
        id: 'plan-1',
        slug: 'plan-1',
        label: 'Plan 1',
        locale: 'en-US',
        calories: 2000,
        proteinGrams: 150,
        carbGrams: 200,
        fatGrams: 70,
        days: [],
        visibility: 'PUBLIC',
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(() => {
        inversifyMock = mock<Inversify>();
        bddServiceMock = mock<BddServiceMongo>();
        mealPlanRepositoryMock = mock<BddServiceMealPlanMongo>();
        loggerMock = mock<LoggerMock>();

        (bddServiceMock as unknown as { mealPlan: BddServiceMealPlanMongo }).mealPlan = mealPlanRepositoryMock;
        inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
        inversifyMock.loggerService = loggerMock;

        usecase = new DeleteMealPlanUsecase(inversifyMock);
    });

    it('should build', () => {
        expect(usecase).toBeDefined();
    });

    it('should delete a meal plan if user is creator', async () => {
        mealPlanRepositoryMock.get.mockResolvedValue(existingMealPlan);
        mealPlanRepositoryMock.delete.mockResolvedValue(true);

        const result = await usecase.execute(dto);

        expect(mealPlanRepositoryMock.delete).toHaveBeenCalledWith(dto.id);
        expect(result).toBe(true);
    });

    it('should delete a meal plan if user is admin', async () => {
        const adminDto = { ...dto, session: { ...dto.session, role: Role.ADMIN, userId: 'admin-1' } };
        mealPlanRepositoryMock.get.mockResolvedValue(existingMealPlan);
        mealPlanRepositoryMock.delete.mockResolvedValue(true);

        const result = await usecase.execute(adminDto);

        expect(mealPlanRepositoryMock.delete).toHaveBeenCalledWith(dto.id);
        expect(result).toBe(true);
    });

    it('should return false if meal plan not found', async () => {
        mealPlanRepositoryMock.get.mockResolvedValue(null);

        const result = await usecase.execute(dto);

        expect(result).toBe(false);
    });

    it('should throw forbidden error if user is not creator nor admin', async () => {
        const otherUserDto = { ...dto, session: { ...dto.session, userId: 'other-user' } };
        mealPlanRepositoryMock.get.mockResolvedValue(existingMealPlan);

        await expect(usecase.execute(otherUserDto)).rejects.toThrow(ERRORS.DELETE_MEAL_PLAN_FORBIDDEN);
    });

    it('should log and throw error when repository throws', async () => {
        const error = new Error('DB Error');
        mealPlanRepositoryMock.get.mockRejectedValue(error);

        await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.UPDATE_EXERCISE_USECASE);
        expect(loggerMock.error).toHaveBeenCalledWith(expect.stringContaining(error.message));
    });
});
