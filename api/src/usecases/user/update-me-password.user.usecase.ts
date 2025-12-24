// src/usecases/user/update-me-password.user.usecase.ts
import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';

export class UpdateMePasswordUsecase {
    constructor(private readonly inversify: Inversify) { }

    async execute(id: string, password: string): Promise<boolean> {
        try {
            const hashed = await this.inversify.cryptService.hash({ message: password });
            const updated = await this.inversify.bddService.user.updatePassword(id, hashed);

            if (!updated) throw new Error(ERRORS.USER_NOT_FOUND);

            return updated;
        } catch (e: any) {
            this.inversify.loggerService.error(`UpdateMePasswordUsecase#execute => ${e?.message ?? e}`);
            throw normalizeError(e, ERRORS.UPDATE_USER_USECASE);
        }
    }
}
