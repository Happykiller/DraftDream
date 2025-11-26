import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceCoachAthleteMongo } from '@services/db/mongo/repositories/coach-athlete.repository';
import { CreateCoachAthleteUsecase } from '@src/usecases/athlete/coach-athlete/create.coach-athlete.usecase';
import { CreateCoachAthleteUsecaseDto } from '@src/usecases/athlete/coach-athlete/coach-athlete.usecase.dto';
import { CoachAthleteUsecaseModel } from '@src/usecases/athlete/coach-athlete/coach-athlete.usecase.model';

interface LoggerMock {
    error: (message: string) => void;
}

describe('CreateCoachAthleteUsecase', () => {
    let inversifyMock: MockProxy<Inversify>;
    let bddServiceMock: MockProxy<BddServiceMongo>;
    let coachAthleteRepositoryMock: MockProxy<BddServiceCoachAthleteMongo>;
    let loggerMock: MockProxy<LoggerMock>;
    let usecase: CreateCoachAthleteUsecase;

    const dto: CreateCoachAthleteUsecaseDto = {
        coachId: 'coach-1',
        athleteId: 'athlete-1',
        startDate: new Date('2024-01-01'),
        is_active: true,
        createdBy: 'user-1',
    };

    const createdLink: CoachAthleteUsecaseModel = {
        id: 'link-1',
        ...dto,
        is_active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(() => {
        inversifyMock = mock<Inversify>();
        bddServiceMock = mock<BddServiceMongo>();
        coachAthleteRepositoryMock = mock<BddServiceCoachAthleteMongo>();
        loggerMock = mock<LoggerMock>();

        (bddServiceMock as unknown as { coachAthlete: BddServiceCoachAthleteMongo }).coachAthlete = coachAthleteRepositoryMock;
        inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
        inversifyMock.loggerService = loggerMock;

        usecase = new CreateCoachAthleteUsecase(inversifyMock);
    });

    it('should build', () => {
        expect(usecase).toBeDefined();
    });

    it('should create a coach-athlete link', async () => {
        coachAthleteRepositoryMock.create.mockResolvedValue(createdLink);

        const result = await usecase.execute(dto);

        expect(coachAthleteRepositoryMock.create).toHaveBeenCalledWith(dto);
        expect(result).toEqual(createdLink);
    });

    it('should return null if creation fails (returns null)', async () => {
        coachAthleteRepositoryMock.create.mockResolvedValue(null);

        const result = await usecase.execute(dto);

        expect(result).toBeNull();
    });

    it('should log and throw error when repository throws', async () => {
        const error = new Error('DB Error');
        coachAthleteRepositoryMock.create.mockRejectedValue(error);

        await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.CREATE_COACH_ATHLETE_USECASE);
        expect(loggerMock.error).toHaveBeenCalledWith(expect.stringContaining(error.message));
    });
});
