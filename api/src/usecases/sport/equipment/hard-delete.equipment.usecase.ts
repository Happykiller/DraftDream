import { UnauthorizedException } from '@nestjs/common';
import { Inversify } from '@src/inversify/investify';
import { Role } from '@src/common/role.enum';
interface DeleteEquipmentUsecaseDto {
    id: string;
    session: {
        userId: string;
        role: Role;
    };
}

/**
 * Hard deletes an equipment.
 * Allowed for ADMIN or the entity owner (createdBy).
 */
export class HardDeleteEquipmentUsecase {
    constructor(private inversify: Inversify) { }

    async execute(dto: DeleteEquipmentUsecaseDto): Promise<boolean> {
        const { id, session } = dto;

        const entity = await this.inversify.bddService.equipment.get({ id });

        if (!entity) {
            if (session.role === Role.ADMIN) return false;
            throw new Error('EQUIPMENT_NOT_FOUND');
        }

        if (session.role !== Role.ADMIN) {
            if (entity.createdBy !== session.userId) {
                throw new UnauthorizedException('NOT_AUTHORIZED_TO_HARD_DELETE_EQUIPMENT');
            }
        }

        return this.inversify.bddService.equipment.hardDelete(id);
    }
}
