import { beforeEach, describe, expect, it, afterEach, jest } from '@jest/globals';
import { mock, MockProxy } from 'jest-mock-extended';

import { ERRORS } from '@src/common/ERROR';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceProspectMongo } from '@services/db/mongo/repositories/prospect/prospect.repository';
import { DeleteProspectUsecase } from '@usecases/prospect/prospect/delete.prospect.usecase';

interface LoggerMock {
    error: (message: string) => void;
}

describe('DeleteProspectUsecase', () => {
    let inversifyMock: MockProxy<Inversify>;
    let bddServiceMock: MockProxy<BddServiceMongo>;
    let repositoryMock: MockProxy<BddServiceProspectMongo>;
    let loggerMock: MockProxy<LoggerMock>;
    let usecase: DeleteProspectUsecase;

    beforeEach(() => {
        inversifyMock = mock<Inversify>();
        bddServiceMock = mock<BddServiceMongo>();
        repositoryMock = mock<BddServiceProspectMongo>();
        loggerMock = mock<LoggerMock>();

        (bddServiceMock as unknown as { prospect: BddServiceProspectMongo }).prospect = repositoryMock;
        inversifyMock.bddService = bddServiceMock as unknown as BddServiceMongo;
        inversifyMock.loggerService = loggerMock;

        usecase = new DeleteProspectUsecase(inversifyMock);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should build', () => {
        expect(usecase).toBeDefined();
    });

    it('should soft delete a prospect successfully', async () => {
        repositoryMock.delete.mockResolvedValue(true);

        const result = await usecase.execute({ id: 'prospect-1' });

        expect(repositoryMock.delete).toHaveBeenCalledWith('prospect-1');
        expect(result).toBe(true);
    });

    it('should return false when deletion fails', async () => {
        repositoryMock.delete.mockResolvedValue(false);

        const result = await usecase.execute({ id: 'prospect-999' });

        expect(result).toBe(false);
    });

    it('should log and throw when repository delete fails', async () => {
        const failure = new Error('delete failure');
        repositoryMock.delete.mockRejectedValue(failure);

        await expect(usecase.execute({ id: 'prospect-1' })).rejects.toThrow(ERRORS.DELETE_PROSPECT_USECASE);
        expect(loggerMock.error).toHaveBeenCalledWith(`DeleteProspectUsecase#execute => ${failure.message}`);
    });
});
