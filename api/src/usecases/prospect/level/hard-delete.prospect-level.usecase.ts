import { UnauthorizedException } from '@nestjs/common';
import { Inversify } from '@src/inversify/investify';
import { Role } from '@src/common/role.enum';

interface DeleteProspectLevelUsecaseDto {
    id: string;
    session: {
        userId: string;
        role: Role;
    };
}

/**
 * Hard deletes a prospect level.
 * Allowed for ADMIN or the entity owner (createdBy).
 */
export class HardDeleteProspectLevelUsecase {
    constructor(private inversify: Inversify) { }

    async execute(dto: DeleteProspectLevelUsecaseDto): Promise<boolean> {
        const { id, session } = dto;

        const entity = await this.inversify.bddService.prospectLevel.get({ id });

        if (!entity) {
            if (session.role === Role.ADMIN) return false;
            throw new Error('PROSPECT_LEVEL_NOT_FOUND');
        }

        if (session.role !== Role.ADMIN) {
            if (entity.createdBy !== session.userId) {
                throw new UnauthorizedException('NOT_AUTHORIZED_TO_HARD_DELETE_PROSPECT_LEVEL');
            }
        }

        return this.inversify.bddService.prospectLevel.hardDelete(id);
    }
}
