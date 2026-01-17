import { UnauthorizedException } from '@nestjs/common';
import { Inversify } from '@src/inversify/investify';
import { Role } from '@src/common/role.enum';
interface DeleteMuscleUsecaseDto {
    id: string;
    session: {
        userId: string;
        role: Role;
    };
}

/**
 * Hard deletes a muscle.
 * Allowed for ADMIN or the entity owner (createdBy).
 */
export class HardDeleteMuscleUsecase {
    constructor(private inversify: Inversify) { }

    async execute(dto: DeleteMuscleUsecaseDto): Promise<boolean> {
        const { id, session } = dto;

        const entity = await this.inversify.bddService.muscle.get({ id });

        if (!entity) {
            if (session.role === Role.ADMIN) return false;
            throw new Error('MUSCLE_NOT_FOUND');
        }

        if (session.role !== Role.ADMIN) {
            if (entity.createdBy !== session.userId) {
                throw new UnauthorizedException('NOT_AUTHORIZED_TO_HARD_DELETE_MUSCLE');
            }
        }

        return this.inversify.bddService.muscle.hardDelete(id);
    }
}
