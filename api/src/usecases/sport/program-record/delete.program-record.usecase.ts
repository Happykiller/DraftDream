import { UnauthorizedException } from '@nestjs/common';
import { Inversify } from '@src/inversify/investify';
import { Role } from '@src/common/role.enum';
import { DeleteProgramRecordUsecaseDto } from './program-record.usecase.dto';

export class DeleteProgramRecordUsecase {
    constructor(private inversify: Inversify) { }

    async execute(dto: DeleteProgramRecordUsecaseDto): Promise<boolean> {
        const { id, session } = dto;

        const record = await this.inversify.bddService.programRecord.get({ id });
        if (!record) {
            if (session.role === Role.ADMIN) return false;
            throw new Error('PROGRAM_RECORD_NOT_FOUND');
        }

        if (session.role !== Role.ADMIN) {
            // Owner check
            if (record.userId !== session.userId && record.createdBy !== session.userId) {
                throw new UnauthorizedException('NOT_AUTHORIZED_TO_DELETE_PROGRAM_RECORD');
            }
        }

        return this.inversify.bddService.programRecord.softDelete(id);
    }
}
