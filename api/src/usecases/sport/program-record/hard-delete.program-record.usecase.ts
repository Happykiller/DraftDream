import { UnauthorizedException } from '@nestjs/common';
import { Inversify } from '@src/inversify/investify';
import { Role } from '@src/common/role.enum';
import { DeleteProgramRecordUsecaseDto } from './program-record.usecase.dto';

/**
 * Hard deletes a program record.
 * Typically reserved for admins or specific cleanup scenarios.
 */
export class HardDeleteProgramRecordUsecase {
    constructor(private inversify: Inversify) { }

    async execute(dto: DeleteProgramRecordUsecaseDto): Promise<boolean> {
        const { id, session } = dto;

        const record = await this.inversify.bddService.programRecord.get({ id });

        // If not found, only Admin might care or we just return false
        if (!record) {
            if (session.role === Role.ADMIN) return false;
            throw new Error('PROGRAM_RECORD_NOT_FOUND');
        }

        // Permission check
        // Allowing ADMIN, and potentially OWNERs if the product requirement allows users to permanently delete their data.
        // Given the task description asked for "apis pour delete... et une autre en hard delete" without restricting roles strictly in the prompt,
        // I will mirror the soft delete permissions but maybe safeguard it more? 
        // Usually Hard Delete is Admin only, but if data privacy is concerned, user might hard delete.
        // I'll stick to: Admin can always delete. Users can delete their own.
        if (session.role !== Role.ADMIN) {
            if (record.userId !== session.userId && record.createdBy !== session.userId) {
                throw new UnauthorizedException('NOT_AUTHORIZED_TO_HARD_DELETE_PROGRAM_RECORD');
            }
        }

        return this.inversify.bddService.programRecord.hardDelete(id);
    }
}
