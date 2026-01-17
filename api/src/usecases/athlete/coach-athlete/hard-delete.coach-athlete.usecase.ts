import { UnauthorizedException } from '@nestjs/common';
import { Inversify } from '@src/inversify/investify';
import { Role } from '@src/common/role.enum';
interface DeleteCoachAthleteLinkUsecaseDto {
    id: string;
    session: {
        userId: string;
        role: Role;
    };
}

/**
 * Hard deletes a coach-athlete link.
 * Allowed for ADMIN or the entity owner (createdBy).
 */
export class HardDeleteCoachAthleteLinkUsecase {
    constructor(private inversify: Inversify) { }

    async execute(dto: DeleteCoachAthleteLinkUsecaseDto): Promise<boolean> {
        const { id, session } = dto;

        const entity = await this.inversify.bddService.coachAthlete.get({ id });

        if (!entity) {
            if (session.role === Role.ADMIN) return false;
            throw new Error('COACH_ATHLETE_LINK_NOT_FOUND');
        }

        if (session.role !== Role.ADMIN) {
            if (entity.createdBy !== session.userId) {
                throw new UnauthorizedException('NOT_AUTHORIZED_TO_HARD_DELETE_COACH_ATHLETE_LINK');
            }
        }

        return this.inversify.bddService.coachAthlete.hardDelete(id);
    }
}
