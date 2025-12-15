import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceCoachAthleteMongo } from '@services/db/mongo/repositories/coach-athlete.repository';
import { DeleteCoachAthleteUsecase } from '@src/usecases/athlete/coach-athlete/delete.coach-athlete.usecase';
import { DeleteCoachAthleteUsecaseDto } from '@src/usecases/athlete/coach-athlete/coach-athlete.usecase.dto';

interface LoggerMock {
    error: (message: string) => void;
}

describe('DeleteCoachAthleteUsecase', () => {
    let inversifyMock: MockProxy<Inversify>;
    let bddServiceMock: MockProxy<BddServiceMongo>;
    let coachAthleteRepositoryMock: MockProxy<BddServiceCoachAthleteMongo>;
    let loggerMock: MockProxy<LoggerMock>;
    let usecase: DeleteCoachAthleteUsecase;

    const dto: DeleteCoachAthleteUsecaseDto = {
        id: 'link-1',
    };

    beforeEach(() => {
        inversifyMock = mock<Inversify>();
        bddServiceMock = mock<BddServiceMongo>();
        coachAthleteRepositoryMock = mock<BddServiceCoachAthleteMongo>();
        loggerMock = mock<LoggerMock>();

        (bddServiceMock as unknown as { coachAthlete: BddServiceCoachAthleteMongo }).coachAthlete = coachAthleteRepositoryMock;
        inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
        inversifyMock.loggerService = loggerMock;

        usecase = new DeleteCoachAthleteUsecase(inversifyMock);
    });

    it('should build', () => {
        expect(usecase).toBeDefined();
    });

    it('should delete a coach-athlete link', async () => {
        (coachAthleteRepositoryMock.delete as any).mockResolvedValue(true);

        const result = await usecase.execute(dto);

        expect(coachAthleteRepositoryMock.delete).toHaveBeenCalledWith(dto.id);
        expect(result).toBe(true);
    });

    it('should return false if deletion fails', async () => {
        (coachAthleteRepositoryMock.delete as any).mockResolvedValue(false);

        const result = await usecase.execute(dto);

        expect(result).toBe(false);
    });

    it('should log and throw error when repository throws', async () => {
        const error = new Error('DB Error');
        (coachAthleteRepositoryMock.delete as any).mockRejectedValue(error);

        await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.DELETE_COACH_ATHLETE_USECASE);
        expect(loggerMock.error).toHaveBeenCalledWith(expect.stringContaining(error.message));
    });
});
