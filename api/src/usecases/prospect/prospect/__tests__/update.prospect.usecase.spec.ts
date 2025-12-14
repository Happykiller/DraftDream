import { beforeEach, describe, expect, it } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceProspectMongo } from '@services/db/mongo/repositories/prospect/prospect.repository';
import { UpdateProspectUsecase } from '@usecases/prospect/prospect/update.prospect.usecase';
import { Prospect } from '@services/db/models/prospect/prospect.model';
import { ProspectStatus } from '@src/common/prospect-status.enum';

interface LoggerMock {
    error: (message: string) => void;
}

describe('UpdateProspectUsecase', () => {
    let inversifyMock: MockProxy<Inversify>;
    let bddServiceMock: MockProxy<BddServiceMongo>;
    let repositoryMock: MockProxy<BddServiceProspectMongo>;
    let loggerMock: MockProxy<LoggerMock>;
    let usecase: UpdateProspectUsecase;

    const now = new Date('2024-02-10T12:00:00.000Z');
    const existingProspect: Prospect = {
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
    };

    beforeEach(() => {
        inversifyMock = mock<Inversify>();
        bddServiceMock = mock<BddServiceMongo>();
        repositoryMock = mock<BddServiceProspectMongo>();
        loggerMock = mock<LoggerMock>();

        (bddServiceMock as unknown as { prospect: BddServiceProspectMongo }).prospect = repositoryMock;
        inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
        inversifyMock.loggerService = loggerMock;

        usecase = new UpdateProspectUsecase(inversifyMock);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should build', () => {
        expect(usecase).toBeDefined();
    });

    it('should update a prospect successfully', async () => {
        const updatedProspect = { ...existingProspect, firstName: 'Johnny' };
        (repositoryMock.get as any).mockResolvedValue(existingProspect);
        (repositoryMock.update as any).mockResolvedValue(updatedProspect);

        const result = await usecase.execute({
            id: 'prospect-1',
            firstName: 'Johnny',
        });

        expect(repositoryMock.get).toHaveBeenCalledWith({ id: 'prospect-1' });
        expect(repositoryMock.update).toHaveBeenCalled();
        expect(result).toEqual(updatedProspect);
    });

    it('should track status change in workflowHistory', async () => {
        (repositoryMock.get as any).mockResolvedValue(existingProspect);
        (repositoryMock.update as any).mockResolvedValue({
            ...existingProspect,
            status: ProspectStatus.CONTACTED,
        });

        await usecase.execute({
            id: 'prospect-1',
            status: ProspectStatus.CONTACTED,
        });

        expect(repositoryMock.update).toHaveBeenCalledWith(
            'prospect-1',
            expect.objectContaining({
                status: ProspectStatus.CONTACTED,
                workflowHistory: [
                    { status: 'create', date: now },
                    { status: ProspectStatus.CONTACTED, date: expect.any(Date) },
                ],
            })
        );
    });

    it('should not update workflowHistory when status unchanged', async () => {
        (repositoryMock.get as any).mockResolvedValue(existingProspect);
        (repositoryMock.update as any).mockResolvedValue(existingProspect);

        await usecase.execute({
            id: 'prospect-1',
            firstName: 'Johnny',
        });

        expect(repositoryMock.update).toHaveBeenCalledWith(
            'prospect-1',
            expect.objectContaining({
                workflowHistory: undefined,
            })
        );
    });

    it('should return null when prospect not found', async () => {
        (repositoryMock.get as any).mockResolvedValue(null);

        const result = await usecase.execute({
            id: 'prospect-999',
            firstName: 'Test',
        });

        expect(result).toBeNull();
        expect(repositoryMock.update).not.toHaveBeenCalled();
    });

    it('should return null when update returns null', async () => {
        (repositoryMock.get as any).mockResolvedValue(existingProspect);
        (repositoryMock.update as any).mockResolvedValue(null);

        const result = await usecase.execute({
            id: 'prospect-1',
            firstName: 'Johnny',
        });

        expect(result).toBeNull();
    });

    it('should log and throw when repository update fails', async () => {
        const failure = new Error('update failure');
        (repositoryMock.get as any).mockResolvedValue(existingProspect);
        (repositoryMock.update as any).mockRejectedValue(failure);

        await expect(usecase.execute({
            id: 'prospect-1',
            firstName: 'Johnny',
        })).rejects.toThrow(ERRORS.UPDATE_PROSPECT_USECASE);
        expect(loggerMock.error).toHaveBeenCalledWith(`UpdateProspectUsecase#execute => ${failure.message}`);
    });
});
