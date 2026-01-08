import { UnauthorizedException } from '@nestjs/common';
import { Inversify } from '@src/inversify/investify';
import { Role } from '@src/common/role.enum';

interface DeleteProspectActivityPreferenceUsecaseDto {
    id: string;
    session: {
        userId: string;
        role: Role;
    };
}

/**
 * Hard deletes a prospect activity preference.
 * Allowed for ADMIN or the entity owner (createdBy).
 */
export class HardDeleteProspectActivityPreferenceUsecase {
    constructor(private inversify: Inversify) { }

    async execute(dto: DeleteProspectActivityPreferenceUsecaseDto): Promise<boolean> {
        const { id, session } = dto;

        const entity = await this.inversify.bddService.prospectActivityPreference.get({ id });

        if (!entity) {
            if (session.role === Role.ADMIN) return false;
            throw new Error('PROSPECT_ACTIVITY_PREFERENCE_NOT_FOUND');
        }

        if (session.role !== Role.ADMIN) {
            if (entity.createdBy !== session.userId) {
                throw new UnauthorizedException('NOT_AUTHORIZED_TO_HARD_DELETE_PROSPECT_ACTIVITY_PREFERENCE');
            }
        }

        return this.inversify.bddService.prospectActivityPreference.hardDelete(id);
    }
}
