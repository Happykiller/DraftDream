import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceCoachAthleteMongo } from '@services/db/mongo/repositories/coach-athlete.repository';
import { UpdateCoachAthleteUsecase } from '@src/usecases/athlete/coach-athlete/update.coach-athlete.usecase';
import { UpdateCoachAthleteUsecaseDto } from '@src/usecases/athlete/coach-athlete/coach-athlete.usecase.dto';
import { CoachAthleteUsecaseModel } from '@src/usecases/athlete/coach-athlete/coach-athlete.usecase.model';

interface LoggerMock {
    error: (message: string) => void;
}

describe('UpdateCoachAthleteUsecase', () => {
    let inversifyMock: MockProxy<Inversify>;
    let bddServiceMock: MockProxy<BddServiceMongo>;
    let coachAthleteRepositoryMock: MockProxy<BddServiceCoachAthleteMongo>;
    let loggerMock: MockProxy<LoggerMock>;
    let usecase: UpdateCoachAthleteUsecase;

    const dto: UpdateCoachAthleteUsecaseDto = {
        id: 'link-1',
        is_active: false,
    };

    const updatedLink: CoachAthleteUsecaseModel = {
        id: 'link-1',
        coachId: 'coach-1',
        athleteId: 'athlete-1',
        startDate: new Date('2024-01-01'),
        is_active: false,
        createdBy: 'user-1',
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

        usecase = new UpdateCoachAthleteUsecase(inversifyMock);
    });

    it('should build', () => {
        expect(usecase).toBeDefined();
    });

    it('should update a coach-athlete link', async () => {
        (coachAthleteRepositoryMock.update as any).mockResolvedValue(updatedLink);

        const result = await usecase.execute(dto);

        expect(coachAthleteRepositoryMock.update).toHaveBeenCalledWith(dto.id, expect.objectContaining({
            is_active: dto.is_active,
        }));
        expect(result).toEqual(updatedLink);
    });

    it('should return null if update fails (returns null)', async () => {
        (coachAthleteRepositoryMock.update as any).mockResolvedValue(null);

        const result = await usecase.execute(dto);

        expect(result).toBeNull();
    });

    it('should log and throw error when repository throws', async () => {
        const error = new Error('DB Error');
        (coachAthleteRepositoryMock.update as any).mockRejectedValue(error);

        await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.UPDATE_COACH_ATHLETE_USECASE);
        expect(loggerMock.error).toHaveBeenCalledWith(expect.stringContaining(error.message));
    });
});
