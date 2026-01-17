import { UnauthorizedException } from '@nestjs/common';
import { Inversify } from '@src/inversify/investify';
import { Role } from '@src/common/role.enum';
interface DeleteMealUsecaseDto {
    id: string;
    session: {
        userId: string;
        role: Role;
    };
}

/**
 * Hard deletes a meal.
 * Allowed for ADMIN or the entity owner (createdBy).
 */
export class HardDeleteMealUsecase {
    constructor(private inversify: Inversify) { }

    async execute(dto: DeleteMealUsecaseDto): Promise<boolean> {
        const { id, session } = dto;

        const entity = await this.inversify.bddService.meal.get({ id });

        if (!entity) {
            if (session.role === Role.ADMIN) return false;
            throw new Error('MEAL_NOT_FOUND');
        }

        if (session.role !== Role.ADMIN) {
            if (entity.createdBy !== session.userId) {
                throw new UnauthorizedException('NOT_AUTHORIZED_TO_HARD_DELETE_MEAL');
            }
        }

        return this.inversify.bddService.meal.hardDelete(id);
    }
}
