import { UnauthorizedException } from '@nestjs/common';
import { Inversify } from '@src/inversify/investify';
import { Role } from '@src/common/role.enum';
interface DeleteProgramUsecaseDto {
    id: string;
    session: {
        userId: string;
        role: Role;
    };
}

/**
 * Hard deletes a program.
 * Allowed for ADMIN or the entity owner (createdBy/userId).
 */
export class HardDeleteProgramUsecase {
    constructor(private inversify: Inversify) { }

    async execute(dto: DeleteProgramUsecaseDto): Promise<boolean> {
        const { id, session } = dto;

        const entity = await this.inversify.bddService.program.get({ id });

        if (!entity) {
            if (session.role === Role.ADMIN) return false;
            throw new Error('PROGRAM_NOT_FOUND');
        }

        if (session.role !== Role.ADMIN) {
            if (entity.createdBy !== session.userId && entity.userId !== session.userId) {
                throw new UnauthorizedException('NOT_AUTHORIZED_TO_HARD_DELETE_PROGRAM');
            }
        }

        return this.inversify.bddService.program.hardDelete(id);
    }
}
