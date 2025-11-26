import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceMealPlanMongo } from '@services/db/mongo/repositories/meal-plan.repository';
import { BddServiceUserMongo } from '@services/db/mongo/repositories/user.repository';
import { GetMealPlanUsecase } from '@src/usecases/nutri/meal-plan/get.meal-plan.usecase';
import { GetMealPlanUsecaseDto } from '@src/usecases/nutri/meal-plan/meal-plan.usecase.dto';
import { MealPlanUsecaseModel } from '@src/usecases/nutri/meal-plan/meal-plan.usecase.model';

interface LoggerMock {
    error: (message: string) => void;
    warn: (message: string) => void;
}

describe('GetMealPlanUsecase', () => {
    let inversifyMock: MockProxy<Inversify>;
    let bddServiceMock: MockProxy<BddServiceMongo>;
    let mealPlanRepositoryMock: MockProxy<BddServiceMealPlanMongo>;
    let userRepositoryMock: MockProxy<BddServiceUserMongo>;
    let loggerMock: MockProxy<LoggerMock>;
    let usecase: GetMealPlanUsecase;

    const dto: GetMealPlanUsecaseDto = {
        id: 'plan-1',
        session: {
            userId: 'user-1',
            role: Role.COACH,
        },
    };

    const mealPlan: MealPlanUsecaseModel = {
        id: 'plan-1',
        slug: 'plan-1',
        label: 'Plan 1',
        locale: 'en-US',
        calories: 2000,
        proteinGrams: 150,
        carbGrams: 200,
        fatGrams: 70,
        days: [],
        visibility: 'public',
        createdBy: 'user-1',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(() => {
        inversifyMock = mock<Inversify>();
        bddServiceMock = mock<BddServiceMongo>();
        mealPlanRepositoryMock = mock<BddServiceMealPlanMongo>();
        userRepositoryMock = mock<BddServiceUserMongo>();
        loggerMock = mock<LoggerMock>();

        (bddServiceMock as unknown as { mealPlan: BddServiceMealPlanMongo }).mealPlan = mealPlanRepositoryMock;
        (bddServiceMock as unknown as { user: BddServiceUserMongo }).user = userRepositoryMock;
        inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
        inversifyMock.loggerService = loggerMock;

        usecase = new GetMealPlanUsecase(inversifyMock);
    });

    it('should build', () => {
        expect(usecase).toBeDefined();
    });

    it('should get a meal plan if user is creator', async () => {
        mealPlanRepositoryMock.get.mockResolvedValue(mealPlan);

        const result = await usecase.execute(dto);

        expect(mealPlanRepositoryMock.get).toHaveBeenCalledWith({ id: dto.id });
        expect(result).toEqual(mealPlan);
    });

    it('should get a meal plan if user is admin', async () => {
        const adminDto = { ...dto, session: { ...dto.session, role: Role.ADMIN, userId: 'admin-1' } };
        mealPlanRepositoryMock.get.mockResolvedValue(mealPlan);

        const result = await usecase.execute(adminDto);

        expect(result).toEqual(mealPlan);
    });

    it('should return null if not found', async () => {
        mealPlanRepositoryMock.get.mockResolvedValue(null);

        const result = await usecase.execute(dto);

        expect(result).toBeNull();
    });

    it('should throw forbidden error if user is not authorized', async () => {
        const otherUserDto = { ...dto, session: { ...dto.session, userId: 'other-user', role: Role.ATHLETE } };
        const privateMealPlan = { ...mealPlan, visibility: 'private' };
        mealPlanRepositoryMock.get.mockResolvedValue(privateMealPlan as any); // Cast to any to avoid strict type check on visibility string literal if needed

        await expect(usecase.execute(otherUserDto)).rejects.toThrow(ERRORS.GET_MEAL_PLAN_FORBIDDEN);
    });

    it('should log and throw error when repository throws', async () => {
        const error = new Error('DB Error');
        mealPlanRepositoryMock.get.mockRejectedValue(error);

        await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.GET_MEAL_PLAN_USECASE);
        expect(loggerMock.error).toHaveBeenCalledWith(expect.stringContaining(error.message));
    });
});
