import { UnauthorizedException } from '@nestjs/common';
import { Inversify } from '@src/inversify/investify';
import { Role } from '@src/common/role.enum';

interface DeleteProspectSourceUsecaseDto {
    id: string;
    session: {
        userId: string;
        role: Role;
    };
}

/**
 * Hard deletes a prospect source.
 * Allowed for ADMIN or the entity owner (createdBy).
 */
export class HardDeleteProspectSourceUsecase {
    constructor(private inversify: Inversify) { }

    async execute(dto: DeleteProspectSourceUsecaseDto): Promise<boolean> {
        const { id, session } = dto;

        const entity = await this.inversify.bddService.prospectSource.get({ id });

        if (!entity) {
            if (session.role === Role.ADMIN) return false;
            throw new Error('PROSPECT_SOURCE_NOT_FOUND');
        }

        if (session.role !== Role.ADMIN) {
            if (entity.createdBy !== session.userId) {
                throw new UnauthorizedException('NOT_AUTHORIZED_TO_HARD_DELETE_PROSPECT_SOURCE');
            }
        }

        return this.inversify.bddService.prospectSource.hardDelete(id);
    }
}
