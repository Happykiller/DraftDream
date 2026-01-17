import { UnauthorizedException } from '@nestjs/common';
import { Inversify } from '@src/inversify/investify';
import { Role } from '@src/common/role.enum';
interface DeleteExerciseUsecaseDto {
    id: string;
    session: {
        userId: string;
        role: Role;
    };
}

/**
 * Hard deletes an exercise.
 * Allowed for ADMIN or the entity owner (createdBy).
 */
export class HardDeleteExerciseUsecase {
    constructor(private inversify: Inversify) { }

    async execute(dto: DeleteExerciseUsecaseDto): Promise<boolean> {
        const { id, session } = dto;

        const entity = await this.inversify.bddService.exercise.get({ id });

        if (!entity) {
            if (session.role === Role.ADMIN) return false;
            throw new Error('EXERCISE_NOT_FOUND');
        }

        if (session.role !== Role.ADMIN) {
            if (entity.createdBy !== session.userId) {
                throw new UnauthorizedException('NOT_AUTHORIZED_TO_HARD_DELETE_EXERCISE');
            }
        }

        return this.inversify.bddService.exercise.hardDelete(id);
    }
}
