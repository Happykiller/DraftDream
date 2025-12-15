import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceAthleteInfoMongo } from '@services/db/mongo/repositories/athlete-info.repository';
import { DeleteAthleteInfoUsecase } from '@usecases/athlete/athlete-info/delete.athlete-info.usecase';
import { AthleteInfoUsecaseModel } from '@usecases/athlete/athlete-info/athlete-info.usecase.model';

interface LoggerMock {
    error: (message: string) => void;
}

describe('DeleteAthleteInfoUsecase', () => {
    let inversifyMock: MockProxy<Inversify>;
    let bddServiceMock: MockProxy<BddServiceMongo>;
    let repositoryMock: MockProxy<BddServiceAthleteInfoMongo>;
    let loggerMock: MockProxy<LoggerMock>;
    let usecase: DeleteAthleteInfoUsecase;

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

    beforeEach(() => {
        inversifyMock = mock<Inversify>();
        bddServiceMock = mock<BddServiceMongo>();
        repositoryMock = mock<BddServiceAthleteInfoMongo>();
        loggerMock = mock<LoggerMock>();

        (bddServiceMock as unknown as { athleteInfo: BddServiceAthleteInfoMongo }).athleteInfo = repositoryMock;
        inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
        inversifyMock.loggerService = loggerMock;

        usecase = new DeleteAthleteInfoUsecase(inversifyMock);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should build', () => {
        expect(usecase).toBeDefined();
    });

    it('should soft delete athlete info when user is admin', async () => {
        (repositoryMock.get as any).mockResolvedValue(existingInfo);
        (repositoryMock.delete as any).mockResolvedValue(true);

        const result = await usecase.execute({
            id: 'info-1',
            session: { userId: 'admin-1', role: Role.ADMIN },
        });

        expect(repositoryMock.get).toHaveBeenCalledWith({ id: 'info-1' });
        expect(repositoryMock.delete).toHaveBeenCalledWith('info-1');
        expect(result).toBe(true);
    });

    it('should soft delete athlete info when user is the creator', async () => {
        (repositoryMock.get as any).mockResolvedValue(existingInfo);
        (repositoryMock.delete as any).mockResolvedValue(true);

        const result = await usecase.execute({
            id: 'info-1',
            session: { userId: 'coach-1', role: Role.COACH },
        });

        expect(result).toBe(true);
    });

    it('should return false when user is not admin and not the creator', async () => {
        (repositoryMock.get as any).mockResolvedValue(existingInfo);

        const result = await usecase.execute({
            id: 'info-1',
            session: { userId: 'other-user', role: Role.COACH },
        });

        expect(result).toBe(false);
        expect(repositoryMock.delete).not.toHaveBeenCalled();
    });

    it('should return false when athlete info not found', async () => {
        (repositoryMock.get as any).mockResolvedValue(null);

        const result = await usecase.execute({
            id: 'info-999',
            session: { userId: 'admin-1', role: Role.ADMIN },
        });

        expect(result).toBe(false);
        expect(repositoryMock.delete).not.toHaveBeenCalled();
    });

    it('should log and throw when repository delete fails', async () => {
        const failure = new Error('delete failure');
        (repositoryMock.get as any).mockResolvedValue(existingInfo);
        (repositoryMock.delete as any).mockRejectedValue(failure);

        await expect(usecase.execute({
            id: 'info-1',
            session: { userId: 'admin-1', role: Role.ADMIN },
        })).rejects.toThrow(ERRORS.DELETE_ATHLETE_INFO_USECASE);
        expect(loggerMock.error).toHaveBeenCalledWith(`DeleteAthleteInfoUsecase#execute => ${failure.message}`);
    });
});
