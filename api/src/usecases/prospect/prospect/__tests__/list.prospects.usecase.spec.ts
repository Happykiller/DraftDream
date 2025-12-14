import { beforeEach, describe, expect, it, afterEach, jest } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceProspectMongo } from '@services/db/mongo/repositories/prospect/prospect.repository';
import { BddServiceUserMongo } from '@services/db/mongo/repositories/user.repository';
import { BddServiceCoachAthleteMongo } from '@services/db/mongo/repositories/coach-athlete.repository';
import { ListProspectsUsecase } from '@usecases/prospect/prospect/list.prospects.usecase';
import { Prospect } from '@services/db/models/prospect/prospect.model';
import { ProspectStatus } from '@src/common/prospect-status.enum';

interface LoggerMock {
    error: (message: string) => void;
}

describe('ListProspectsUsecase', () => {
    let inversifyMock: MockProxy<Inversify>;
    let bddServiceMock: MockProxy<BddServiceMongo>;
    let repositoryMock: MockProxy<BddServiceProspectMongo>;
    let loggerMock: MockProxy<LoggerMock>;
    let usecase: ListProspectsUsecase;

    const now = new Date('2024-02-10T12:00:00.000Z');
    const prospects: Prospect[] = [
        {
            id: 'prospect-1',
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            status: ProspectStatus.LEAD,
            createdBy: 'user-1',
            workflowHistory: [{ status: 'create', date: now }],
            createdAt: now,
            updatedAt: now,
            objectiveIds: [],
            activityPreferenceIds: []
        },
        {
            id: 'prospect-2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
            status: ProspectStatus.CONTACTED,
            createdBy: 'user-1',
            workflowHistory: [{ status: 'create', date: now }],
            createdAt: now,
            updatedAt: now,
            objectiveIds: [],
            activityPreferenceIds: []
        },
    ];

    beforeEach(() => {
        inversifyMock = mock<Inversify>();
        bddServiceMock = mock<BddServiceMongo>();
        repositoryMock = mock<BddServiceProspectMongo>();
        loggerMock = mock<LoggerMock>();

        (bddServiceMock as unknown as { prospect: BddServiceProspectMongo }).prospect = repositoryMock;
        (bddServiceMock as unknown as { user: BddServiceUserMongo }).user = mock<BddServiceUserMongo>();
        (bddServiceMock as unknown as { coachAthlete: BddServiceCoachAthleteMongo }).coachAthlete = mock<BddServiceCoachAthleteMongo>();
        inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
        inversifyMock.loggerService = loggerMock;

        usecase = new ListProspectsUsecase(inversifyMock);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should build', () => {
        expect(usecase).toBeDefined();
    });

    it('should list prospects for admin with all filters', async () => {
        repositoryMock.list.mockResolvedValue({
            items: prospects,
            total: 2,
            page: 1,
            limit: 10,
        });

        const result = await usecase.execute({
            q: 'john',
            status: ProspectStatus.LEAD,
            levelId: 'level-1',
            sourceId: 'source-1',
            createdBy: 'user-1',
            limit: 10,
            page: 1,
            session: { userId: 'admin-1', role: Role.ADMIN },
        });

        expect(repositoryMock.list).toHaveBeenCalledWith({
            q: 'john',
            status: ProspectStatus.LEAD,
            levelId: 'level-1',
            sourceId: 'source-1',
            createdBy: 'user-1',
            limit: 10,
            page: 1,
        });
        expect(result.items).toHaveLength(2);
        expect(result.total).toBe(2);
    });

    it('should list prospects for coach filtering by their userId', async () => {
        repositoryMock.list.mockResolvedValue({
            items: prospects,
            total: 2,
            page: 1,
            limit: 10,
        });

        const result = await usecase.execute({
            limit: 10,
            page: 1,
            session: { userId: 'coach-1', role: Role.COACH },
        });

        expect(repositoryMock.list).toHaveBeenCalledWith({
            q: undefined,
            status: undefined,
            levelId: undefined,
            sourceId: undefined,
            createdBy: 'coach-1',
            limit: 10,
            page: 1,
        });
        expect(result.items).toHaveLength(2);
    });

    it('should list prospects with pagination', async () => {
        repositoryMock.list.mockResolvedValue({
            items: [prospects[0]],
            total: 2,
            page: 2,
            limit: 1,
        });

        const result = await usecase.execute({
            limit: 1,
            page: 2,
            session: { userId: 'admin-1', role: Role.ADMIN },
        });

        expect(result.items).toHaveLength(1);
        expect(result.page).toBe(2);
        expect(result.limit).toBe(1);
        expect(result.total).toBe(2);
    });

    it('should log and throw when repository list fails', async () => {
        const failure = new Error('list failure');
        repositoryMock.list.mockRejectedValue(failure);

        await expect(usecase.execute({
            session: { userId: 'admin-1', role: Role.ADMIN },
        })).rejects.toThrow(ERRORS.LIST_PROSPECTS_USECASE);
        expect(loggerMock.error).toHaveBeenCalledWith(`ListProspectsUsecase#execute => ${failure.message}`);
    });
});
