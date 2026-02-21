import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceAthleteInfoMongo } from '@services/db/mongo/repositories/athlete-info.repository';
import { BddServiceCoachAthleteMongo } from '@services/db/mongo/repositories/coach-athlete.repository';
import { ResolveCoachAthleteVisibilityUsecase } from '@usecases/athlete/coach-athlete/resolve-coach-athlete-visibility.usecase';
import { GetAthleteInfoUsecase } from '@usecases/athlete/athlete-info/get.athlete-info.usecase';
import { AthleteInfoUsecaseModel } from '@usecases/athlete/athlete-info/athlete-info.usecase.model';

interface LoggerMock {
    error: (message: string) => void;
}

describe('GetAthleteInfoUsecase', () => {
    let inversifyMock: MockProxy<Inversify>;
    let bddServiceMock: MockProxy<BddServiceMongo>;
    let repositoryMock: MockProxy<BddServiceAthleteInfoMongo>;
    let coachAthleteRepositoryMock: MockProxy<BddServiceCoachAthleteMongo>;
    let loggerMock: MockProxy<LoggerMock>;
    let resolveCoachAthleteVisibilityUsecaseMock: MockProxy<ResolveCoachAthleteVisibilityUsecase>;
    let usecase: GetAthleteInfoUsecase;

    const athleteInfo: AthleteInfoUsecaseModel = {
        id: 'info-1',
        userId: 'athlete-1',
        levelId: 'level-1',
        createdBy: 'coach-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        objectiveIds: [],
        activityPreferenceIds: [],
        schemaVersion: 0
    };

    beforeEach(() => {
        inversifyMock = mock<Inversify>();
        bddServiceMock = mock<BddServiceMongo>();
        repositoryMock = mock<BddServiceAthleteInfoMongo>();
        coachAthleteRepositoryMock = mock<BddServiceCoachAthleteMongo>();
        loggerMock = mock<LoggerMock>();
        resolveCoachAthleteVisibilityUsecaseMock = mock<ResolveCoachAthleteVisibilityUsecase>();

        (bddServiceMock as unknown as { athleteInfo: BddServiceAthleteInfoMongo }).athleteInfo = repositoryMock;
        (bddServiceMock as unknown as { coachAthlete: BddServiceCoachAthleteMongo }).coachAthlete = coachAthleteRepositoryMock;
        inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
        inversifyMock.loggerService = loggerMock;
        inversifyMock.resolveCoachAthleteVisibilityUsecase = resolveCoachAthleteVisibilityUsecaseMock as unknown as ResolveCoachAthleteVisibilityUsecase;

        // Default mock for coach-athlete visibility
        (resolveCoachAthleteVisibilityUsecaseMock.execute as any).mockResolvedValue(true);
        (coachAthleteRepositoryMock.list as any).mockResolvedValue({ items: [], total: 0, page: 1, limit: 10 });

        usecase = new GetAthleteInfoUsecase(inversifyMock);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should build', () => {
        expect(usecase).toBeDefined();
    });

    it('should get athlete info when user is admin', async () => {
        (repositoryMock.get as any).mockResolvedValue(athleteInfo);

        const result = await usecase.execute({
            id: 'info-1',
            session: { userId: 'admin-1', role: Role.ADMIN },
        });

        expect(repositoryMock.get).toHaveBeenCalledWith({ id: 'info-1' });
        expect(result).toEqual(athleteInfo);
    });

    it('should get athlete info when user is the creator', async () => {
        (repositoryMock.get as any).mockResolvedValue(athleteInfo);
        (coachAthleteRepositoryMock.list as any).mockResolvedValue({ items: [{ athleteId: 'athlete-1' }], total: 1 });

        const result = await usecase.execute({
            id: 'info-1',
            session: { userId: 'coach-1', role: Role.COACH },
        });

        expect(result).toEqual(athleteInfo);
    });

    it('should return null when user is not admin and not the creator', async () => {
        (repositoryMock.get as any).mockResolvedValue(athleteInfo);

        const result = await usecase.execute({
            id: 'info-1',
            session: { userId: 'other-user', role: Role.COACH },
        });

        expect(result).toBeNull();
    });

    it('should return null when athlete info not found', async () => {
        (repositoryMock.get as any).mockResolvedValue(null);

        const result = await usecase.execute({
            id: 'info-999',
            session: { userId: 'admin-1', role: Role.ADMIN },
        });

        expect(result).toBeNull();
    });

    it('should log and throw when repository get fails', async () => {
        const failure = new Error('get failure');
        (repositoryMock.get as any).mockRejectedValue(failure);

        await expect(usecase.execute({
            id: 'info-1',
            session: { userId: 'admin-1', role: Role.ADMIN },
        })).rejects.toThrow(ERRORS.GET_ATHLETE_INFO_USECASE);
        expect(loggerMock.error).toHaveBeenCalledWith(`GetAthleteInfoUsecase#execute => ${failure.message}`);
    });
});
