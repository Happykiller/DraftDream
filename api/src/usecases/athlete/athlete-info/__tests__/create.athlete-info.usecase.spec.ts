import { beforeEach, describe, expect, it, afterEach, jest } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceAthleteInfoMongo } from '@services/db/mongo/repositories/athlete-info.repository';
import { BddServiceUserMongo } from '@services/db/mongo/repositories/user.repository';
import { CreateAthleteInfoUsecase } from '@usecases/athlete/athlete-info/create.athlete-info.usecase';
import { CreateAthleteInfoUsecaseDto } from '@usecases/athlete/athlete-info/athlete-info.usecase.dto';
import { AthleteInfoUsecaseModel } from '@usecases/athlete/athlete-info/athlete-info.usecase.model';
import { User } from '@services/db/models/user.model';

interface LoggerMock {
    error: (message: string) => void;
}

describe('CreateAthleteInfoUsecase', () => {
    let inversifyMock: MockProxy<Inversify>;
    let bddServiceMock: MockProxy<BddServiceMongo>;
    let athleteInfoRepositoryMock: MockProxy<BddServiceAthleteInfoMongo>;
    let userRepositoryMock: MockProxy<BddServiceUserMongo>;
    let loggerMock: MockProxy<LoggerMock>;
    let usecase: CreateAthleteInfoUsecase;

    const athleteUser: User = {
        id: 'athlete-1',
        email: 'athlete@example.com',
        type: 'athlete',
        createdAt: new Date(),
        updatedAt: new Date(),
        first_name: '',
        last_name: '',
        is_active: false,
        createdBy: ''
    };

    const dto: CreateAthleteInfoUsecaseDto = {
        userId: 'athlete-1',
        levelId: 'level-1',
        objectiveIds: ['obj-1', 'obj-2'],
        activityPreferenceIds: ['act-1'],
        medicalConditions: 'None',
        allergies: 'None',
        notes: 'Test notes',
        session: { userId: 'admin-1', role: Role.ADMIN },
    };

    const createdInfo: AthleteInfoUsecaseModel = {
        id: 'info-1',
        userId: 'athlete-1',
        levelId: 'level-1',
        objectiveIds: ['obj-1', 'obj-2'],
        activityPreferenceIds: ['act-1'],
        medicalConditions: 'None',
        allergies: 'None',
        notes: 'Test notes',
        createdBy: 'admin-1',
        createdAt: new Date(),
        updatedAt: new Date(),
        schemaVersion: 0
    };

    beforeEach(() => {
        inversifyMock = mock<Inversify>();
        bddServiceMock = mock<BddServiceMongo>();
        athleteInfoRepositoryMock = mock<BddServiceAthleteInfoMongo>();
        userRepositoryMock = mock<BddServiceUserMongo>();
        loggerMock = mock<LoggerMock>();

        (bddServiceMock as unknown as { athleteInfo: BddServiceAthleteInfoMongo }).athleteInfo = athleteInfoRepositoryMock;
        (bddServiceMock as unknown as { user: BddServiceUserMongo }).user = userRepositoryMock;
        inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
        inversifyMock.loggerService = loggerMock;

        usecase = new CreateAthleteInfoUsecase(inversifyMock);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should build', () => {
        expect(usecase).toBeDefined();
    });

    it('should create athlete info when user is admin', async () => {
        userRepositoryMock.getUser.mockResolvedValue(athleteUser);
        athleteInfoRepositoryMock.create.mockResolvedValue(createdInfo);

        const result = await usecase.execute(dto);

        expect(userRepositoryMock.getUser).toHaveBeenCalledWith({ id: 'athlete-1' });
        expect(athleteInfoRepositoryMock.create).toHaveBeenCalledWith({
            userId: 'athlete-1',
            levelId: 'level-1',
            objectiveIds: ['obj-1', 'obj-2'],
            activityPreferenceIds: ['act-1'],
            medicalConditions: 'None',
            allergies: 'None',
            notes: 'Test notes',
            createdBy: 'admin-1',
        });
        expect(result).toEqual(createdInfo);
    });

    it('should create athlete info when athlete creates for self', async () => {
        const selfDto = {
            ...dto,
            session: { userId: 'athlete-1', role: Role.ATHLETE },
        };
        userRepositoryMock.getUser.mockResolvedValue(athleteUser);
        athleteInfoRepositoryMock.create.mockResolvedValue(createdInfo);

        const result = await usecase.execute(selfDto);

        expect(result).toEqual(createdInfo);
    });

    it('should throw FORBIDDEN when athlete creates for another user', async () => {
        const forbiddenDto = {
            ...dto,
            userId: 'other-athlete',
            session: { userId: 'athlete-1', role: Role.ATHLETE },
        };

        await expect(usecase.execute(forbiddenDto)).rejects.toThrow(ERRORS.FORBIDDEN);
        expect(userRepositoryMock.getUser).not.toHaveBeenCalled();
    });

    it('should throw USER_NOT_FOUND when user does not exist', async () => {
        userRepositoryMock.getUser.mockResolvedValue(null);

        await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.USER_NOT_FOUND);
        expect(athleteInfoRepositoryMock.create).not.toHaveBeenCalled();
    });

    it('should throw TARGET_NOT_ATHLETE when user is not an athlete', async () => {
        const coachUser: User = {
            id: 'coach-1',
            email: 'coach@example.com',
            type: 'coach',
            createdAt: new Date(),
            updatedAt: new Date(),
            first_name: '',
            last_name: '',
            is_active: false,
            createdBy: ''
        };
        userRepositoryMock.getUser.mockResolvedValue(coachUser);

        await expect(usecase.execute({ ...dto, userId: 'coach-1' })).rejects.toThrow(ERRORS.TARGET_NOT_ATHLETE);
        expect(athleteInfoRepositoryMock.create).not.toHaveBeenCalled();
    });

    it('should return null when repository creation returns null', async () => {
        userRepositoryMock.getUser.mockResolvedValue(athleteUser);
        athleteInfoRepositoryMock.create.mockResolvedValue(null);

        const result = await usecase.execute(dto);

        expect(result).toBeNull();
    });

    it('should log and throw when repository creation fails', async () => {
        const failure = new Error('create failure');
        userRepositoryMock.getUser.mockResolvedValue(athleteUser);
        athleteInfoRepositoryMock.create.mockRejectedValue(failure);

        await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.CREATE_ATHLETE_INFO_USECASE);
        expect(loggerMock.error).toHaveBeenCalledWith(`CreateAthleteInfoUsecase#execute => ${failure.message}`);
    });
});
