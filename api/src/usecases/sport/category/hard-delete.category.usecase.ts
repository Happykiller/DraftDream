import { UnauthorizedException } from '@nestjs/common';
import { Inversify } from '@src/inversify/investify';
import { Role } from '@src/common/role.enum';
interface DeleteCategoryUsecaseDto {
    id: string;
    session: {
        userId: string;
        role: Role;
    };
}

/**
 * Hard deletes a category.
 * Allowed for ADMIN or the entity owner (createdBy).
 */
export class HardDeleteCategoryUsecase {
    constructor(private inversify: Inversify) { }

    async execute(dto: DeleteCategoryUsecaseDto): Promise<boolean> {
        const { id, session } = dto;

        const entity = await this.inversify.bddService.category.get({ id });

        if (!entity) {
            if (session.role === Role.ADMIN) return false;
            throw new Error('CATEGORY_NOT_FOUND');
        }

        if (session.role !== Role.ADMIN) {
            if (entity.createdBy !== session.userId) {
                throw new UnauthorizedException('NOT_AUTHORIZED_TO_HARD_DELETE_CATEGORY');
            }
        }

        return this.inversify.bddService.category.hardDelete(id);
    }
}
