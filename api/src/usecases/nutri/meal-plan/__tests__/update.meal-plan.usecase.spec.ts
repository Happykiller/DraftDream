import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceMealPlanMongo } from '@services/db/mongo/repositories/meal-plan.repository';
import { UpdateMealPlanUsecase } from '@src/usecases/nutri/meal-plan/update.meal-plan.usecase';
import { UpdateMealPlanUsecaseDto } from '@src/usecases/nutri/meal-plan/meal-plan.usecase.dto';
import { MealPlanUsecaseModel } from '@src/usecases/nutri/meal-plan/meal-plan.usecase.model';

jest.mock('@src/common/slug.util', () => ({
    ...(jest.requireActual('@src/common/slug.util') as any),
    buildSlug: jest.fn(({ label }) => {
        return label ? label.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '';
    }),
}));

interface LoggerMock {
    error: (message: string) => void;
}

describe('UpdateMealPlanUsecase', () => {
    let inversifyMock: MockProxy<Inversify>;
    let bddServiceMock: MockProxy<BddServiceMongo>;
    let mealPlanRepositoryMock: MockProxy<BddServiceMealPlanMongo>;
    let loggerMock: MockProxy<LoggerMock>;
    let usecase: UpdateMealPlanUsecase;

    const dto: UpdateMealPlanUsecaseDto = {
        label: 'Updated Plan',
        visibility: 'private',
    };

    const updatedMealPlan: MealPlanUsecaseModel = {
        id: 'plan-1',
        slug: 'updated-plan',
        label: 'Updated Plan',
        locale: 'en-US',
        calories: 2000,
        proteinGrams: 150,
        carbGrams: 200,
        fatGrams: 70,
        days: [],
        visibility: 'private',
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

        usecase = new UpdateMealPlanUsecase(inversifyMock);
    });

    it('should build', () => {
        expect(usecase).toBeDefined();
    });

    it('should update a meal plan and regenerate slug if label provided', async () => {
        mealPlanRepositoryMock.update.mockResolvedValue(updatedMealPlan);

        const result = await usecase.execute('plan-1', dto);

        expect(mealPlanRepositoryMock.update).toHaveBeenCalledWith('plan-1', expect.objectContaining({
            label: dto.label,
            slug: 'updated-plan',
        }));
        expect(result).toEqual(updatedMealPlan);
    });

    it('should return null if update fails', async () => {
        mealPlanRepositoryMock.update.mockResolvedValue(null);

        const result = await usecase.execute('plan-1', dto);

        expect(result).toBeNull();
    });

    it('should log and throw error when repository throws', async () => {
        const error = new Error('DB Error');
        mealPlanRepositoryMock.update.mockRejectedValue(error);

        await expect(usecase.execute('plan-1', dto)).rejects.toThrow(ERRORS.UPDATE_MEAL_PLAN_USECASE);
        expect(loggerMock.error).toHaveBeenCalledWith(expect.stringContaining(error.message));
    });
});
