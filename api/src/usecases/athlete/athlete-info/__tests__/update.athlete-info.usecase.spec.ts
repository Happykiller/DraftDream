import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceAthleteInfoMongo } from '@services/db/mongo/repositories/athlete-info.repository';
import { BddServiceUserMongo } from '@services/db/mongo/repositories/user.repository';
import { BddServiceCoachAthleteMongo } from '@services/db/mongo/repositories/coach-athlete.repository';
import { UpdateAthleteInfoUsecase } from '@usecases/athlete/athlete-info/update.athlete-info.usecase';
import { AthleteInfoUsecaseModel } from '@usecases/athlete/athlete-info/athlete-info.usecase.model';
import { User } from '@services/db/models/user.model';

interface LoggerMock {
    error: (message: string) => void;
}

describe('UpdateAthleteInfoUsecase', () => {
    let inversifyMock: MockProxy<Inversify>;
    let bddServiceMock: MockProxy<BddServiceMongo>;
    let athleteInfoRepositoryMock: MockProxy<BddServiceAthleteInfoMongo>;
    let userRepositoryMock: MockProxy<BddServiceUserMongo>;
    let coachAthleteRepositoryMock: MockProxy<BddServiceCoachAthleteMongo>;
    let loggerMock: MockProxy<LoggerMock>;
    let usecase: UpdateAthleteInfoUsecase;

    const existingInfo: AthleteInfoUsecaseModel = {
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

    const athleteUser: User = {
        id: 'athlete-2',
        email: 'athlete2@example.com',
        type: 'athlete',
        createdAt: new Date(),
        updatedAt: new Date(),
        first_name: '',
        last_name: '',
        is_active: false,
        createdBy: ''
    };

    beforeEach(() => {
        inversifyMock = mock<Inversify>();
        bddServiceMock = mock<BddServiceMongo>();
        athleteInfoRepositoryMock = mock<BddServiceAthleteInfoMongo>();
        userRepositoryMock = mock<BddServiceUserMongo>();
        coachAthleteRepositoryMock = mock<BddServiceCoachAthleteMongo>();
        loggerMock = mock<LoggerMock>();

        (bddServiceMock as unknown as { athleteInfo: BddServiceAthleteInfoMongo }).athleteInfo = athleteInfoRepositoryMock;
        (bddServiceMock as unknown as { user: BddServiceUserMongo }).user = userRepositoryMock;
        (bddServiceMock as unknown as { coachAthlete: BddServiceCoachAthleteMongo }).coachAthlete = coachAthleteRepositoryMock;
        inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
        inversifyMock.loggerService = loggerMock;

        // Default mock for coachAthlete
        (coachAthleteRepositoryMock.list as any).mockResolvedValue({ items: [], total: 0, page: 1, limit: 10 });

        usecase = new UpdateAthleteInfoUsecase(inversifyMock);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should build', () => {
        expect(usecase).toBeDefined();
    });

    it('should update athlete info when user is admin', async () => {
        const updatedInfo = { ...existingInfo, notes: 'Updated notes' };
        (athleteInfoRepositoryMock.get as any).mockResolvedValue(existingInfo);
        (athleteInfoRepositoryMock.update as any).mockResolvedValue(updatedInfo);

        const result = await usecase.execute({
            id: 'info-1',
            notes: 'Updated notes',
            session: { userId: 'admin-1', role: Role.ADMIN },
        });

        expect(athleteInfoRepositoryMock.get).toHaveBeenCalledWith({ id: 'info-1' });
        expect(athleteInfoRepositoryMock.update).toHaveBeenCalled();
        expect(result).toEqual(updatedInfo);
    });

    it('should update athlete info when user is the creator', async () => {
        const updatedInfo = { ...existingInfo, notes: 'Updated notes' };
        (athleteInfoRepositoryMock.get as any).mockResolvedValue(existingInfo);
        (athleteInfoRepositoryMock.update as any).mockResolvedValue(updatedInfo);
        (coachAthleteRepositoryMock.list as any).mockResolvedValue({ items: [{ athleteId: 'athlete-1' }], total: 1 });

        const result = await usecase.execute({
            id: 'info-1',
            notes: 'Updated notes',
            session: { userId: 'coach-1', role: Role.COACH },
        });

        expect(result).toEqual(updatedInfo);
    });

    it('should return null when user is not admin and not the creator', async () => {
        (athleteInfoRepositoryMock.get as any).mockResolvedValue(existingInfo);

        const result = await usecase.execute({
            id: 'info-1',
            notes: 'Updated notes',
            session: { userId: 'other-user', role: Role.COACH },
        });

        expect(result).toBeNull();
        expect(athleteInfoRepositoryMock.update).not.toHaveBeenCalled();
    });

    it('should validate new userId is an athlete when userId changes', async () => {
        (userRepositoryMock.getUser as any).mockResolvedValue(athleteUser);
        (athleteInfoRepositoryMock.get as any).mockResolvedValue(existingInfo);
        (athleteInfoRepositoryMock.update as any).mockResolvedValue({ ...existingInfo, userId: 'athlete-2' });

        await usecase.execute({
            id: 'info-1',
            userId: 'athlete-2',
            session: { userId: 'admin-1', role: Role.ADMIN },
        });

        expect(userRepositoryMock.getUser).toHaveBeenCalledWith({ id: 'athlete-2' });
    });

    it('should throw TARGET_NOT_ATHLETE when new userId is not an athlete', async () => {
        const coachUser: User = {
            id: 'coach-2',
            email: 'coach2@example.com',
            type: 'coach',
            createdAt: new Date(),
            updatedAt: new Date(),
            first_name: '',
            last_name: '',
            is_active: false,
            createdBy: ''
        };
        (userRepositoryMock.getUser as any).mockResolvedValue(coachUser);
        (athleteInfoRepositoryMock.get as any).mockResolvedValue(existingInfo);

        await expect(usecase.execute({
            id: 'info-1',
            userId: 'coach-2',
            session: { userId: 'admin-1', role: Role.ADMIN },
        })).rejects.toThrow(ERRORS.TARGET_NOT_ATHLETE);
    });

    it('should return null when athlete info not found', async () => {
        (athleteInfoRepositoryMock.get as any).mockResolvedValue(null);

        const result = await usecase.execute({
            id: 'info-999',
            notes: 'Updated notes',
            session: { userId: 'admin-1', role: Role.ADMIN },
        });

        expect(result).toBeNull();
    });

    it('should log and throw when repository update fails', async () => {
        const failure = new Error('update failure');
        (athleteInfoRepositoryMock.get as any).mockResolvedValue(existingInfo);
        (athleteInfoRepositoryMock.update as any).mockRejectedValue(failure);

        await expect(usecase.execute({
            id: 'info-1',
            notes: 'Updated notes',
            session: { userId: 'admin-1', role: Role.ADMIN },
        })).rejects.toThrow(ERRORS.UPDATE_ATHLETE_INFO_USECASE);
        expect(loggerMock.error).toHaveBeenCalledWith(`UpdateAthleteInfoUsecase#execute => ${failure.message}`);
    });
});
