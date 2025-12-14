import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceMealPlanMongo } from '@services/db/mongo/repositories/meal-plan.repository';
import { BddServiceUserMongo } from '@services/db/mongo/repositories/user.repository';
import { ListMealPlansUsecase } from '@src/usecases/nutri/meal-plan/list.meal-plans.usecase';
import { ListMealPlansUsecaseDto } from '@src/usecases/nutri/meal-plan/meal-plan.usecase.dto';
import { MealPlanUsecaseModel } from '@src/usecases/nutri/meal-plan/meal-plan.usecase.model';

interface LoggerMock {
    error: (message: string) => void;
}

describe('ListMealPlansUsecase', () => {
    let inversifyMock: MockProxy<Inversify>;
    let bddServiceMock: MockProxy<BddServiceMongo>;
    let mealPlanRepositoryMock: MockProxy<BddServiceMealPlanMongo>;
    let userRepositoryMock: MockProxy<BddServiceUserMongo>;
    let loggerMock: MockProxy<LoggerMock>;
    let usecase: ListMealPlansUsecase;

    const dto: ListMealPlansUsecaseDto = {
        session: {
            userId: 'user-1',
            role: Role.COACH,
        },
        page: 1,
        limit: 10,
    };

    const item: MealPlanUsecaseModel = {
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

    const listResult = {
        items: [item],
        total: 1,
        page: 1,
        limit: 10,
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

        usecase = new ListMealPlansUsecase(inversifyMock);
    });

    it('should build', () => {
        expect(usecase).toBeDefined();
    });

    it('should list meal plans for admin', async () => {
        const adminDto = { ...dto, session: { ...dto.session, role: Role.ADMIN, userId: 'admin-1' } };
        (mealPlanRepositoryMock.list as any).mockResolvedValue(listResult);

        const result = await usecase.execute(adminDto);

        expect(mealPlanRepositoryMock.list).toHaveBeenCalled();
        expect(result).toEqual(listResult);
    });

    it('should list meal plans for coach (accessible creators)', async () => {
        (userRepositoryMock.listUsers as any).mockResolvedValue({ items: [], total: 0, page: 1, limit: 50 }); // No admins
        (mealPlanRepositoryMock.list as any).mockResolvedValue(listResult);

        const result = await usecase.execute(dto);

        expect(mealPlanRepositoryMock.list).toHaveBeenCalledWith(expect.objectContaining({
            createdByIn: expect.arrayContaining(['user-1']),
        }));
        expect(result).toEqual(listResult);
    });

    it('should list meal plans for athlete (assigned to them)', async () => {
        const athleteDto = { ...dto, session: { ...dto.session, role: Role.ATHLETE, userId: 'athlete-1' } };
        (mealPlanRepositoryMock.list as any).mockResolvedValue(listResult);

        const result = await usecase.execute(athleteDto);

        expect(mealPlanRepositoryMock.list).toHaveBeenCalledWith(expect.objectContaining({
            userId: 'athlete-1',
        }));
        expect(result).toEqual(listResult);
    });

    it('should throw forbidden error for athlete if filtering by createdBy', async () => {
        const athleteDto = { ...dto, session: { ...dto.session, role: Role.ATHLETE, userId: 'athlete-1' }, createdBy: 'other' };

        await expect(usecase.execute(athleteDto)).rejects.toThrow(ERRORS.LIST_MEAL_PLANS_FORBIDDEN);
    });

    it('should log and throw error when repository throws', async () => {
        const error = new Error('DB Error');
        (mealPlanRepositoryMock.list as any).mockRejectedValue(error);
        // Mock user list for coach flow
        (userRepositoryMock.listUsers as any).mockResolvedValue({ items: [], total: 0, page: 1, limit: 50 });

        await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.LIST_MEAL_PLANS_USECASE);
        expect(loggerMock.error).toHaveBeenCalledWith(expect.stringContaining(error.message));
    });
});
