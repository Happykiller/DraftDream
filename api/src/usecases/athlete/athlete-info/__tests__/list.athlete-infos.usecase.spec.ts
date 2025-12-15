import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceAthleteInfoMongo } from '@services/db/mongo/repositories/athlete-info.repository';
import { ListAthleteInfosUsecase } from '@usecases/athlete/athlete-info/list.athlete-infos.usecase';
import { AthleteInfoUsecaseModel } from '@usecases/athlete/athlete-info/athlete-info.usecase.model';

interface LoggerMock {
    error: (message: string) => void;
}

describe('ListAthleteInfosUsecase', () => {
    let inversifyMock: MockProxy<Inversify>;
    let bddServiceMock: MockProxy<BddServiceMongo>;
    let repositoryMock: MockProxy<BddServiceAthleteInfoMongo>;
    let loggerMock: MockProxy<LoggerMock>;
    let usecase: ListAthleteInfosUsecase;

    const athleteInfos: AthleteInfoUsecaseModel[] = [
        {
            id: 'info-1',
            userId: 'athlete-1',
            levelId: 'level-1',
            createdBy: 'coach-1',
            createdAt: new Date(),
            updatedAt: new Date(),
            objectiveIds: [],
            activityPreferenceIds: [],
            schemaVersion: 0
        },
        {
            id: 'info-2',
            userId: 'athlete-2',
            levelId: 'level-2',
            createdBy: 'coach-1',
            createdAt: new Date(),
            updatedAt: new Date(),
            objectiveIds: [],
            activityPreferenceIds: [],
            schemaVersion: 0
        },
    ];

    beforeEach(() => {
        inversifyMock = mock<Inversify>();
        bddServiceMock = mock<BddServiceMongo>();
        repositoryMock = mock<BddServiceAthleteInfoMongo>();
        loggerMock = mock<LoggerMock>();

        (bddServiceMock as unknown as { athleteInfo: BddServiceAthleteInfoMongo }).athleteInfo = repositoryMock;
        inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
        inversifyMock.loggerService = loggerMock;

        usecase = new ListAthleteInfosUsecase(inversifyMock);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should build', () => {
        expect(usecase).toBeDefined();
    });

    it('should list athlete infos for admin with all filters', async () => {
        (repositoryMock.list as any).mockResolvedValue({
            items: athleteInfos,
            total: 2,
            page: 1,
            limit: 10,
        });

        const result = await usecase.execute({
            userId: 'athlete-1',
            createdBy: 'coach-1',
            includeArchived: true,
            limit: 10,
            page: 1,
            session: { userId: 'admin-1', role: Role.ADMIN },
        });

        expect(repositoryMock.list).toHaveBeenCalledWith({
            userId: 'athlete-1',
            createdBy: 'coach-1',
            includeArchived: true,
            limit: 10,
            page: 1,
        });
        expect(result.items).toHaveLength(2);
        expect(result.total).toBe(2);
    });

    it('should list athlete infos for coach filtering by their userId', async () => {
        (repositoryMock.list as any).mockResolvedValue({
            items: athleteInfos,
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
            userId: undefined,
            createdBy: 'coach-1',
            includeArchived: false,
            limit: 10,
            page: 1,
        });
        expect(result.items).toHaveLength(2);
    });

    it('should log and throw when repository list fails', async () => {
        const failure = new Error('list failure');
        (repositoryMock.list as any).mockRejectedValue(failure);

        await expect(usecase.execute({
            session: { userId: 'admin-1', role: Role.ADMIN },
        })).rejects.toThrow(ERRORS.LIST_ATHLETE_INFOS_USECASE);
        expect(loggerMock.error).toHaveBeenCalledWith(`ListAthleteInfosUsecase#execute => ${failure.message}`);
    });
});
