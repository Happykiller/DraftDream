import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceProspectMongo } from '@services/db/mongo/repositories/prospect/prospect.repository';
import { GetProspectUsecase } from '@usecases/prospect/prospect/get.prospect.usecase';
import { Prospect } from '@services/db/models/prospect/prospect.model';
import { ProspectStatus } from '@src/common/prospect-status.enum';

interface LoggerMock {
    error: (message: string) => void;
}

describe('GetProspectUsecase', () => {
    let inversifyMock: MockProxy<Inversify>;
    let bddServiceMock: MockProxy<BddServiceMongo>;
    let repositoryMock: MockProxy<BddServiceProspectMongo>;
    let loggerMock: MockProxy<LoggerMock>;
    let usecase: GetProspectUsecase;

    const now = new Date('2024-02-10T12:00:00.000Z');
    const prospect: Prospect = {
        id: 'prospect-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        status: ProspectStatus.LEAD,
        createdBy: 'user-1',
        workflowHistory: [{ status: 'create', date: now }],
        createdAt: now,
        updatedAt: now,
        objectiveIds: [],
        activityPreferenceIds: []
    };

    beforeEach(() => {
        inversifyMock = mock<Inversify>();
        bddServiceMock = mock<BddServiceMongo>();
        repositoryMock = mock<BddServiceProspectMongo>();
        loggerMock = mock<LoggerMock>();

        (bddServiceMock as unknown as { prospect: BddServiceProspectMongo }).prospect = repositoryMock;
        inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
        inversifyMock.loggerService = loggerMock;

        usecase = new GetProspectUsecase(inversifyMock);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should build', () => {
        expect(usecase).toBeDefined();
    });

    it('should get a prospect when user is admin', async () => {
        (repositoryMock.get as any).mockResolvedValue(prospect);

        const result = await usecase.execute({
            id: 'prospect-1',
            session: { userId: 'admin-1', role: Role.ADMIN },
        });

        expect(repositoryMock.get).toHaveBeenCalledWith({ id: 'prospect-1' });
        expect(result).toEqual(prospect);
    });

    it('should get a prospect when user is the creator', async () => {
        (repositoryMock.get as any).mockResolvedValue(prospect);

        const result = await usecase.execute({
            id: 'prospect-1',
            session: { userId: 'user-1', role: Role.COACH },
        });

        expect(result).toEqual(prospect);
    });

    it('should return null when user is not admin and not the creator', async () => {
        (repositoryMock.get as any).mockResolvedValue(prospect);

        const result = await usecase.execute({
            id: 'prospect-1',
            session: { userId: 'other-user', role: Role.COACH },
        });

        expect(result).toBeNull();
    });

    it('should return null when prospect not found', async () => {
        (repositoryMock.get as any).mockResolvedValue(null);

        const result = await usecase.execute({
            id: 'prospect-999',
            session: { userId: 'admin-1', role: Role.ADMIN },
        });

        expect(result).toBeNull();
    });

    it('should log and throw when repository get fails', async () => {
        const failure = new Error('get failure');
        (repositoryMock.get as any).mockRejectedValue(failure);

        await expect(usecase.execute({
            id: 'prospect-1',
            session: { userId: 'admin-1', role: Role.ADMIN },
        })).rejects.toThrow(ERRORS.GET_PROSPECT_USECASE);
        expect(loggerMock.error).toHaveBeenCalledWith(`GetProspectUsecase#execute => ${failure.message}`);
    });
});
