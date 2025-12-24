// src/usecases/user/update-password.user.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';
import { UpdateUserPasswordUsecaseDto } from '@usecases/user/user.usecase.dto';

export class UpdateUserPasswordUsecase {
    constructor(private readonly inversify: Inversify) { }

    async execute(dto: UpdateUserPasswordUsecaseDto): Promise<boolean> {
        try {
            const hashed = await this.inversify.cryptService.hash({ message: dto.password });
            const updated = await this.inversify.bddService.user.updatePassword(dto.id, hashed);

            if (!updated) throw new Error(ERRORS.USER_NOT_FOUND);

            return updated;
        } catch (e: any) {
            this.inversify.loggerService.error(`UpdateUserPasswordUsecase#execute => ${e?.message ?? e}`);
            throw normalizeError(e, ERRORS.UPDATE_USER_USECASE);
        }
    }
}
