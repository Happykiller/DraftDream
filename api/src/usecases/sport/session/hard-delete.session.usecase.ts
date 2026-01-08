import { UnauthorizedException } from '@nestjs/common';
import { Inversify } from '@src/inversify/investify';
import { Role } from '@src/common/role.enum';
interface DeleteSessionUsecaseDto {
    id: string;
    session: {
        userId: string;
        role: Role;
    };
}

/**
 * Hard deletes a session.
 * Allowed for ADMIN or the entity owner (createdBy).
 */
export class HardDeleteSessionUsecase {
    constructor(private inversify: Inversify) { }

    async execute(dto: DeleteSessionUsecaseDto): Promise<boolean> {
        const { id, session } = dto;

        const entity = await this.inversify.bddService.session.get({ id });

        if (!entity) {
            if (session.role === Role.ADMIN) return false;
            throw new Error('SESSION_NOT_FOUND');
        }

        if (session.role !== Role.ADMIN) {
            if (entity.createdBy !== session.userId) {
                throw new UnauthorizedException('NOT_AUTHORIZED_TO_HARD_DELETE_SESSION');
            }
        }

        return this.inversify.bddService.session.hardDelete(id);
    }
}
