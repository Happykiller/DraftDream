import { UnauthorizedException } from '@nestjs/common';
import { Inversify } from '@src/inversify/investify';
import { Role } from '@src/common/role.enum';
interface DeleteTagUsecaseDto {
    id: string;
    session: {
        userId: string;
        role: Role;
    };
}

/**
 * Hard deletes a tag.
 * Allowed for ADMIN or the entity owner (createdBy).
 */
export class HardDeleteTagUsecase {
    constructor(private inversify: Inversify) { }

    async execute(dto: DeleteTagUsecaseDto): Promise<boolean> {
        const { id, session } = dto;

        const entity = await this.inversify.bddService.tag.get({ id });

        if (!entity) {
            if (session.role === Role.ADMIN) return false;
            throw new Error('TAG_NOT_FOUND');
        }

        if (session.role !== Role.ADMIN) {
            if (entity.createdBy !== session.userId) {
                throw new UnauthorizedException('NOT_AUTHORIZED_TO_HARD_DELETE_TAG');
            }
        }

        return this.inversify.bddService.tag.hardDelete(id);
    }
}
