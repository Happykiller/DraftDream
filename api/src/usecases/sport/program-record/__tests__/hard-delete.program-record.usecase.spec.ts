import { beforeEach, describe, expect, it } from '@jest/globals';
import { UnauthorizedException } from '@nestjs/common';

import { Role } from '@src/common/role.enum';
import { Inversify } from '@src/inversify/investify';
import { BddServiceMongo } from '@services/db/mongo/db.service.mongo';
import { BddServiceProgramRecordMongo } from '@services/db/mongo/repositories/program-record.repository';
import { ProgramRecord } from '@services/db/models/program-record.model';
import { HardDeleteProgramRecordUsecase } from '@src/usecases/sport/program-record/hard-delete.program-record.usecase';
import { DeleteProgramRecordUsecaseDto } from '@src/usecases/sport/program-record/program-record.usecase.dto';
import { asMock, createMockFn } from '@src/test-utils/mock-helpers';
import { ProgramRecordState } from '@src/common/program-record-state.enum';

describe('HardDeleteProgramRecordUsecase', () => {
    let inversifyMock: Inversify;
    let bddServiceMock: BddServiceMongo;
    let programRecordRepositoryMock: BddServiceProgramRecordMongo;
    let usecase: HardDeleteProgramRecordUsecase;

    const session = { userId: 'athlete-1', role: Role.ATHLETE };
    const dto: DeleteProgramRecordUsecaseDto = {
        id: 'record-1',
        session,
    };

    const record: ProgramRecord = {
        id: 'record-1',
        userId: 'athlete-1',
        programId: 'program-1',
        state: ProgramRecordState.CREATE,
        createdBy: 'athlete-1',
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    beforeEach(() => {
        programRecordRepositoryMock = {
            get: createMockFn(),
            hardDelete: createMockFn(),
        } as unknown as BddServiceProgramRecordMongo;

        bddServiceMock = {
            programRecord: programRecordRepositoryMock,
        } as unknown as BddServiceMongo;

        inversifyMock = {
            bddService: bddServiceMock,
        } as unknown as Inversify;

        usecase = new HardDeleteProgramRecordUsecase(inversifyMock);
    });

    it('should hard delete a program record if user is owner', async () => {
        asMock(programRecordRepositoryMock.get).mockResolvedValue(record);
        asMock(programRecordRepositoryMock.hardDelete).mockResolvedValue(true);

        const result = await usecase.execute(dto);

        expect(result).toBe(true);
        const hardDeleteMock = asMock(programRecordRepositoryMock.hardDelete);
        expect(hardDeleteMock.mock.calls.length).toBe(1);
        expect(hardDeleteMock.mock.calls[0][0]).toBe('record-1');
    });

    it('should hard delete a program record if user is admin', async () => {
        asMock(programRecordRepositoryMock.get).mockResolvedValue(record);
        asMock(programRecordRepositoryMock.hardDelete).mockResolvedValue(true);

        const result = await usecase.execute({
            ...dto,
            session: { userId: 'admin-1', role: Role.ADMIN },
        });

        expect(result).toBe(true);
        const hardDeleteMock = asMock(programRecordRepositoryMock.hardDelete);
        expect(hardDeleteMock.mock.calls.length).toBe(1);
        expect(hardDeleteMock.mock.calls[0][0]).toBe('record-1');
    });

    it('should throw unauthorized if user is not owner and not admin', async () => {
        asMock(programRecordRepositoryMock.get).mockResolvedValue(record);

        await expect(
            usecase.execute({
                ...dto,
                session: { userId: 'athlete-2', role: Role.ATHLETE },
            }),
        ).rejects.toThrow(UnauthorizedException);

        expect(asMock(programRecordRepositoryMock.hardDelete).mock.calls.length).toBe(0);
    });

    it('should throw error if record not found', async () => {
        asMock(programRecordRepositoryMock.get).mockResolvedValue(null);

        await expect(usecase.execute(dto)).rejects.toThrow('PROGRAM_RECORD_NOT_FOUND');
    });
});
