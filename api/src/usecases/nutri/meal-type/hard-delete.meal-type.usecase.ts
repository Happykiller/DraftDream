import { UnauthorizedException } from '@nestjs/common';
import { Inversify } from '@src/inversify/investify';
import { Role } from '@src/common/role.enum';
interface DeleteMealTypeUsecaseDto {
    id: string;
    session: {
        userId: string;
        role: Role;
    };
}

/**
 * Hard deletes a meal type.
 * Allowed for ADMIN or the entity owner (createdBy).
 */
export class HardDeleteMealTypeUsecase {
    constructor(private inversify: Inversify) { }

    async execute(dto: DeleteMealTypeUsecaseDto): Promise<boolean> {
        const { id, session } = dto;

        const entity = await this.inversify.bddService.mealType.get({ id });

        if (!entity) {
            if (session.role === Role.ADMIN) return false;
            throw new Error('MEAL_TYPE_NOT_FOUND');
        }

        if (session.role !== Role.ADMIN) {
            if (entity.createdBy !== session.userId) {
                throw new UnauthorizedException('NOT_AUTHORIZED_TO_HARD_DELETE_MEAL_TYPE');
            }
        }

        return this.inversify.bddService.mealType.hardDelete(id);
    }
}
