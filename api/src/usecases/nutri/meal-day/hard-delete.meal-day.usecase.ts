import { UnauthorizedException } from '@nestjs/common';
import { Inversify } from '@src/inversify/investify';
import { Role } from '@src/common/role.enum';
interface DeleteMealDayUsecaseDto {
    id: string;
    session: {
        userId: string;
        role: Role;
    };
}

/**
 * Hard deletes a meal day.
 * Allowed for ADMIN or the entity owner (createdBy).
 */
export class HardDeleteMealDayUsecase {
    constructor(private inversify: Inversify) { }

    async execute(dto: DeleteMealDayUsecaseDto): Promise<boolean> {
        const { id, session } = dto;

        const entity = await this.inversify.bddService.mealDay.get({ id });

        if (!entity) {
            if (session.role === Role.ADMIN) return false;
            throw new Error('MEAL_DAY_NOT_FOUND');
        }

        if (session.role !== Role.ADMIN) {
            if (entity.createdBy !== session.userId) {
                throw new UnauthorizedException('NOT_AUTHORIZED_TO_HARD_DELETE_MEAL_DAY');
            }
        }

        return this.inversify.bddService.mealDay.hardDelete(id);
    }
}
