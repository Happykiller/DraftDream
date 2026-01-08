import { UnauthorizedException } from '@nestjs/common';
import { Inversify } from '@src/inversify/investify';
import { Role } from '@src/common/role.enum';

interface DeleteProspectObjectiveUsecaseDto {
    id: string;
    session: {
        userId: string;
        role: Role;
    };
}

/**
 * Hard deletes a prospect objective.
 * Allowed for ADMIN or the entity owner (createdBy).
 */
export class HardDeleteProspectObjectiveUsecase {
    constructor(private inversify: Inversify) { }

    async execute(dto: DeleteProspectObjectiveUsecaseDto): Promise<boolean> {
        const { id, session } = dto;

        const entity = await this.inversify.bddService.prospectObjective.get({ id });

        if (!entity) {
            if (session.role === Role.ADMIN) return false;
            throw new Error('PROSPECT_OBJECTIVE_NOT_FOUND');
        }

        if (session.role !== Role.ADMIN) {
            if (entity.createdBy !== session.userId) {
                throw new UnauthorizedException('NOT_AUTHORIZED_TO_HARD_DELETE_PROSPECT_OBJECTIVE');
            }
        }

        return this.inversify.bddService.prospectObjective.hardDelete(id);
    }
}
