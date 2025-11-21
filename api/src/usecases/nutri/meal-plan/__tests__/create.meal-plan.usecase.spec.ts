import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceMealPlanMongo } from '@services/db/mongo/repositories/meal-plan.repository';
import { CreateMealPlanUsecase } from '@src/usecases/nutri/meal-plan/create.meal-plan.usecase';
import { CreateMealPlanUsecaseDto } from '@src/usecases/nutri/meal-plan/meal-plan.usecase.dto';
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

describe('CreateMealPlanUsecase', () => {
    let inversifyMock: MockProxy<Inversify>;
    let bddServiceMock: MockProxy<BddServiceMongo>;
    let mealPlanRepositoryMock: MockProxy<BddServiceMealPlanMongo>;
    let loggerMock: MockProxy<LoggerMock>;
    let usecase: CreateMealPlanUsecase;

    const dto: CreateMealPlanUsecaseDto = {
        label: 'My Meal Plan',
        locale: 'en-US',
        calories: 2000,
        proteinGrams: 150,
        carbGrams: 200,
        fatGrams: 70,
        days: [
            {
                id: 'day-1',
                label: 'Day 1',
                meals: [
                    {
                        id: 'meal-1',
                        label: 'Breakfast',
                        foods: 'Eggs',
                        calories: 500,
                        proteinGrams: 30,
                        carbGrams: 20,
                        fatGrams: 10,
                        type: { label: 'Breakfast' },
                    },
                ],
            },
        ],
        visibility: 'public',
        createdBy: 'user-1',
    };

    const createdMealPlan: MealPlanUsecaseModel = {
        id: 'plan-1',
        slug: 'my-meal-plan',
        label: 'My Meal Plan',
        locale: 'en-US',
        calories: 2000,
        proteinGrams: 150,
        carbGrams: 200,
        fatGrams: 70,
        days: [
            {
                id: 'day-1',
                slug: 'day-1',
                label: 'Day 1',
                meals: [
                    {
                        id: 'meal-1',
                        slug: 'breakfast',
                        label: 'Breakfast',
                        foods: 'Eggs',
                        calories: 500,
                        proteinGrams: 30,
                        carbGrams: 20,
                        fatGrams: 10,
                        type: { label: 'Breakfast' },
                    },
                ],
            },
        ],
        visibility: 'public',
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

        usecase = new CreateMealPlanUsecase(inversifyMock);
    });

    it('should build', () => {
        expect(usecase).toBeDefined();
    });

    it('should create a meal plan with generated slugs', async () => {
        mealPlanRepositoryMock.create.mockResolvedValue(createdMealPlan);

        const result = await usecase.execute(dto);

        expect(mealPlanRepositoryMock.create).toHaveBeenCalledWith(expect.objectContaining({
            label: dto.label,
            slug: 'my-meal-plan',
        }));
        expect(result).toEqual(createdMealPlan);
    });

    it('should return null if creation fails', async () => {
        mealPlanRepositoryMock.create.mockResolvedValue(null);

        const result = await usecase.execute(dto);

        expect(result).toBeNull();
    });

    it('should log and throw error when repository throws', async () => {
        const error = new Error('DB Error');
        mealPlanRepositoryMock.create.mockRejectedValue(error);

        await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.CREATE_MEAL_PLAN_USECASE);
        expect(loggerMock.error).toHaveBeenCalledWith(expect.stringContaining(error.message));
    });
});
