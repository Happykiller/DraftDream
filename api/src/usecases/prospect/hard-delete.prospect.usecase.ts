import { UnauthorizedException } from '@nestjs/common';
import { Inversify } from '@src/inversify/investify';
import { Role } from '@src/common/role.enum';

interface DeleteProspectUsecaseDto {
    id: string;
    session: {
        userId: string;
        role: Role;
    };
}

/**
 * Hard deletes a prospect.
 * Allowed for ADMIN or the entity owner (createdBy).
 */
export class HardDeleteProspectUsecase {
    constructor(private inversify: Inversify) { }

    async execute(dto: DeleteProspectUsecaseDto): Promise<boolean> {
        const { id, session } = dto;

        const entity = await this.inversify.bddService.prospect.get({ id });

        if (!entity) {
            if (session.role === Role.ADMIN) return false;
            throw new Error('PROSPECT_NOT_FOUND');
        }

        if (session.role !== Role.ADMIN) {
            if (entity.createdBy !== session.userId) {
                throw new UnauthorizedException('NOT_AUTHORIZED_TO_HARD_DELETE_PROSPECT');
            }
        }

        return this.inversify.bddService.prospect.hardDelete(id);
    }
}
