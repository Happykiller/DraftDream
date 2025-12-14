import { ERRORS } from '@src/common/ERROR';
import { normalizeError } from '@src/common/error.util';
import { Inversify } from '@src/inversify/investify';

export class HardDeleteUserUsecase {
    inversify: Inversify;

    constructor(inversify: Inversify) {
        this.inversify = inversify;
    }

    async execute(id: string): Promise<boolean> {
        try {
            const deleted: boolean = await this.inversify.bddService.user.hardDeleteUser(id);
            return deleted;
        } catch (e) {
            this.inversify.loggerService.error(`HardDeleteUserUsecase#execute=>${e?.message ?? e}`);
            throw normalizeError(e, ERRORS.DELETE_USER_USECASE);
        }
    }
}
