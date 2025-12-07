import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceProspectMongo } from '@services/db/mongo/repositories/prospect/prospect.repository';
import { CreateProspectUsecase } from '@usecases/prospect/prospect/create.prospect.usecase';
import { CreateProspectDto } from '@services/db/dtos/prospect/prospect.dto';
import { Prospect } from '@services/db/models/prospect/prospect.model';
import { ProspectStatus } from '@src/common/prospect-status.enum';

interface LoggerMock {
    error: (message: string) => void;
}

describe('CreateProspectUsecase', () => {
    let inversifyMock: MockProxy<Inversify>;
    let bddServiceMock: MockProxy<BddServiceMongo>;
    let repositoryMock: MockProxy<BddServiceProspectMongo>;
    let loggerMock: MockProxy<LoggerMock>;
    let usecase: CreateProspectUsecase;

    const now = new Date('2024-02-10T12:00:00.000Z');
    const dto: CreateProspectDto = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        status: ProspectStatus.LEAD,
        levelId: 'level-1',
        objectiveIds: ['obj-1', 'obj-2'],
        activityPreferenceIds: ['act-1'],
        medicalConditions: 'None',
        allergies: 'None',
        notes: 'Test notes',
        sourceId: 'source-1',
        budget: 1000,
        dealDescription: 'Test deal',
        desiredStartDate: now,
        createdBy: 'admin-1',
    };

    const prospect: Prospect = {
        id: 'prospect-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        status: ProspectStatus.LEAD,
        levelId: 'level-1',
        objectiveIds: ['obj-1', 'obj-2'],
        activityPreferenceIds: ['act-1'],
        medicalConditions: 'None',
        allergies: 'None',
        notes: 'Test notes',
        sourceId: 'source-1',
        budget: 1000,
        dealDescription: 'Test deal',
        desiredStartDate: now,
        createdBy: 'admin-1',
        workflowHistory: [{ status: 'create', date: now }],
        createdAt: now,
        updatedAt: now,
    };

    beforeEach(() => {
        inversifyMock = mock<Inversify>();
        bddServiceMock = mock<BddServiceMongo>();
        repositoryMock = mock<BddServiceProspectMongo>();
        loggerMock = mock<LoggerMock>();

        (bddServiceMock as unknown as { prospect: BddServiceProspectMongo }).prospect = repositoryMock;
        inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
        inversifyMock.loggerService = loggerMock;

        usecase = new CreateProspectUsecase(inversifyMock);
    });



    it('should build', () => {
        expect(usecase).toBeDefined();
    });

    it('should create a prospect with all fields', async () => {
        repositoryMock.create.mockResolvedValue(prospect);

        const result = await usecase.execute(dto);

        expect(repositoryMock.create).toHaveBeenCalledWith({
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            phone: dto.phone,
            status: dto.status,
            levelId: dto.levelId,
            objectiveIds: dto.objectiveIds,
            activityPreferenceIds: dto.activityPreferenceIds,
            medicalConditions: dto.medicalConditions,
            allergies: dto.allergies,
            notes: dto.notes,
            sourceId: dto.sourceId,
            budget: dto.budget,
            dealDescription: dto.dealDescription,
            desiredStartDate: dto.desiredStartDate,
            createdBy: dto.createdBy,
            workflowHistory: [{ status: 'create', date: expect.any(Date) }],
        });
        expect(result).toEqual(prospect);
    });

    it('should create a prospect with minimal fields', async () => {
        const minimalDto: CreateProspectDto = {
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
            createdBy: 'admin-1',
        };

        const minimalProspect: Prospect = {
            id: 'prospect-2',
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane@example.com',
            createdBy: 'admin-1',
            objectiveIds: [],
            activityPreferenceIds: [],
            workflowHistory: [{ status: 'create', date: now }],
            createdAt: now,
            updatedAt: now,
        };

        repositoryMock.create.mockResolvedValue(minimalProspect);

        const result = await usecase.execute(minimalDto);

        expect(repositoryMock.create).toHaveBeenCalled();
        expect(result).toEqual(minimalProspect);
    });

    it('should auto-initialize workflowHistory when not provided', async () => {
        repositoryMock.create.mockResolvedValue(prospect);

        await usecase.execute(dto);

        expect(repositoryMock.create).toHaveBeenCalledWith(
            expect.objectContaining({
                workflowHistory: [{ status: 'create', date: expect.any(Date) }],
            })
        );
    });

    it('should return null when repository creation returns null', async () => {
        repositoryMock.create.mockResolvedValue(null);

        const result = await usecase.execute(dto);

        expect(result).toBeNull();
    });

    it('should log and throw when repository creation fails', async () => {
        const failure = new Error('create failure');
        repositoryMock.create.mockRejectedValue(failure);

        await expect(usecase.execute(dto)).rejects.toThrow(ERRORS.CREATE_PROSPECT_USECASE);
        expect(loggerMock.error).toHaveBeenCalledWith(`CreateProspectUsecase#execute => ${failure.message}`);
    });
});
