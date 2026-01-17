import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceAthleteInfoMongo } from '@services/db/mongo/repositories/athlete-info.repository';
import { HardDeleteAthleteInfoUsecase } from '@usecases/athlete/athlete-info/hard-delete.athlete-info.usecase';

interface LoggerMock {
    error: (message: string) => void;
}

describe('HardDeleteAthleteInfoUsecase', () => {
    let inversifyMock: MockProxy<Inversify>;
    let bddServiceMock: MockProxy<BddServiceMongo>;
    let repositoryMock: MockProxy<BddServiceAthleteInfoMongo>;
    let loggerMock: MockProxy<LoggerMock>;
    let usecase: HardDeleteAthleteInfoUsecase;

    beforeEach(() => {
        inversifyMock = mock<Inversify>();
        bddServiceMock = mock<BddServiceMongo>();
        repositoryMock = mock<BddServiceAthleteInfoMongo>();
        loggerMock = mock<LoggerMock>();

        (bddServiceMock as unknown as { athleteInfo: BddServiceAthleteInfoMongo }).athleteInfo = repositoryMock;
        inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
        inversifyMock.loggerService = loggerMock;

        usecase = new HardDeleteAthleteInfoUsecase(inversifyMock);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should build', () => {
        expect(usecase).toBeDefined();
    });

    it('should hard delete athlete info when user is admin', async () => {
        (repositoryMock.hardDelete as any).mockResolvedValue(true);

        const result = await usecase.execute({
            id: 'info-1',
            session: { userId: 'admin-1', role: Role.ADMIN },
        });

        expect(repositoryMock.hardDelete).toHaveBeenCalledWith('info-1');
        expect(result).toBe(true);
    });

    it('should not enforce role-based authorization in the use case', async () => {
        (repositoryMock.hardDelete as any).mockResolvedValue(true);

        const result = await usecase.execute({
            id: 'info-1',
            session: { userId: 'coach-1', role: Role.COACH },
        });

        expect(repositoryMock.hardDelete).toHaveBeenCalledWith('info-1');
        expect(result).toBe(true);
    });

    it('should return false when hard delete fails', async () => {
        (repositoryMock.hardDelete as any).mockResolvedValue(false);

        const result = await usecase.execute({
            id: 'info-999',
            session: { userId: 'admin-1', role: Role.ADMIN },
        });

        expect(result).toBe(false);
    });

    it('should log and throw when repository hard delete fails', async () => {
        const failure = new Error('hard delete failure');
        (repositoryMock.hardDelete as any).mockRejectedValue(failure);

        await expect(usecase.execute({
            id: 'info-1',
            session: { userId: 'admin-1', role: Role.ADMIN },
        })).rejects.toThrow(ERRORS.HARD_DELETE_ATHLETE_INFO_USECASE);
        expect(loggerMock.error).toHaveBeenCalledWith(`HardDeleteAthleteInfoUsecase#execute => ${failure.message}`);
    });
});
