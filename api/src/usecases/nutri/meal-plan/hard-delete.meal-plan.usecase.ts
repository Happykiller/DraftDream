import { UnauthorizedException } from '@nestjs/common';
import { Inversify } from '@src/inversify/investify';
import { Role } from '@src/common/role.enum';
interface DeleteMealPlanUsecaseDto {
    id: string;
    session: {
        userId: string;
        role: Role;
    };
}

/**
 * Hard deletes a meal plan.
 * Allowed for ADMIN or the entity owner (createdBy/userId).
 */
export class HardDeleteMealPlanUsecase {
    constructor(private inversify: Inversify) { }

    async execute(dto: DeleteMealPlanUsecaseDto): Promise<boolean> {
        const { id, session } = dto;

        const entity = await this.inversify.bddService.mealPlan.get({ id });

        if (!entity) {
            if (session.role === Role.ADMIN) return false;
            throw new Error('MEAL_PLAN_NOT_FOUND');
        }

        if (session.role !== Role.ADMIN) {
            if (entity.createdBy !== session.userId && entity.userId !== session.userId) {
                throw new UnauthorizedException('NOT_AUTHORIZED_TO_HARD_DELETE_MEAL_PLAN');
            }
        }

        return this.inversify.bddService.mealPlan.hardDelete(id);
    }
}
