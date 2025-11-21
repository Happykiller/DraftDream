import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceCoachAthleteMongo } from '@services/db/mongo/repositories/coach-athlete.repository';
import { ListCoachAthletesUsecase } from '@src/usecases/athlete/coach-athlete/list.coach-athletes.usecase';
import { ListCoachAthletesUsecaseDto } from '@src/usecases/athlete/coach-athlete/coach-athlete.usecase.dto';
import { CoachAthleteUsecaseModel } from '@src/usecases/athlete/coach-athlete/coach-athlete.usecase.model';

interface LoggerMock {
    error: (message: string) => void;
}

describe('ListCoachAthletesUsecase', () => {
    let inversifyMock: MockProxy<Inversify>;
    let bddServiceMock: MockProxy<BddServiceMongo>;
    let coachAthleteRepositoryMock: MockProxy<BddServiceCoachAthleteMongo>;
    let loggerMock: MockProxy<LoggerMock>;
    let usecase: ListCoachAthletesUsecase;

    const dto: ListCoachAthletesUsecaseDto = {
        coachId: 'coach-1',
        page: 1,
        limit: 10,
    };

    const item: CoachAthleteUsecaseModel = {
        id: 'link-1',
        coachId: 'coach-1',
        athleteId: 'athlete-1',
        startDate: new Date('2024-01-01'),
        is_active: true,
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
        coachAthleteRepositoryMock = mock<BddServiceCoachAthleteMongo>();
        loggerMock = mock<LoggerMock>();

        (bddServiceMock as unknown as { coachAthlete: BddServiceCoachAthleteMongo }).coachAthlete = coachAthleteRepositoryMock;
        inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
        inversifyMock.loggerService = loggerMock;

        usecase = new ListCoachAthletesUsecase(inversifyMock);
    });

    it('should build', () => {
        expect(usecase).toBeDefined();
    });

    it('should list coach-athlete links', async () => {
        coachAthleteRepositoryMock.list.mockResolvedValue(listResult);

        const result = await usecase.execute(dto);

        expect(coachAthleteRepositoryMock.list).toHaveBeenCalledWith(expect.objectContaining({
            coachId: dto.coachId,
            limit: dto.limit,
            page: dto.page,
        }));
        expect(result).toEqual(listResult);
    });

    it('should log and throw error when repository throws', async () => {
        const error = new Error('DB Error');
        coachAthleteRepositoryMock.list.mockRejectedValue(error);

        await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.LIST_COACH_ATHLETES_USECASE);
        expect(loggerMock.error).toHaveBeenCalledWith(expect.stringContaining(error.message));
    });
});
